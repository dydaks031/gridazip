const express = require('express');
const router = express.Router();

router.get('/*', (req, res, next) => {
    if (req.user === null || req.user.user_permit !== 'A') {
        res.redirect('/user/login?redirect_url=' + req.originalUrl);
    }
    else {
        next();
    }
});

router.get('/', (req, res, next) => {
    res.render('pages/admin/index', {
        id: 'admin',
        sub: 'index',
        title: '관리자 홈',
        fullscreen: false
    });
});

router.get('/portfolio/list', (req, res, next) => {
    res.render('pages/admin/portfolio-list', {
        id: 'admin',
        sub: 'portfolio',
        title: '포트폴리오 목록',
        fullscreen: false
    });
});

router.get('/portfolio/:pid*?', (req, res, next) => {
    var portfolioID = req.params.pid;
    res.render('pages/admin/portfolio', {
        id: 'admin',
        sub: 'portfolio',
        title: '포트폴리오 관리',
        fullscreen: false,
        pid: portfolioID
    });
});

router.get('/designer/list', (req, res, next) => {
    res.render('pages/admin/designer-list', {
        id: 'admin',
        sub: 'designer',
        title: '디자이너 목록',
        fullscreen: false
    });
});

router.get('/designer/:did*?', (req, res, next) => {
    var designerId = req.params.did;
    res.render('pages/admin/designer', {
        id: 'admin',
        sub: 'designer',
        title: '디자이너 관리',
        fullscreen: false,
        did: designerId
    });
});

router.get('/constructor/list', (req, res, next) => {
    res.render('pages/admin/constructor-list', {
        id: 'admin',
        sub: 'constructor',
        title: '시공자 목록',
        fullscreen: false
    });
});

router.get('/constructor/:cid*?', (req, res, next) => {
    var constructorId = req.params.cid;
    res.render('pages/admin/constructor', {
        id: 'admin',
        sub: 'constructor',
        title: '시공자 관리',
        fullscreen: false,
        cid: constructorId,
    });
});

module.exports = router;
