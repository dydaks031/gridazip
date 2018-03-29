const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/designer', (req, res) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let pageInst = new paginationService(page);
  let filterInst = new filterService(filter);
  let pageData = pageInst.get();

  if (pageInst.isEnd() === true) {
    res.json(
      resHelper.getJson({
        data: [],
        page: pageData.get()
      })
    );
    return;
  }

  knexBuilder.getConnection().then(cur => {
    let query = cur('designer_tbl')
      .select('*')
      .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = designer_tbl.ds_pk AND view.pv_type = ?
      ) AS view
      `, 'D'));

    // 임시
    query = query.where('ds_is_dev', false);

    let filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      default:
        query = query.orderBy('designer_tbl.ds_recency');
    }


    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('ds_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['ds_pk']);
          }
        }

        list = response;
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('designer_tbl').count('* as count');
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
      .catch(() => {
        res.json(
          resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        )
      });
  });
});

router.post('/designer/:did', (req, res) => {
  knexBuilder.getConnection().then(cur => {
    let ipLong = ip.toLong(req.ip);
    let designerID = req.params.did;
    let designer;
    let portfolio;

    cur('designer_tbl')
      .where({
        ds_pk: designerID
      })
      .limit(1)
      .then(response => {
        if (response.length < 1) {
          return res.json(
            resHelper.getError('해당 디자이너가 존재하지 않습니다.')
          );
        }

        cur('profile_view_hst')
          .count('* as count')
          .where({
            pv_target: designerID,
            pv_type: 'D',
            pv_ip: ipLong
          })
          .limit(1)
          .then(response => {
            let count = response[0].count;

            if (count < 1) {
              cur('profile_view_hst')
                .insert({
                  pv_target: designerID,
                  pv_type: 'D',
                  pv_ip: ipLong,
                  pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                })
                .then(() => {
                  ;
                })
                .catch(() => {
                  ;
                });
            }
          })
          .catch(() => {
            ;
          });

        designer = response[0];

        return cur('portfolio_tbl')
          .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
          .innerJoin('portfolio_image_hst', 'portfolio_tbl.pf_pk', 'portfolio_image_hst.pi_pfpk')
          .where({
            wk_dspk: designerID
          })
          .orderBy('portfolio_tbl.pf_recency')
          .orderBy('portfolio_image_hst.pi_is_primary')
          .groupBy('portfolio_tbl.pf_pk')
          .limit(4);
      })
      .then(response => {
        portfolio = response;

        res.json(
          resHelper.getJson({
            data: designer,
            portfolio: portfolio
          })
        );
      })
      .catch(() => {
        res.json(
          resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
        );
      });
  });
});

router.post('/designer/document/:pid', (req, res, next) => {
  let portfolioID = req.params.pid;

  let documents;
  let images;

  knexBuilder.getConnection().then(cur => {
    cur('portfolio_tbl')
      .select('resource_document_hst.*')
      .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
      .innerJoin('resource_document_hst', 'work_tbl.wk_pk', 'resource_document_hst.rd_wkpk')
      .orderBy('resource_document_hst.rd_order')
      .where({
        pf_pk: portfolioID
      })
      .then(response => {
        documents = response.map(data => {
          return data.rd_url;
        });

        return cur('portfolio_image_hst').where({
          pi_pfpk: portfolioID
        })
          .orderBy('pi_is_primary')
          .orderBy('pi_recency');
      })
      .then(response => {
        images = response;
        res.json(
          resHelper.getJson({
            documents: documents,
            images: images
          })
        );
      })
      .catch(() => {
        res.json(
          resHelper.getError('디자이너의 포트폴리오 상세 조회 중 문제가 발생하였습니다.')
        );
      })
  });
});

router.post('/constructor', (req, res, next) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let pageInst = new paginationService(page);
  let filterInst = new filterService(filter);
  let pageData = pageInst.get();
  let filterData = filterInst.get();

  if (pageInst.isEnd() === true) {
    res.json(
      resHelper.getJson({
        data: [],
        page: pageData.get()
      })
    );
    return;
  }

  knexBuilder.getConnection().then(cur => {
    let query = cur('constructor_tbl')
      .select('*')
      .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = constructor_tbl.cr_pk AND view.pv_type = ?
      ) AS view
      `, 'C'));

    // 임시
    query = query.where('cr_is_dev', false);

    let filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      default:
        query = query.orderBy('constructor_tbl.cr_recency');
    }

    query = query
      .limit(pageData.limit)
      .offset(pageData.page);

    if (pageData.point !== null) {
      query = query.where('cr_pk', '<=', pageData.point);
    }

    let list = [];

    query
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['cr_pk']);
          }
        }

        list = response;
        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        return cur('constructor_tbl').count('* as count');
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
      .catch(() => {
        res.json(
          resHelper.getError('시공자 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
        )
      });
  });
});

module.exports = router;