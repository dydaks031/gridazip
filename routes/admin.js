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

module.exports = router;
