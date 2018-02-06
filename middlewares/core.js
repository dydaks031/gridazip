const browser = require('browser-detect');
const appConfig = require('../services/app/config');

const MiddleWare = () => {
    return (req, res, next) => {
        res.locals.url = req.originalUrl;
        res.locals.agent = req.headers? req.headers['user-agent']:'';
        res.locals.browser = browser(req.headers['user-agent']);
        res.locals.domain = appConfig.domain[res.app.locals.env];
        res.locals.sitename = appConfig.site.name;
        res.locals.description = appConfig.site.description;
        res.locals.keywords = appConfig.site.keywords;
        res.locals.path = req.path;

        next();
    };
};

module.exports = MiddleWare;