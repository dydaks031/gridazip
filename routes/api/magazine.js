const express = require('express')
const router = express.Router()
const knexBuilder = require('../../services/connection/knex')
const paginationService = require('../../services/pagination/main')
const resHelper = require('../../services/response/helper')

router.post('/', (req,res) => {
  let page = req.body['page'];
  const pageInst = new paginationService(page);
  let pageData = pageInst.get();


  knexBuilder.getConnection().then(cur => {
    let query = cur('magazine_tbl')
      .select(
        'mg_pk',
        'mg_subject',
        'mg_reg_dt',
        'mg_mod_dt',
        'mg_content',
        'mg_thumbnail'
      )
      .where('mg_delete_yn', false)
      .orderBy('mg_recency')
      .limit(pageInst.limit)
      .offset(pageInst.page);

    if (pageData.point !== null) {
      query = query.where('mg_pk', '<=', pageData.point);
    }

    let list = [];

    query.then(response => {
      response.map(magazine => {
        // let firstImage = /https.*\.[a-zA-Z]*/.exec(magazine.mg_content);
        // if (firstImage) {
        //   firstImage = firstImage[0];
        // } else {
        //   firstImage = '';
        // }
        // magazine.mg_main_image = firstImage;
        if (magazine.mg_content.length > 120) {
        magazine.mg_content = `${magazine.mg_content.replace(/(<([^>]+)>)/ig,"").replace(/^&.*\;/gi, "").substr(0,120)}...`;
        }
        return magazine;
      })

      if (response.length > 0) {
        if (pageData.point === null) {
          pageInst.setPoint(response[0]['mg_pk']);
        }
      }

      list = response;

      pageInst.setPage(pageData.page += list.length);
      pageInst.setLimit(pageData.limit);

      if (list.length < pageInst.limit) {
        pageInst.setEnd(true);
      }

      return cur('magazine_tbl').count('* as count').where('mg_delete_yn', false);
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
      .catch(err => {
        console.error(err);
        res.json(
          resHelper.getError('매거진 목록을 조회하는 중 오류가 발생하였습니다.')
        );
      })
  })
});

router.post('/:mgpk([0-9]+)', (req,res) => {
  const reqMgPk = req.params.mgpk;
  console.log(reqMgPk);
  console.log('server respond.');
  knexBuilder.getConnection().then(cur => {
    cur('magazine_tbl')
      .first(
        'mg_pk',
        'mg_subject',
        'mg_reg_dt',
        'mg_mod_dt',
        'mg_content',
        'mg_thumbnail'
      )
      .where('mg_pk', reqMgPk)
      .andWhere('mg_delete_yn', false)
      .then(response => {
        res.json(
          resHelper.getJson({
            data: response
          })
        );
      })
  })
})
module.exports = router
