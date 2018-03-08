const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const s3Helper = require('../../services/s3/helper');
const mailHelper = require('../../services/mail/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');
const randomHelper = require('../../services/random/helper');
const smsHelper = require('../../services/sms/helper');
const path = require('path');
const fs = require('fs');
const pdf2images = require('pdf2images');
const moment = require('moment');
const calc = require('calculator');

router.post('/', (req, res, next) => {
    var input = path.join(__dirname + '/../../public/scripts/pdf/files/example2.pdf');
    var convert_options = {
        '-trim': '',
        '-density': 150,
        '-quality': 100,
        '-sharpen': '0x1.0'
    };

    pdf2images.convert(input, {
        convert_options: convert_options
    })
        .then(
        convertResponse => {
            var imageCount = 1;
            knexBuilder.getConnection().then(cur => {
                cur('resource_document_group_tbl').returning('rg_pk').insert({
                    rg_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                }).then(response => {
                    const documentGroupID = response[0];
                    convertResponse.images.map(data => {
                        (() => {
                            const fixedIndex = imageCount;
                            randomHelper.getString().then(hash => {
                                s3Helper.save(`static/resources/pdf/${hash}.png`, data)
                                    .then(data => {
                                        cur('resource_document_hst').insert({
                                            rd_rgpk: documentGroupID,
                                            rd_url: data,
                                            rd_order: fixedIndex,
                                            rd_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                        })
                                            .then(response => {
                                            })
                                            .catch(reason => {
                                                throw reason;
                                            });
                                    })
                                    .catch(err => {
                                        console.error(err);
                                    });
                            });
                        })();
                        imageCount++;
                    });
                    res.json(
                        resHelper.getJson({
                            value: 'OK'
                        })
                    );
                })
                    .catch(reason => {
                        res.json(
                            resHelper.getError('리소스 그룹을 저장하는 단계에서 문제가 발생했습니다.')
                        );
                    });
            });
        },
        err => {
            console.log(err);
        }
        );
});

router.post('/sms', (req, res, next) => {
    smsHelper.send('01088329144', '테스트')
        .then(response => {
          console.log(response);
            res.json(
                resHelper.getJson(response)
            );
        })
        .catch(error => {
          console.error(error);
            res.json(
                resHelper.getError(error)
            );
        });
});

router.post('/mail', (req, res, next) => {
    mailHelper.getTemplate('content');
});

router.post('/template', (req, res, next) => {
    mailHelper.getTemplate('content')
        .then(result => {
            res.end(result.html);
        })
        .catch(reason => {
            console.error(reason);
        });
});

router.post('/moment', (req, res, next) => {
  let now = moment();
  console.log(now);
  res.json(
    resHelper.getJson(process.env.NODE_ENV)
  );
});

router.post('/session', (req, res, next) => {
  console.log(req.session.a);
  req.session.smsValidated = null;
  res.json(
    resHelper.getJson('')
  );
});

router.post('/calc', (req, res, next) => {
  console.log(calc);

  let r = calc.func('f(x) = x');
  console.log(r);
  console.log(r(4));
  res.json(resHelper.getJson(r(4)));
});

module.exports = router;