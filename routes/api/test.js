const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const s3Helper = require('../../services/s3/helper');
const mailHelper = require('../../services/mail/helper');
const resHelper = require('../../services/response/helper');
const randomHelper = require('../../services/random/helper');
const smsHelper = require('../../services/sms/helper');
const path = require('path');
const pdf2images = require('pdf2images');
const moment = require('moment');
const calc = require('calculator');

router.post('/', (req, res) => {
  let input = path.join(__dirname + '/../../public/scripts/pdf/files/example2.pdf');
  let convert_options = {
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
        let imageCount = 1;
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
            .catch(() => {
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

router.post('/sms', (req, res) => {
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

// router.post('/mail', (req, res, next) => {
//   mailHelper.getTemplate('content');
// });

router.post('/template', (req, res) => {
  mailHelper.getTemplate('content')
    .then(result => {
      res.end(result.html);
    })
    .catch(reason => {
      console.error(reason);
    });
});

router.post('/moment', (req, res) => {
  let now = moment();
  console.log(now);
  res.json(
    resHelper.getJson(process.env.NODE_ENV)
  );
});

router.post('/session', (req, res) => {
  console.log(req.session.a);
  req.session.smsValidated = null;
  res.json(
    resHelper.getJson('')
  );
});

router.post('/calc', (req, res) => {
  console.log(calc);

  let r = calc.func('f(x) = (x/1.44)*1.1');
  console.log(r(4));
  res.json(resHelper.getJson(r(4)));
});

router.post('/edin', (req, res) => {
  const pc_pk = req.body.pc_pk;
  const place_pk = req.body.place_pk;
  const ct_pk = req.body.ct_pk;
  const cp_pk = req.body.cp_pk;
  // const cpd_pk = req.body.cpd_pk;
  // const rt_pk = req.body.rt_pk;
  // const rs_pk = req.body.rs_pk;
  // const ru_pk = req.body.ru_pk;
  // const input_value = req.body.input_value;
  const cpd_pk = 1;
  const rt_pk = 1;
  const rs_pk = 1;
  const ru_pk = 1;
  const input_value = 5;


  let laborCosts;
  let resourcePrice;
  let resourceUnit;
  let calcExpression;
  let ceilFlag;

  // 계약번호 공사위치 공사 공정 공정상세 자재군 자재 자재단위 인풋값
  // select cpd_labor_costs from construction_process_detail_tbl
  knexBuilder.getConnection().then(cur => {
    cur('construction_process_detail_tbl')
      .first('cpd_labor_costs')
      .where({
        cpd_pk: cpd_pk
      })
      .then(row => {
        laborCosts = row.cpd_labor_costs;

        return cur('resource_type_tbl')
          .first('rt_extra_labor_costs')
          .where({
            rt_pk: rt_pk
          })
      })
      .then(row => {
        laborCosts += row.rt_extra_labor_costs;

        return cur('resource_tbl')
          .first('rs_price')
          .where({
            rs_pk: rs_pk
          })
      })
      .then(row => {
        resourcePrice = row.rs_price;

        return cur('resource_unit_tbl')
          .first('ru_name', 'ru_calc_expression', 'ru_ceil_flag')
          .where({
            ru_pk: ru_pk
          })
      })
      .then(row => {
        resourceUnit = row.ru_name;
        calcExpression = row.ru_calc_expression;
        ceilFlag = row.ru_ceil_flag;

        const fn = calc.func(`f(x) = ${calcExpression}`);
        let resourceAmount = fn(input_value);
        if (ceilFlag === 1) {
          resourceAmount = Math.ceil(resourceAmount);
        } else {
          resourceAmount = parseFloat(resourceAmount.toFixed(2));
        }

        console.log(resourceAmount);
        console.log('total labor costs :: ' + laborCosts * resourceAmount);
        console.log('total resource costs :: ' + resourcePrice * resourceAmount);
        res.json(
          resHelper.getJson({
            totalLaborCosts: laborCosts * resourceAmount,
            totalResourceCosts: resourcePrice * resourceAmount
          })
        );
      })

  });
});

module.exports = router;