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

module.exports = router;