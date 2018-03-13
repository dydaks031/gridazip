const express = require('express');
const router = express.Router();
const appConfig = require('../../services/app/config');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');
const mailHelper = require('../../services/mail/helper');
const marked = require('marked');
const moment = require('moment');

const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

router.post('/save', (req, res, next) => {
  var user_name = req.body['user_name'] || '';
  var user_family = req.body['user_family'] || '';
  var user_size = req.body['user_size'] || '';
  var user_address_brief = req.body['user_address_brief'] || '';
  var user_address_detail = req.body['user_address_detail'] || '';
  var user_phone = req.body['user_phone'] || '';
  var user_move_date = req.body['user_move_date'] || '';
  var user_style_likes = req.body['user_style_likes'] || '';
  var user_style_dislikes = req.body['user_style_dislikes'] || '';
  var user_color_likes = req.body['user_color_likes'] || '';
  var user_color_dislikes = req.body['user_color_dislikes'] || '';
  var user_budget = req.body['user_budget'] || '';
  var user_place = req.body['user_place'] || '';
  var user_date = req.body['user_date'] || '';
  var user_time = req.body['user_time'] || '';
  var user_request = req.body['user_request'] || '';

  const session = req.session;

  var request_size_map = {
    '': '평수 없음',
    'lt20': '20평대 미만',
    'eq20': '20평대',
    'eq30': '30평대',
    'eq40': '40평대',
    'eq50': '50평대',
    'eq60': '60평대',
    'gte70': '70평대 이상'
  };

  var request_budget_map = {
    '': '예산 선택안함',
    '1500~2000': '1500~2000만원',
    '2000~2500': '2000~2500만원',
    '2500~3000': '2500~3000만원',
    '3000~3500': '3000~3500만원',
    '3500~4000': '3500~4000만원',
    '4000~4500': '4000~4500만원',
    '4500~5000': '4500~5000만원',
    '5000~5500': '5000~5500만원',
    '5500~6000': '5500~6000만원',
    '6000~6500': '6000~6500만원',
    '6500~7000': '6500~7000만원',
    'lt1500': '1500만원 미만',
    'lt2000': '2000만원 미만',
    'lt2500': '2500만원 미만',
    'lt3000': '3000만원 미만',
    'lt3500': '3500만원 미만',
    'lt4000': '4000만원 미만',
    'lt4500': '4500만원 미만',
    'lt5000': '5000만원 미만',
    'gte2500': '2500만원 이상',
    'gte3000': '3000만원 이상',
    'gte3500': '3500만원 이상',
    'gte4000': '4000만원 이상',
    'gte4500': '4500만원 이상',
    'gte5000': '5000만원 이상',
    'gte6000': '6000만원 이상',
    'gte7000': '7000만원 이상',
    'contact': '협의로 결정'
  };

  let errorMsg = null;
  let smsValidated = session.smsValidated === 'true';

  if (typeof session !== 'undefined' && smsValidated === true && smsValidated !== null) {
    errorMsg = '인증번호 확인이 필요합니다.';
  }
  if (user_name === '') {
    errorMsg = '이름은 반드시 입력해야 합니다.';
  }
  /*
  else if (user_family === '') {
      errorMsg = '가족구성원 항목은 반드시 선택해야 합니다.';
  }
  else if (user_size === '') {
      errorMsg = '평수 항목은 반드시 선택해야 합니다.';
  }
  else if (user_budget === '') {
      errorMsg = '예산 항목은 반드시 선택해야 합니다.';
  }
  else if (user_address_brief === '') {
      errorMsg = '기본주소는 반드시 입력해야 합니다.';
  }
  else if (user_address_detail === '') {
      errorMsg = '상세주소는 반드시 입력해야 합니다.';
  }
  */
  else if (user_phone === '') {
    errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
  }
  else if (regexPhone.test(user_phone) === false) {
    errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
  }
  /*
  else if (user_move_date === '') {
      errorMsg = '이사 날짜는 반드시 입력해야 합니다.';
  }
  else if (
      user_date !== '' &&
      user_time === ''
  ) {
      errorMsg = '방문 상담 시간을 선택해주세요.';
  }
  else if (
      user_time !== '' &&
      user_date === ''
  ) {
      errorMsg = '방문 상담 날짜를 선택해주세요.';
  }
  else if (Object.keys(request_size_map).indexOf(user_size) === -1) {
      errorMsg = '허용되지 않는 평수입니다.';
  }
  else if (
      user_budget !== '' &&
      Object.keys(request_budget_map).indexOf(user_budget) === -1
  ) {
      errorMsg = '허용되지 않는 예산 타입입니다.';
  }


  */

  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  }
  else {
    req.session.smsValidated = null;

    var user_budget_format = request_budget_map[user_budget];
    var user_size_format = request_size_map[user_size];

    user_phone = user_phone.replace(/[^\d]/g, '');
    knexBuilder.getConnection().then(cur => {
      cur('request_tbl').insert({
        rq_name: user_name,
        rq_family: user_family,
        rq_size: user_size,
        rq_address_brief: user_address_brief,
        rq_address_detail: user_address_detail,
        rq_phone: cryptoHelper.encrypt(user_phone),
        rq_move_date: user_move_date,
        rq_style_likes: user_style_likes,
        rq_style_dislikes: user_style_dislikes,
        rq_color_likes: user_color_likes,
        rq_color_dislikes: user_color_dislikes,
        rq_budget: user_budget,
        rq_place: user_place,
        rq_date: user_date,
        rq_time: user_time,
        rq_request: user_request,
        rq_recency: cur.raw('UNIX_TIMESTAMP() * -1')
      })
        .then(response => {
          var title = `[상담신청] ${user_name} | ${user_budget_format}`;

          if (user_date !== '') {
            title += ` ${user_date}`;
          }

          if (user_time !== '') {
            title += ` ${user_time}`;
          }

          var today = moment().format('YYYY년 MM월 DD일 HH시 mm분');

          var content = `> ${today}에 신청한 요청입니다.

# 필수정보
- **신청자**: ${user_name}
- **연락처**: ${user_phone}
- **가족구성원**: ${user_family}
- **평수**: ${user_size_format}
- **이사날짜**: ${user_move_date}
- **주소**:

    ${user_address_brief}

    ${user_address_detail}`;

          if (
            user_budget !== '' ||
            user_place !== '' ||
            user_date !== '' ||
            user_time !== ''
          ) {
            content += `
----

# 추가정보`;
          }

          if (user_budget !== '') {
            content += `\n- **예산**: ${user_budget_format}`;
          }

          if (user_place !== '') {
            content += `\n- **방문장소**: ${user_place}`;
          }

          if (user_date !== '') {
            content += `\n- **방문날짜**: ${user_date}`;
          }

          if (user_time !== '') {
            content += `\n- **방문시간**: ${user_time}`;
          }

          if (
            user_style_likes !== '' ||
            user_color_likes !== '' ||
            user_style_dislikes !== '' ||
            user_color_dislikes !== ''
          ) {
            content += `
----

# 요구정보`;
          }

          if (user_style_likes !== '') {
            content += `\n- **좋아하는 스타일**: ${user_style_likes}`;
          }

          if (user_color_likes !== '') {
            content += `\n- **좋아하는 컬러**: ${user_color_likes}`;
          }

          if (user_style_dislikes !== '') {
            content += `\n- **싫어하는 스타일** ${user_style_dislikes}`;
          }

          if (user_color_dislikes !== '') {
            content += `\n- **싫어하는 컬러** ${user_color_dislikes}`;
          }

          if (user_request !== '') {
            content += `
----

# 요청사항
\`\`\`
${user_request}
\`\`\`
`;
          }

          mailHelper.getTemplate('content', {
            title: '무료견적 신청',
            body: marked(content)
          })
            .then(result => {
              mailHelper.send(
                appConfig.mail.info,
                title,
                result.html
              )
                .then(data => {
                    console.log(data);
                  ;
                })
                .catch(reason => {
                  console.error(reason);
                });

              res.json(
                resHelper.getJson({
                  msg: 'OK'
                })
              );

            })
            .catch(reason => {
              console.error(reason);
            });
        })
        .catch(reason => {
          res.json(
            resHelper.getError('회원가입 처리를 진행하는 도중 알 수 없는 문제가 발생했습니다.')
          );
          throw reason;
        });
    });
  }
});

module.exports = router;