const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/', (req, res) => {
  let page = req.body['page'];
  let filter = req.body['filter'];
  let pageInst = new paginationService(page);
  let filterInst = new filterService(filter);
  let pageData = pageInst.get();
  let filterData = filterInst.get();

  knexBuilder.getConnection().then(cur => {
    let query = cur('portfolio_tbl');
    let filterSort = filterInst.getFilter('sort');

    switch (filterSort) {
      case 'popular':
        query = query.orderBy('view', 'desc');
        break;
      case 'price':
        query = query.orderBy('portfolio_tbl.pf_price', 'desc');
        break;
      default:
        query = query.orderBy('portfolio_tbl.pf_recency');
    }

    if (filterInst.getFilter('style') !== null) {
      query = query.where('portfolio_tbl.pf_style', filterInst.getFilter('style'));
    }

    if (filterInst.getFilter('size') !== null) {
      let filterSize = filterInst.getFilter('size');

      switch (filterSize) {
        case 'lt20':
          query = query.where('portfolio_tbl.pf_size', '<', 20);
          break;
        case 'eq20':
          query = query.where('portfolio_tbl.pf_size', '>=', 20).andWhere('portfolio_tbl.pf_size', '<', 30);
          break;
        case 'eq30':
          query = query.where('portfolio_tbl.pf_size', '>=', 30).andWhere('portfolio_tbl.pf_size', '<', 40);
          break;
        case 'eq40':
          query = query.where('portfolio_tbl.pf_size', '>=', 40).andWhere('portfolio_tbl.pf_size', '<', 50);
          break;
        case 'eq50':
          query = query.where('portfolio_tbl.pf_size', '>=', 50).andWhere('portfolio_tbl.pf_size', '<', 60);
          break;
        default:
          query = query.where('portfolio_tbl.pf_size', '>=', 60);
      }
    }

    if (filterInst.getFilter('price') !== null) {
      let filterPrice = filterInst.getFilter('price');

      switch (filterPrice) {
        case 'lt1500':
          query = query.where('portfolio_tbl.pf_price', '<', 1500);
          break;
        case 'lt2000':
          query = query.where('portfolio_tbl.pf_price', '<', 2000);
          break;
        case 'lt2500':
          query = query.where('portfolio_tbl.pf_price', '<', 2500);
          break;
        case 'lt3000':
          query = query.where('portfolio_tbl.pf_price', '<', 3000);
          break;
        case '1500~2000':
          query = query.where('portfolio_tbl.pf_price', '>=', 1500).andWhere('portfolio_tbl.pf_price', '<=', 2000);
          break;
        case '2000~2500':
          query = query.where('portfolio_tbl.pf_price', '>=', 2000).andWhere('portfolio_tbl.pf_price', '<=', 2500);
          break;
        case '2500~3000':
          query = query.where('portfolio_tbl.pf_price', '>=', 2500).andWhere('portfolio_tbl.pf_price', '<=', 3000);
          break;
        case '3000~3500':
          query = query.where('portfolio_tbl.pf_price', '>=', 3000).andWhere('portfolio_tbl.pf_price', '<=', 3500);
          break;
        case '3500~4000':
          query = query.where('portfolio_tbl.pf_price', '>=', 3500).andWhere('portfolio_tbl.pf_price', '<=', 4000);
          break;
        case '4000~4500':
          query = query.where('portfolio_tbl.pf_price', '>=', 4000).andWhere('portfolio_tbl.pf_price', '<=', 4500);
          break;
        case '4500~5000':
          query = query.where('portfolio_tbl.pf_price', '>=', 4500).andWhere('portfolio_tbl.pf_price', '<=', 5000);
          break;
        case '5000~5500':
          query = query.where('portfolio_tbl.pf_price', '>=', 5000).andWhere('portfolio_tbl.pf_price', '<=', 5500);
          break;
        case '5500~6000':
          query = query.where('portfolio_tbl.pf_price', '>=', 5500).andWhere('portfolio_tbl.pf_price', '<=', 6000);
          break;
        case 'gte2500':
          query = query.where('portfolio_tbl.pf_price', '>=', 2500);
          break;
        case 'gte3000':
          query = query.where('portfolio_tbl.pf_price', '>=', 3000);
          break;
        case 'gte4000':
          query = query.where('portfolio_tbl.pf_price', '>=', 4000);
          break;
        case 'gte5000':
          query = query.where('portfolio_tbl.pf_price', '>=', 5000);
          break;
        case 'gte6000':
          query = query.where('portfolio_tbl.pf_price', '>=', 6000);
          break;
      }
    }

    if (pageData.point !== null) {
      query = query.where('pf_pk', '<=', pageData.point);
    }

    query = query.where('pf_is_dev', false);

    let list = [];

    query
      .clone()
      .count('* as count')
      .then(response => {
        pageInst.setCount(response[0].count);
        return query
          .select('*')
          .column(cur.raw(`
                                        (
                                            SELECT COUNT(*) AS count
                                            FROM portfolio_view_hst AS view
                                            WHERE view.pv_pfpk = portfolio_tbl.pf_pk
                                        ) AS view
                                        `)
          )
          .leftJoin('portfolio_image_hst', 'portfolio_tbl.pf_pk', 'portfolio_image_hst.pi_pfpk')
          .groupBy('portfolio_tbl.pf_pk')
          .orderBy('portfolio_image_hst.pi_is_primary')
          .limit(pageInst.limit)
          .offset(pageInst.page);
      })
      .then(response => {
        if (response.length > 0) {
          if (pageData.point === null) {
            pageInst.setPoint(response[0]['pf_pk']);
          }
        }

        list = response;

        pageInst.setPage(pageData.page += list.length);
        pageInst.setLimit(pageData.limit);

        if (list.length < pageInst.limit) {
          pageInst.setEnd(true);
        }

        res.json(
          resHelper.getJson({
            data: list,
            page: pageInst.get()
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError('포트폴리오를 조회하는 중 문제가 발생하였습니다.')
        );
        throw reason;
      });
  });
});

