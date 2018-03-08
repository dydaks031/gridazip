const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const mailHelper = require('../../services/mail/helper');
const resHelper = require('../../services/response/helper');
const randomHelper = require('../../services/random/helper');
const formatHelper = require('../../services/format/helper');
const smsHelper = require('../../services/sms/helper');
const moment = require('moment');

router.post('/sms/request', (req, res, next) => {
  const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
  let inputPhoneNumber = req.body.phone || '';
  let errorMsg = null;

  if (inputPhoneNumber === '') {
    errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
  }
  else if (regexPhone.test(inputPhoneNumber) === false) {
    errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
  }
  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  const phoneNumber = inputPhoneNumber.replace(/[^\d]/g, '');
  const cryptedPhoneNumber = cryptoHelper.encrypt(phoneNumber);
  const authKey = formatHelper.lpad((Math.floor(Math.random() * 100) + 1), 2, '0');
  const msg = `[그리다집] 인증번호는 (${authKey}) 입니다. 정확히 입력해주세요.`;
  knexBuilder.getConnection().then(cur => {
    cur('authentication_tbl')
      .select('*')
      .where({auth_phone: cryptedPhoneNumber})
      .limit(1)
      .then(response => {
        if (response.length < 1) {
          return cur('authentication_tbl').insert({
            auth_phone: cryptedPhoneNumber,
            auth_key: authKey,
            auth_limited_minute: 3
          })
        }
        else {
          return cur('authentication_tbl').update({auth_key: authKey}).where({auth_phone: cryptedPhoneNumber})
        }
      })
      .then(response => {
        // smsHelper.send('01088329144', msg)
        smsHelper.send(phoneNumber, msg)
          .then(response => {
            res.json(
              resHelper.getJson({msg: '인증번호가 발송되었습니다.\n아래 인증번호란에 기입해주시기 바랍니다.'})
            );
          })
          .catch(error => {
            res.json(
              resHelper.getError({value: 'SMS 발송 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.'})
            );
          });
      })
      .catch(reason => {
        console.error(reason);
      });
  });
});

router.post('/sms/validate', (req, res, next) => {
  const session = req.session;
  const inputAuthKey = req.body.authKey || '';
  let inputPhoneNumber = req.body.phone || '';
  const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

  let errorMsg = null;
  let smsObj = null;

  if (inputAuthKey === '') {
    errorMsg = '인증번호를 입력해주세요.';
  }
  else if (inputPhoneNumber === '') {
    errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
  }
  else if (regexPhone.test(inputPhoneNumber) === false) {
    errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
  }
  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    const phoneNumber = inputPhoneNumber.replace(/[^\d]/g, '');
    const cryptedPhoneNumber = cryptoHelper.encrypt(phoneNumber);
    knexBuilder.getConnection().then(cur => {
      cur('authentication_tbl')
        .select('*')
        .where({auth_phone: cryptedPhoneNumber})
        .then(response => {
          console.log(response);
          if (response.length < 1) {
            res.json(
              resHelper.getError('오류가 발생하였습니다. 인증번호를 다시 요청해주세요.')
            )
          }
          else {
            smsObj = response[0];
            if (smsObj.auth_key !== inputAuthKey) {
              res.json(
                resHelper.getError('인증번호가 일치하지 않습니다. 다시 입력해주세요.')
              )
            }
            else {
              let limitedDt = moment(smsObj.auth_mod_dt).add(smsObj.auth_limited_minute, 'm');
              let now = moment.utc();
              //286239000
              //318486525
              if (limitedDt.unix() < now.unix()) {
                res.json(
                  resHelper.getError('만료된 인증번호입니다. 인증번호를 다시 요청해주세요.')
                )
              }
              else {
                session.smsValidated = true;
                res.json(
                  resHelper.getJson({
                    msg: '인증되었습니다.'
                  })
                )
              }
            }
          }
        })

    })
  }



});

module.exports = router;