const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/', (req, res) => {
  if (req.user === null) {
    res.json(
      resHelper.getError('먼저 로그인을 하고 이용해주시기 바랍니다.')
    );
  }
  else {
    var work;
    var documents;

    knexBuilder.getConnection().then(cur => {
      cur('work_tbl')
        .where({
          wk_user: req.user.user_pk
        })
        .orderBy('work_tbl.wk_recency')
        .limit(1)
        .then(response => {
          work = response.length > 0 ? response[0] : null;

          if (work === null) {
            res.json(
              resHelper.getJson({
                work: work
              })
            );
          }
          else {
            return cur('resource_document_hst')
              .select([
                'rd_url'
              ])
              .where({
                rd_wkpk: work.wk_pk
              })
              .orderBy('resource_document_hst.rd_recency')
              .orderBy('resource_document_hst.rd_pk', 'desc');
          }
        })
        .then(response => {
          documents = response.map(data => {
            return data.rd_url;
          });

          res.json(
            resHelper.getJson({
              work: work,
              documents: documents,
              schedules: [],
              receipt: {
                employee: [],
                resource: []
              }
            })
          );

        })
        .catch(reason => {
          console.error(reason);
          res.json(
            resHelper.getError('시공 정보를 불러오는 도중 알 수 없는 문제가 발생하였습니다.')
          );
        });
    });
  }
});

router.post('/partner', (req, res) => {
  const pn_name = req.body.pn_name || '';
  const pn_tel_no = req.body.pn_tel_no || '';
  const pn_price_list = req.body.pn_price_list || '';
  const pn_qna = req.body.pn_qna || '';

  let errorMsg = null;

  if (pn_name === '') {
    errorMsg = '업체명은 반드시 입력해야 합니다.';
  }
  else if(pn_tel_no === '') {
    errorMsg = '연락처는 반드시 입력해야 합니다.';
  }

  if (errorMsg !== null) {
    res.json(
      resHelper.getError(errorMsg)
    );
  } else {
    knexBuilder.getConnection().then(cur => {
      cur('partner_tbl').insert({
        pn_name: pn_name,
        pn_tel_no: pn_tel_no,
        pn_price_list: pn_price_list,
        pn_qna: pn_qna,
        pn_recency: cur.raw('UNIX_TIMESTAMP() * -1')
      })
        .then(() => {
          res.json(
            resHelper.getJson({
              msg: 'OK'
            })
          )
        })
        .catch(reason => {
          console.log(reason);
          res.json(
            resHelper.getError('데이터 저장 중 문제가 발생했습니다.')
          );
        })
    })
  }
});

module.exports = router;