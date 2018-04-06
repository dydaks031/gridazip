const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.post('/', (req, res, next) => {
    if (req.user === null) {
        res.json(
            resHelper.getError('먼저 로그인을 하고 이용해주시기 바랍니다.')
        );
    }
    else {
        var work;
        var documents;
        var schedules;
        var receipt_employee;
        var receipt_resource;

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

                    return cur('work_schedule_hst')
                        .innerJoin('constructor_tbl', 'work_schedule_hst.ws_crpk', 'constructor_tbl.cr_pk')
                        .innerJoin('company_tbl', 'constructor_tbl.cr_cppk', 'company_tbl.cp_pk')
                        .innerJoin('construction_place_hst', 'work_schedule_hst.ws_cppk', 'construction_place_hst.cp_pk')
                        .innerJoin('resource_tbl', 'work_schedule_hst.ws_rspk', 'resource_tbl.rs_pk')
                        .innerJoin('resource_category_hst', 'resource_tbl.rs_rcpk', 'resource_category_hst.rc_pk')
                        .innerJoin('resource_type_hst', 'resource_category_hst.rc_rtpk', 'resource_type_hst.rt_pk')
                        .innerJoin('construction_type_detail_hst', 'work_schedule_hst.ws_cdpk', 'construction_type_detail_hst.cd_pk')
                        .innerJoin('construction_type_hst', 'construction_type_detail_hst.cd_ctpk', 'construction_type_hst.ct_type_pk')
                        .where({
                            ws_wkpk: work.wk_pk
                        })
                        .orderBy('ws_start_dt')
                        .orderBy('ws_recency')
                        .orderBy('ws_pk', 'desc');
                })
                .then(response => {
                    schedules = response;

                    return cur('work_tbl')
                        .innerJoin('receipt_employee_hst', 'work_tbl.wk_pk', 'receipt_employee_hst.re_wkpk')
                        .innerJoin('construction_tbl', 'receipt_employee_hst.re_ctpk', 'construction_tbl.ct_pk')
                        .innerJoin('construction_type_hst', 'construction_tbl.ct_type', 'construction_type_hst.ct_type_pk')
                        .where('wk_pk', work.wk_pk);
                })
                .then(response => {
                    receipt_employee = response;

                    return cur('work_tbl')
                        .innerJoin('receipt_resource_hst', 'work_tbl.wk_pk', 'receipt_resource_hst.rr_wkpk')
                        .innerJoin('construction_type_hst', 'receipt_resource_hst.rr_type', 'construction_type_hst.ct_type_pk')
                        .innerJoin('resource_tbl', 'receipt_resource_hst.rr_rspk', 'resource_tbl.rs_pk')
                        .innerJoin('resource_price_hst', 'resource_tbl.rs_pk', 'resource_price_hst.rp_rspk')
                        .innerJoin('company_tbl', 'resource_tbl.rs_cppk', 'company_tbl.cp_pk')
                        .innerJoin('resource_category_hst', 'resource_tbl.rs_rcpk', 'resource_category_hst.rc_pk')
                        .innerJoin('resource_type_hst', 'resource_category_hst.rc_rtpk', 'resource_type_hst.rt_pk')
                        .where('wk_pk', work.wk_pk);
                })
                .then(response => {
                    receipt_resource = response;

                    res.json(
                        resHelper.getJson({
                            work: work,
                            documents: documents,
                            schedules: schedules,
                            receipt: {
                                employee: receipt_employee,
                                resource: receipt_resource
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