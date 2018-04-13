const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const get_ip = require('ipware')().get_ip;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression')
const session = require('express-session');
const mysqlSessionStore = require('./services/connection/session')(session);
const lessMiddleware = require('less-middleware');
const coreMiddleware = require('./middlewares/core');
const userMiddleware = require('./middlewares/user');
const subdomain = require('express-subdomain');
const raven = require('raven');
const moment = require('moment');

const env = process.env.NODE_ENV || 'development';

const viewHelper = require('./services/view/helper');
const cryptoHelper = require('./services/crypto/helper');
const connectionHelper = require('./services/connection/helper');

const global = require('./services/app/global');
const appConfig = require('./services/app/config');

const sessConnectionOption = connectionHelper.getInfo('default');
const sessionStore = new mysqlSessionStore(Object.assign({
    schema: {
        tableName: 'session_tbl',
        columnNames: {
            session_id: 'sess_id',
            expires: 'sess_expires',
            data: 'sess_data',
            recency: 'sess_recency'
        }
    }
}, sessConnectionOption));

const index = require('./routes/index');
const admin = require('./routes/admin');
const apiAdmin = require('./routes/api/admin');
const apiTest = require('./routes/api/test');
const apiComment = require('./routes/api/comment');
const apiQna = require('./routes/api/qna');
const apiUser = require('./routes/api/user');
const apiRequest = require('./routes/api/request');
const apiBoard = require('./routes/api/board');
const apiPortfolio = require('./routes/api/portfolio');
const apiProfile = require('./routes/api/profile');
const apiManage = require('./routes/api/manage');
const apiFile = require('./routes/api/file');
const apiWorker = require('./routes/api/worker');
const apiAuthentication = require('./routes/api/authentication');
const oauthNaver = require('./routes/oauth/naver');

raven.config('https://0f22cdb7d6f14189b765414605f7eb36:a76850f0a2e94b97a2dcc95da88af720@sentry.io/159366').install();

let app = express();
app.locals.moment = moment;
app.locals.env = env;
viewHelper.register(app.locals);

// oauth key setting.
global.auth = app.locals.auth = {
    facebook: appConfig.auth.facebook[env],
    naver: appConfig.auth.naver[env],
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(raven.requestHandler());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function (req, res, next) {
    req.ip = get_ip(req).clientIp;
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(session({
    key: appConfig.sess_key,
    secret: appConfig.sess_secure,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.use(coreMiddleware());
app.use(userMiddleware());

app.use('/', index);
// app.use('/admin/', admin);
// app.use('/api/admin', apiAdmin);
app.use('/api/test/', apiTest);
app.use('/api/comment/', apiComment);
app.use('/api/qna', apiQna);
app.use('/api/user/', apiUser);
app.use('/api/board/', apiBoard);
app.use('/api/request/', apiRequest);
app.use('/api/portfolio/', apiPortfolio);
app.use('/api/profile/', apiProfile);
app.use('/api/manage/', apiManage);
app.use('/api/file', apiFile);
app.use('/api/worker', apiWorker);
app.use('/api/authentication', apiAuthentication);
app.use(subdomain('worker', apiWorker));
app.use('/oauth/naver/', oauthNaver);
if (env === 'production') {
    let expires = 3600;
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: expires }));
    app.use(raven.errorHandler());
}
else {
    app.use(lessMiddleware(path.join(__dirname, 'public'), {
        preprocess: {
            path: function (pathname, req) {
                let prefix = /styles/;
                return pathname.replace(prefix, 'less');
            }
        },
        dest: path.join(__dirname, 'public'),
        debug: true,
        render: {
            compress: true
        }
    }));
    app.use(logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    //let err = new Error('Not Found');
    //err.status = 404;
    //next(err);
    res.redirect('/');
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
