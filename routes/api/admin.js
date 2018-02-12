const express = require('express');
const router = express.Router();
const ip = require('ip');
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.get('/*', (req, res, next) => {
    if (req.user === null || req.user.user_permit !== 'A') {
        res.json(
            resHelper.getError('이 기능을 사용하기 위해서는 관리자 권한이 필요합니다.')
        );
    }
    else {
        next();
    }
});

router.post('/portfolio', (req, res, next) => {
    var page = req.body['page'];
    var filter = req.body['filter'];
    var pageInst = new paginationService(page);
    var filterInst = new filterService(filter);
    var pageData = pageInst.get();
    var filterData = filterInst.get();

    knexBuilder.getConnection().then(cur => {
        var query = cur('portfolio_tbl');
        var filterSort = filterInst.getFilter('sort');

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
            var filterSize = filterInst.getFilter('size');

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
            var filterPrice = filterInst.getFilter('price');

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

        var list = [];

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

router.post('/portfolio/designer', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        cur('designer_tbl')
            .orderBy('ds_recency')
            .then(response => {
                res.json(
                    resHelper.getJson({
                        data: response
                    })
                );
            })
            .catch(reason => {
                res.json(
                    resHelper.getError(reason)
                );
            });
    });
});

router.post('/portfolio/delete/:pid', (req, res, next) => {
    var pid = req.params.pid;

    knexBuilder.getConnection().then(cur => {
        
    cur('portfolio_tbl')
        .where({
            pf_pk: pid
        })
        .limit(1)
        .then(response => {
            var promises = [];

            if (response.length > 0) {
                var wkid = response[0].pf_wkpk;

                promises.push(
                    cur('portfolio_tbl')
                        .where({
                            pf_pk: pid
                        })
                        .del()
                );

                promises.push(
                    cur('portfolio_image_hst')
                        .where({
                            pi_pfpk: pid
                        })
                        .del()
                );

                promises.push(
                    cur('resource_document_hst')
                        .where({
                            rd_wkpk: wkid
                        })
                        .del()
                );

                promises.push(
                    cur('work_tbl')
                        .where({
                            wk_pk: wkid
                        })
                        .del()
                );
            }

            return Promise.all(promises);
        })
        .then(response => {
            res.json(
                resHelper.getJson({
                    msg: 'ok'
                })
            );
        })
        .catch(reason => {
            res.json(
                resHelper.getError(reason)
            );
        });
    });
});

router.post('/portfolio/save/:pid*?', (req, res, next) => {
    var pid = req.params.pid;
    var wkid = null;
    
    var portfolio_title = req.body.portfolio_title || '';
    var portfolio_designer = req.body.portfolio_designer || '';
    var portfolio_description = req.body.portfolio_description || '';
    var portfolio_address = req.body.portfolio_address || '';
    var portfolio_style = req.body.portfolio_style || '';
    var portfolio_size = req.body.portfolio_size || 0;
    var portfolio_price = req.body.portfolio_price || 0;
    var portfolio_document = req.body.portfolio_document_data || '';
    var portfolio_is_dev = req.body.portfolio_is_dev || false;

    var errorMsg = null;

    if (portfolio_title === '') {
        errorMsg = '제목은 반드시 입력해야 합니다.';
    }
    else if(portfolio_designer === '') {
        errorMsg = '디자이너는 반드시 선택해야 합니다.';
    }
    else if(portfolio_address === '') {
        errorMsg = '주소는 반드시 입력해야 합니다.';
    }
    else if(portfolio_style === '') {
        errorMsg = '스타일은 반드시 입력해야 합니다.';
    }
    else if(portfolio_size === '') {
        errorMsg = '평수는 반드시 입력해야 합니다.';
    }
    else if(portfolio_price === '') {
        errorMsg = '비용은 반드시 입력해야 합니다.';
    }
    else if(req.body['portfolio_before_data[0]'] === '') {
        errorMsg = '적어도 1개의 BEFORE 이미지를 업로드 하셔야 합니다.';
    }
    else if(req.body['portfolio_after_data[0]'] === '') {
        errorMsg = '적어도 1개의 AFTER 이미지를 업로드 하셔야 합니다.';
    }

    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
        knexBuilder.getConnection().then(cur => {
            var portfolio_before = [];
            var portfolio_after = [];
            var regex = /portfolio_(before|after)_data\[(\d*)\]/;

            for (var idx in req.body) {
                var value = req.body[idx];
                var match = idx.match(regex);
                if (match !== null && match.length > 0) {
                    if (match[1] === 'before') {
                        portfolio_before.push({
                            index: parseInt(match[2]),
                            value: value
                        });
                    }
                    else if(match[1] === 'after') {
                        portfolio_after.push({
                            index: parseInt(match[2]),
                            value: value
                        });
                    }
                }
            }

            portfolio_before.sort(function (a, b) { 
                return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;  
            });

            portfolio_after.sort(function (a, b) { 
                return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;  
            });

            if (pid) {
                cur('portfolio_tbl')
                    .select('*')
                    .leftJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
                    .where({
                        pf_pk: pid
                    })
                    .limit(1)
                    .then(response => {
                        if (response.length < 1) {
                            res.json(
                                resHelper.getError('수정할 포트폴리오가 존재하지 않습니다.')
                            );
                        }
                        else {
                            wkid = response[0].wk_pk;
                            return cur('portfolio_tbl')
                                .where({
                                    pf_pk: pid
                                })
                                .update({
                                    pf_style: portfolio_style,
                                    pf_price: portfolio_price,
                                    pf_size: portfolio_size,
                                    pf_address: portfolio_address,
                                    pf_title: portfolio_title,
                                    pf_description: portfolio_description
                                });
                        }
                    })
                    .then(responses => {
                        return cur('work_tbl')
                            .update({
                                wk_dspk: portfolio_designer
                            })
                            .where({
                                wk_pk: wkid
                            });
                    })
                    .then(response => {
                        return cur('portfolio_image_hst')
                            .where({
                                pi_pfpk: pid
                            })
                            .del()
                    })
                    .then(response => {
                        var promises = [];
                        portfolio_before.map((element, idx) => {
                            var target = portfolio_after.filter(target => {
                                return target.index === element.index;
                            });
                            target = target.length > 0? target[0]:null;

                            if (target !== null) {
                                promises.push(cur('portfolio_image_hst')
                                    .insert({
                                        pi_pfpk: pid,
                                        pi_before: element.value,
                                        pi_after: target.value,
                                        pi_is_primary: element.index === 0? 'Y':'N',
                                        pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            }
                        });
                        return Promise.all(promises);
                    })
                    .then(response => {
                        if (portfolio_document !== '') {
                            return cur('resource_document_hst')
                                .where({
                                    rd_wkpk: wkid
                                })
                                .del();
                        }
                    })
                    .then(response => {
                        if (portfolio_document !== '') {
                            let portfolio_documents = portfolio_document.split(',');
                            let promises = [];
                            portfolio_documents.map((element, index) => {
                                promises.push(cur('resource_document_hst')
                                    .insert({
                                        rd_wkpk: wkid,
                                        rd_url: element,
                                        rd_order: index,
                                        rd_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            });
                            return Promise.all(promises);
                        }
                    })
                    .finally(() => {
                        res.json(
                            resHelper.getJson({
                                msg: 'ok'
                            })
                        );
                    })
                    .catch(reason => {
                        res.json(
                            resHelper.getError(reason)
                        );
                    });
            }
            else {
                cur('work_tbl')
                    .returning('wk_pk')
                    .insert({
                        wk_user: req.user.user_pk,
                        wk_dspk: portfolio_designer,
                        wk_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                    })
                    .then(response => {
                        wkid = response[0];
                        return cur('portfolio_tbl')
                            .returning('pf_pk')
                            .insert({
                                pf_wkpk: wkid,
                                pf_style: portfolio_style,
                                pf_price: portfolio_price,
                                pf_size: portfolio_size,
                                pf_address: portfolio_address,
                                pf_title: portfolio_title,
                                pf_description: portfolio_description,
                                pf_is_dev: portfolio_is_dev,
                                pf_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                            })
                    })
                    .then(response => {
                        var promises = [];
                        pid = response[0];

                        portfolio_before.map((element, idx) => {
                            var target = portfolio_after.filter(target => {
                                return target.index === element.index;
                            });
                            target = target.length > 0? target[0]:null;

                            if (target !== null) {
                                promises.push(cur('portfolio_image_hst')
                                    .insert({
                                        pi_pfpk: pid,
                                        pi_before: element.value,
                                        pi_after: target.value,
                                        pi_is_primary: element.index === 0? 'Y':'N',
                                        pi_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            }
                        });

                        return Promise.all(promises);
                    })
                    .then(responses => {
                        if (portfolio_document !== '') {
                            let portfolio_documents = portfolio_document.split(',');
                            let promises = [];
                            portfolio_documents.map((element, index) => {
                                promises.push(cur('resource_document_hst')
                                    .insert({
                                        rd_wkpk: wkid,
                                        rd_url: element,
                                        rd_order: index,
                                        rd_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                    }));
                            });
                            return Promise.all(promises);
                        }
                        else {
                            res.json(
                                resHelper.getJson({
                                    value: pid
                                })
                            );
                        }
                    })
                    .then(responses => {
                        res.json(
                            resHelper.getJson({
                                value: pid
                            })
                        );
                    })
                    .catch(reason => {
                        res.json(
                            resHelper.getError(reason)
                        );
                    });
            }
        });
    }
});

router.post('/portfolio/:pid', (req, res, next) => {
    var pid = req.params.pid;
    var portfolio;
    var images;
    var positions;
    var documents;
    var designer_images;
    var receipt_employee;
    var receipt_resource;
    var ipLong = ip.toLong(req.ip);

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
                            var count = response[0].count;

                            if (count < 1) {
                                cur('portfolio_view_hst').insert({
                                    pv_pfpk: pid,
                                    pv_ip: ipLong,
                                    pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                })
                                    .then(response => {
                                    })
                                    .catch(reason => {
                                        ;
                                    });
                            }
                        })
                        .catch(reason => {
                            ;
                        });
                }

                return cur('portfolio_image_hst')
                    .orderBy('portfolio_image_hst.pi_is_primary', 'asc')
                    .orderBy('portfolio_image_hst.pi_pk')
                    .where('pi_pfpk', pid);
            })
            .then(response => {
                images = response;

                return cur('portfolio_image_position_hst')
                    .innerJoin('resource_tbl', 'portfolio_image_position_hst.pi_pos_rspk', 'resource_tbl.rs_pk')
                    .innerJoin('company_tbl', 'resource_tbl.rs_cppk', 'company_tbl.cp_pk')
                    .where('pi_pos_pfpk', pid);
            })
            .then(response => {
                positions = response;

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
                    .limit(10);
            })
            .then(response => {
                designer_images = response;

                return cur('portfolio_tbl')
                    .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
                    .innerJoin('receipt_employee_hst', 'work_tbl.wk_pk', 'receipt_employee_hst.re_wkpk')
                    .innerJoin('construction_tbl', 'receipt_employee_hst.re_ctpk', 'construction_tbl.ct_pk')
                    .innerJoin('construction_type_hst', 'construction_tbl.ct_type', 'construction_type_hst.ct_type_pk')
                    .where('pf_pk', pid);
            })
            .then(response => {
                receipt_employee = response;

                return cur('portfolio_tbl')
                    .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
                    .innerJoin('receipt_resource_hst', 'work_tbl.wk_pk', 'receipt_resource_hst.rr_wkpk')
                    .innerJoin('construction_type_hst', 'receipt_resource_hst.rr_type', 'construction_type_hst.ct_type_pk')
                    .innerJoin('resource_tbl', 'receipt_resource_hst.rr_rspk', 'resource_tbl.rs_pk')
                    .innerJoin('resource_price_hst', 'resource_tbl.rs_pk', 'resource_price_hst.rp_rspk')
                    .innerJoin('company_tbl', 'resource_tbl.rs_cppk', 'company_tbl.cp_pk')
                    .innerJoin('resource_category_hst', 'resource_tbl.rs_rcpk', 'resource_category_hst.rc_pk')
                    .innerJoin('resource_type_hst', 'resource_category_hst.rc_rtpk', 'resource_type_hst.rt_pk')
                    .where('pf_pk', pid);
            })
            .then(response => {
                receipt_resource = response;
                res.json(
                    resHelper.getJson({
                        data: portfolio,
                        images: images,
                        positions: positions,
                        documents: documents,
                        designer_images,
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
                    resHelper.getError('포트폴리오 상세 정보를 가지고 오는 중에 문제가 발생했습니다.')
                );
            });
    });
});

router.post('/profile/designer', (req, res, next) => {
    var page = req.body['page'];
    var filter = req.body['filter'];
    var pageInst = new paginationService(page);
    var filterInst = new filterService(filter);
    var pageData = pageInst.get();
    var filterData = filterInst.get();

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
        var query = cur('designer_tbl')
            .select('*')
            .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = designer_tbl.ds_pk AND view.pv_type = ?
      ) AS view
      `, 'D'));

        var filterSort = filterInst.getFilter('sort');

        switch (filterSort) {
            case 'popular':
                query = query.orderBy('view', 'desc');
                break;
            default:
                query = query.orderBy('designer_tbl.ds_recency');
        }

        // 임시
        query = query.where('ds_is_dev', false);

        query = query
            .limit(pageData.limit)
            .offset(pageData.page);

        if (pageData.point !== null) {
            query = query.where('ds_pk', '<=', pageData.point);
        }

        var list = [];

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
            .catch(reason => {
                res.json(
                    resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
                )
            });
    });
});


router.post('/style', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        cur('style_tbl')
            .orderBy('style_recency')
            .then(response => {
                res.json(
                    resHelper.getJson({
                        data: response
                    })
                );
            })
            .catch(reason => {
                res.json(
                    resHelper.getError(reason)
                );
            });
    });
});

router.post('/company', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        cur('company_tbl')
            .orderBy('cp_recency')
            .then(response => {
                res.json(
                    resHelper.getJson({
                        data: response
                    })
                );
            })
            .catch(reason => {
                res.json(
                    resHelper.getError(reason)
                );
            });
    });
});

router.post('/profile/designer/:did', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        var ipLong = ip.toLong(req.ip);
        var designerID = req.params.did;
        var designer;
        var portfolio;

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
                        var count = response[0].count;

                        if (count < 1) {
                            cur('profile_view_hst')
                                .insert({
                                    pv_target: designerID,
                                    pv_type: 'D',
                                    pv_ip: ipLong,
                                    pv_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                })
                                .then(response => {
                                    ;
                                })
                                .catch(reason => {
                                    ;
                                });
                        }
                    })
                    .catch(reason => {
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
            .catch(reason => {
                res.json(
                    resHelper.getError('디자이너 정보를 불러오는 중 알 수 없는 문제가 발생하였습니다.')
                );
            });
    });
});

router.post('/profile/designer/delete/:did', (req, res, next) => {
    var designerID = req.params.did;

    knexBuilder.getConnection().then(cur => {
        
    cur('designer_tbl')
        .where({
            ds_pk: designerID
        })
        .limit(1)
        .then(response => {
            var promises = [];

            if (response.length > 0) {
                promises.push(
                    cur('designer_tbl')
                        .where({
                            ds_pk: designerID
                        })
                        .del()
                );
            }

            return Promise.all(promises);
        })
        .then(response => {
            res.json(
                resHelper.getJson({
                    msg: 'ok'
                })
            );
        })
        .catch(reason => {
            res.json(
                resHelper.getError(reason)
            );
        });
    });
});

router.post('/profile/designer/save/:did*?', (req, res, next) => {
    var did = req.params.did;
    var wkid = null;

    var designer_name = req.body.designer_name || '';
    var designer_score_communication = req.body.designer_score_communication || '';
    var designer_score_timestrict = req.body.designer_score_timestrict || '';
    var designer_score_quality = req.body.designer_score_quality || '';
    var designer_style = req.body.designer_style || '';
    var designer_address = req.body.designer_address || '';
    var designer_introduce = req.body.designer_introduce || '';
    var designer_price_min = req.body.designer_price_min || '';
    var designer_price_max = req.body.designer_price_max || '';
    var designer_image = req.body.designer_image || '';
    var designer_is_dev = req.body.designer_is_dev || false;

    var errorMsg = null;

    if (designer_name === '') {
        errorMsg = '이름은 반드시 입력해야 합니다.';
    }
    else if(designer_score_communication === '') {
        errorMsg = '커뮤니케이션 점수는 반드시 선택해야 합니다.';
    }
    else if(designer_score_timestrict === '') {
        errorMsg = '시간엄수 점수는 반드시 입력해야 합니다.';
    }
    else if(designer_score_quality === '') {
        errorMsg = '디자인 완성도 점수는 반드시 입력해야 합니다.';
    }
    else if(designer_price_min === '') {
        errorMsg = '디자인 최소 비용은 반드시 입력해야 합니다.';
    }
    else if(designer_price_max === '') {
        errorMsg = '디자인 최대 비용은 반드시 입력해야 합니다.';
    }
    else if(designer_image === '') {
        errorMsg = '프로필 사진은 반드시 업로드해야 합니다.';
    }
    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
        knexBuilder.getConnection().then(cur => {
            if (did) {
                cur('designer_tbl')
                    .select('*')
                    .where({
                        pf_pk: pid
                    })
                    .limit(1)
                    .then(response => {
                        if (response.length < 1) {
                            res.json(
                                resHelper.getError('수정할 디자이너 프로필이 존재하지 않습니다.')
                            );
                        }
                        else {
                            wkid = response[0].wk_pk;
                            return cur('designer_tbl')
                                .where({
                                    ds_pk: did
                                })
                                .update({
                                    ds_name: designer_name,
                                    ds_score_communication: designer_score_communication,
                                    ds_score_timestrict: designer_score_timestrict,
                                    ds_score_quality: designer_score_quality,
                                    ds_style: designer_style,
                                    ds_address: designer_address,
                                    ds_introduce: designer_introduce,
                                    ds_price_min: designer_price_min,
                                    ds_price_max: designer_price_max,
                                    ds_image: designer_image
                                });
                        }
                    })
                    .finally(() => {
                        res.json(
                            resHelper.getJson({
                                msg: 'ok'
                            })
                        );
                    })
                    .catch(reason => {
                        res.json(
                            resHelper.getError(reason)
                        );
                    });
            }
            else {
                cur('designer_tbl')
                    .returning('ds_pk')
                    .insert({
                        ds_name: designer_name,
                        ds_score_communication: designer_score_communication,
                        ds_score_timestrict: designer_score_timestrict,
                        ds_score_quality: designer_score_quality,
                        ds_style: designer_style,
                        ds_address: designer_address,
                        ds_introduce: designer_introduce,
                        ds_price_min: designer_price_min,
                        ds_price_max: designer_price_max,
                        ds_image: designer_image
                        ds_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                    })
                    .then(responses => {
                        did = responses[0];
                        res.json(
                            resHelper.getJson({
                                value: did
                            })
                        );
                    })
                    .catch(reason => {
                        res.json(
                            resHelper.getError(reason)
                        );
                    });
            }
        });
    }
});


router.post('/profile/constructor', (req, res, next) => {
    var page = req.body['page'];
    var filter = req.body['filter'];
    var pageInst = new paginationService(page);
    var filterInst = new filterService(filter);
    var pageData = pageInst.get();
    var filterData = filterInst.get();

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
        var query = cur('constructor_tbl')
            .select('*')
            .column(cur.raw(`
      (
        SELECT COUNT(*) AS count
        FROM profile_view_hst AS view
        WHERE view.pv_target = constructor_tbl.cr_pk AND view.pv_type = ?
      ) AS view
      `, 'C'));

        var filterSort = filterInst.getFilter('sort');

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

        var list = [];

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
            .catch(reason => {
                res.json(
                    resHelper.getError('시공자 정보를 가지고 오는 중 알 수 없는 오류가 발생하였습니다.')
                )
            });
    });
});


module.exports = router;