const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.post('/:channel/:id', (req, res) => {
  let channelKey = req.params.channel;
  let channel = ({
    designer: 'D',
    constructor: 'C'
  })[channelKey];
  let id = req.params.id;

  let page = req.body['page'];
  let pageInst = new paginationService(page);
  let pageData = pageInst.get();

  let list = [];

  knexBuilder.getConnection().then(cur => {
    let query = cur('qna_tbl')
      .where({
        qna_channel: channel,
        qna_id: id
      })
      .orderBy('qna_tbl.qna_recency')
      .orderBy('qna_tbl.qna_pk', 'desc')
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('qna_pk', '<=', pageData.point);
    }

    query
      .then(response => {
        list = response;

        if (list.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(list[0]['qna_pk']);
          }
        }

        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('qna_tbl')
          .count('* as count')
          .where({
            qna_channel: channel,
            qna_id: id
          });
      })
      .then(response => {
        pageInst.setCount(response[0].count);

        res.json(
          resHelper.getJson({
            data: list,
            page: pageInst.get()
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError('댓글 정보를 가져오는 중 알 수 없는 문제가 발생했습니다.')
        );
        console.error(reason);
      });
  });
});

router.post('/save/:channel/:id', (req, res) => {
  let channelKey = req.params.channel;
  let channel = ({
    designer: 'D',
    constructor: 'C'
  })[channelKey];
  let id = req.params.id;
  let text = req.body['text'] || '';

  if (req.user === null) {
    res.json(
      resHelper.getError('먼저 로그인을 하고 이용해주시기 바랍니다.', resModel.status.FORBIDDEN)
    );
  }
  else if (text.length < 10) {
    res.json(
      resHelper.getError('질문은 10자 이상으로 적어주세요.')
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('qna_tbl').insert({
        qna_channel: channel,
        qna_id: id,
        qna_user: req.user.user_pk,
        qna_description: text,
        qna_recency: cur.raw('UNIX_TIMESTAMP() * -1')
      })
        .then(() => {
          res.json(
            resHelper.getJson({
              value: 'OK'
            })
          );
        })
        .catch(() => {
          res.json(
            resHelper.getError('질문을 작성 하는 중 알 수 없는 문제가 발생하였습니다.')
          );
        });
    });
  }
});

router.post('/answer/:channel/:id', (req, res) => {
  let channelKey = req.params.channel;
  let channel = ({
    designer: 'D',
    constructor: 'C'
  })[channelKey];
  let id = req.params.id;

  knexBuilder.getConnection().then(cur => {
    cur('qna_answer_hst')
      .innerJoin('qna_tbl', 'qna_answer_hst.qna_pk', 'qna_tbl.qna_pk')
      .where({
        qna_channel: channel,
        'qna_tbl.qna_pk': id
      })
      .limit(1)
      .then(response => {
        let result = response.length > 0 ? response[0] : null;

        res.json(
          resHelper.getJson({
            data: result
          })
        );
      })
      .catch(reason => {
        console.error(reason);
        res.json(
          resHelper.getError('답변을 조회 하는 중 알 수 없는 문제가 발생하였습니다.')
        );
      });
  });
});

module.exports = router;