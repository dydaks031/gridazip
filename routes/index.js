const express = require('express');
const router = express.Router();
const knexBuilder = require('../services/connection/knex');

router.get('/', (req, res, next) => {
    res.render('pages/main', {
        id: 'main',
        sub: 'index',
        title: '그리다집 | 기술이 측정하고 사람이 완성하다',
        fullscreen: false
    });
});

router.get('/rss', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        cur('portfolio_tbl')
            .orderBy('pf_recency')
            .then(response => {
                res.contentType('application/rss+xml');
                res.render('feeds/rss', {
                    list: response
                });
            })
            .catch(reason => {

            });
    });
});
//
// router.get('/user/login', (req, res, next) => {
//     var showMessage = !!req.query.redirect_url;
//
//     res.render('pages/user/login', {
//         id: 'login',
//         sub: 'index',
//         title: '로그인',
//         fullscreen: false,
//         showMessage: showMessage
//     });
// });
//
// router.get('/user/logout', (req, res, next) => {
//     var redirectUrl = req.query.redirect_url;
//     var session = req.session;
//
//     session.user = null;
//
//     res.redirect(redirectUrl);
// });
//
// router.get('/user/signup', (req, res, next) => {
//     res.render('pages/user/signup', {
//         id: 'signup',
//         sub: 'index',
//         title: '회원가입',
//         fullscreen: false
//     });
// });
//
// router.get('/user/find', (req, res, next) => {
//     res.render('pages/user/find', {
//         id: 'find',
//         sub: 'index',
//         title: '아이디 & 비밀번호 찾기',
//         fullscreen: false
//     });
// });
//
// router.get('/user/find/id', (req, res, next) => {
//     res.render('pages/user/find/id', {
//         id: 'find',
//         sub: 'id',
//         title: '아이디 찾기',
//         fullscreen: false
//     });
// });
//
// router.get('/user/find/pw', (req, res, next) => {
//     res.render('pages/user/find/pw', {
//         id: 'find',
//         sub: 'pw',
//         title: '비밀번호 찾기',
//         fullscreen: false
//     });
// });

router.get('/support', (req, res, next) => {
    res.render('pages/support', {
        id: 'support',
        sub: 'index',
        title: '고객센터',
        fullscreen: false
    });
});
//
// router.get('/intro', (req, res, next) => {
//     res.render('pages/intro', {
//         id: 'intro',
//         sub: 'index',
//         title: '그리다집이란',
//         fullscreen: false
//     });
// });


router.get('/about', (req, res, next) => {
    res.render('pages/about', {
        id: 'about',
        sub: 'index',
        title: '그리다집이란',
        fullscreen: false
    });
});


router.get('/portfolio', (req, res, next) => {
    res.render('pages/portfolio', {
        id: 'portfolio',
        sub: 'index',
        title: '그리다집 포트폴리오',
        fullscreen: false
    });
});

router.get('/portfolio/:pid', (req, res, next) => {
    var pid = req.params.pid;
    
    knexBuilder.getConnection().then(cur => {
        cur('portfolio_tbl')
            .innerJoin('work_tbl', 'portfolio_tbl.pf_wkpk', 'work_tbl.wk_pk')
            .innerJoin('designer_tbl', 'work_tbl.wk_dspk', 'designer_tbl.ds_pk')
            .where('portfolio_tbl.pf_pk', pid)
            .limit(1)
            .then(response => {
                portfolio = response ? response[0] : null;
                return cur('portfolio_image_hst')
                    .orderBy('portfolio_image_hst.pi_is_primary', 'desc')
                    .where('pi_pfpk', pid);
            })
            .then(response => {
                images = response;

                
                res.render('pages/portfolio-detail', {
                    id: 'portfolio',
                    sub: 'index',
                    title: portfolio.pf_address + ' : ' + portfolio.pf_title,
                    description: portfolio.pf_description,
                    fullscreen: false,
                    pid: pid,
                    portfolio: portfolio,
                    images: images
                });
            })
            .catch(reason => {
                console.error(reason);
            });
    });
});

// router.get('/request', (req, res, next) => {
//     res.render('pages/request', {
//         id: 'request',
//         sub: 'index',
//         title: '무료견적받기',
//         fullscreen: false
//     });
// });
//
// router.get('/profile/:type?', (req, res, next) => {
//     var type = req.params.type || 'designer';
//
//     if (type === 'constructor') {
//         res.render('pages/profile-constructor', {
//             id: 'profile',
//             sub: 'constructor',
//             title: '시공자 소개',
//             fullscreen: false
//         });
//     } else {
//         res.render('pages/profile-designer', {
//             id: 'profile',
//             sub: 'designer',
//             title: '디자이너 소개',
//             fullscreen: false
//         });
//     }
// });
//
// router.get('/manage', (req, res, next) => {
//     if (req.user === null) {
//         res.redirect('/user/login?redirect_url=' + req.originalUrl);
//     }
//     else {
//         res.render('pages/manage', {
//             id: 'manage',
//             sub: 'index',
//             title: '내 공사관리',
//             fullscreen: false
//         });
//     }
// });
//
// router.get('/profiles-member', (req, res, next) => {
//     res.render('pages/profiles-member', {
//         id: 'profile',
//         sub: 'index',
//         title: '인테리어 팀',
//         fullscreen: false
//     });
// });
//
// router.get('/profiles-member/detail', (req, res, next) => {
//     res.render('pages/profiles-member-detail', {
//         id: 'profile',
//         sub: 'detail',
//         title: '인테리어 팀',
//         fullscreen: false
//     });
// });

router.get('/cooperation-request', (req, res, next) => {
    res.render('pages/cooperation-request', {
        id: 'cooperation',
        sub: 'index',
        title: '협력업체 신청',
        fullscreen: false
    });
});


module.exports = router;