router.post('/:pid', (req, res) => {
  let pid = req.params.pid;
  let portfolio;
  let images;
  let positions;
  let documents;
  let designer_images;
  let ipLong = ip.toLong(req.ip);

  knexBuilder.getConnection().then(cur => {
    cur('portfolio_tbl')
      .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
      .innerJoin('designer_tbl', 'work_tbl.wk_dspk', 'designer_tbl.ds_pk')
      .where('portfolio_tbl.pf_pk', pid)
      .limit(1)
      .then(response => {
        portfolio = response ? response[0] : null;

        if (portfolio !== null) {
          cur('portfolio_view_hst')
            .count('* as count')
            .where({
              pv_pfpk: pid,
              pv_ip: ipLong
            })
            .limit(1)
            .then(response => {
              let count = response[0].count;

              if (count < 1) {
                cur('portfolio_view_hst').insert({
                  pv_pfpk: pid,
                  pv_ip: ipLong,
                  pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                })
                  .then(response => {
                  })
                  .catch(() => {
                    ;
                  });
              }
            })
            .catch(() => {
              ;
            });
        }

        return cur('portfolio_image_hst')
          .orderBy('portfolio_image_hst.pi_is_primary', 'desc')
          .where('pi_pfpk', pid);
      })
      .then(response => {
        images = response;

        return cur('portfolio_tbl')
          .select([
            'rd_url'
          ])
          .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
          .innerJoin('resource_document_hst', 'work_tbl.wk_pk', 'resource_document_hst.rd_wkpk')
          .orderBy('resource_document_hst.rd_order')
          .where('pf_pk', pid);
      })
      .then(response => {
        documents = response.map(data => {
          return data.rd_url;
        });

        return cur('portfolio_image_hst')
          .where('portfolio_image_hst.pi_dspk', portfolio.ds_pk)
          .orderBy('portfolio_image_hst.pi_recency')
          .limit(100);
      })
      .then(response => {
        designer_images = response;
        res.json(
          resHelper.getJson({
            data: portfolio,
            images: images,
            positions: positions,
            documents: documents,
            designer_images,
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
          resHelper.getError('포트폴리오 상세 정보를 가지고 오는 중에 문제가 발생했습니다.')
        );
      });
  });
});

module.exports = router;