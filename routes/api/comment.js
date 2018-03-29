const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.post('/:channel/:id', (req, res) => {
  const channelKey = req.params.channel;
  const channel = ({
    designer: 'D',
    constructor: 'C'
  })[channelKey];
  const id = req.params.id;

  const page = req.body['page'];
  let pageInst = new paginationService(page);
  let pageData = pageInst.get();

  let list = [];

  knexBuilder.getConnection().then(cur => {
    let query = cur('comment_tbl')
      .where({
        ct_channel: channel,
        ct_id: id
      })
      .orderBy('comment_tbl.ct_recency')
      .orderBy('comment_tbl.ct_pk', 'desc')
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('ct_pk', '<=', pageData.point);
    }

    query
      .then(response => {
        list = response;

        if (list.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(list[0]['ct_pk']);
          }
        }

        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('comment_tbl')
          .count('* as count')
          .where({
            ct_channel: channel,
            ct_id: id
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
  let score = parseInt(req.body['score'] || 0);
  let text = req.body['text'] || '';

  if (req.user === null) {
    res.json(
      resHelper.getError('먼저 로그인을 하고 이용해주시기 바랍니다.', resModel.status.FORBIDDEN)
    );
  }
  else if (text.length < 10) {
    res.json(
      resHelper.getError('코맨트는 10자 이상으로 적어주세요.')
    );
  }
  else if (score < 0 || score > 5) {
    res.json(
      resHelper.getError('리뷰 점수는 0~5점 사이여야 합니다.')
    );
  }
  else {
    knexBuilder.getConnection().then(cur => {
      cur('comment_tbl')
        .count('* AS count')
        .where({
          ct_channel: channel,
          ct_id: id,
          ct_user: req.user.user_pk
        })
        .then(response => {
          let count = response[0].count;

          if (count > 0) {
            res.json(
              resHelper.getError('리뷰를 중복으로 입력하실 수는 없습니다.')
            );
          }
          else {
            return cur('comment_tbl').insert({
              ct_channel: channel,
              ct_id: id,
              ct_user: req.user.user_pk,
              ct_description: text,
              ct_score: score,
              ct_recency: cur.raw('UNIX_TIMESTAMP() * -1')
            });
          }
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
            resHelper.getError('코맨트를 작성 하는 중 알 수 없는 문제가 발생하였습니다.')
          );
        });
    });
  }
});

module.exports = router;