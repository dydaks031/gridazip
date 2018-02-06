const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.post('/notice', (req, res, next) => {
    var page = req.body['page'];
    var pageInst = new paginationService(page);
    var pageData = pageInst.get();

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
        var query = cur('notice_tbl').select('nt_pk', 'nt_title', 'nt_content', 'nt_reg_dt', 'nt_mod_dt')
            .orderBy('nt_recency')
            .limit(pageData.limit)
            .offset(pageData.page);

        if (pageData.point !== null) {
            query = query.where('nt_pk', '<=', pageData.point);
        }

        var list = [];

        query.then(response => {
            if (response.length > 0) {
                if (pageData.point === null) {
                    pageInst.setPoint(response[0]['nt_pk']);
                }
            }

            list = response;

            pageInst.setPage(pageData.page += list.length);
            pageInst.setLimit(pageData.limit);

            if (list.length < pageInst.limit) {
                pageInst.setEnd(true);
            }

            return cur('notice_tbl').count('* as count');
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
                    resHelper.getError('공지사항 정보를 수집하는 중 알 수 없는 문제가 발견되었습니다')
                );
                throw reason;
            });
    });
});

router.post('/faq', (req, res, next) => {
    var page = req.body['page'];
    var pageInst = new paginationService(page);
    var pageData = pageInst.get();

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
        var query = cur('faq_tbl').select('faq_pk', 'faq_question', 'faq_answer', 'faq_reg_dt', 'faq_mod_dt')
            .orderBy('faq_recency')
            .limit(pageData.limit)
            .offset(pageData.page);

        if (pageData.point !== null) {
            query = query.where('faq_pk', '<=', pageData.point);
        }

        var list = [];

        query.then(response => {
            if (response.length > 0) {
                if (pageData.point === null) {
                    pageInst.setPoint(response[0]['faq_pk']);
                }
            }

            list = response;

            pageInst.setPage(pageData.page += list.length);
            pageInst.setLimit(pageData.limit);

            if (list.length < pageInst.limit) {
                pageInst.setEnd(true);
            }

            return cur('faq_tbl').count('* as count');
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
                    resHelper.getError('FAQ 정보를 수집하는 중 알 수 없는 문제가 발견되었습니다')
                );
                throw reason;
            });
    });
});

module.exports = router;