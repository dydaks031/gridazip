const express = require('express');
const FB = require('fb');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const appHelper = require('../../services/app/helper');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');
const randomHelper = require('../../services/random/helper');
const moment = require('moment');

const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{8,}$/;
const regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

router.post('/verify/id', (req, res, next) => {
    var user_id = req.body['user_id'] || '';
    var errorMsg = null;

    if (user_id === '') {
        errorMsg = '아이디는 반드시 입력해야 합니다.';
    }
    else if (user_id.length < 5) {
        errorMsg = '아이디는 적어도 5글자 이상으로 입력해주시기 바랍니다.';
    }
    else if (regexEmail.test(user_id) === false) {
        errorMsg = '아이디는 이메일 형식으로 입력하셔야 합니다.';
    }
    else {
        knexBuilder.getConnection()
            .then(cur => {
                cur('user_tbl').count('* as cnt').where({ user_id: user_id }).limit(1)
                    .then(response => {
                        var count = response[0].cnt;
                        var verify = count < 1;
                        res.json(
                            resHelper.getJson({
                                verify: verify
                            })
                        );
                    });
            })
            .catch(reason => {
                res.json(
                    resHelper.getError('아이디 중복확인 중 알 수 없는 오류가 발생했습니다.')
                );
                throw reason;
            });
    }

    if (errorMsg !== null) {
        return res.json(
            resHelper.getError(errorMsg)
        );
    }
});

router.post('/signup', (req, res, next) => {
    var user_id = req.body['user_id'] || '';
    var user_pw = req.body['user_pw'] || '';
    var user_name = req.body['user_name'] || '';
    var user_pw_confirm = req.body['user_pw_confirm'] || '';
    var user_email = user_id || '';
    var user_phone = req.body['user_phone'] || '';
    var user_agree_sms = req.body['user_agree_sms'] || 'N';

    var errorMsg = null;

    if (user_id === '') {
        errorMsg = '아이디는 반드시 입력해야 합니다.';
    }
    else if (user_pw === '') {
        errorMsg = '비밀번호는 반드시 입력해야 합니다.';
    }
    else if (user_pw_confirm === '') {
        errorMsg = '비밀번호 확인란은 반드시 입력해야 합니다.';
    }
    else if (user_name === '') {
        errorMsg = '이름은 반드시 입력해야 합니다.';
    }
    else if (user_phone === '') {
        errorMsg = '휴대폰 번호는 반드시 입력해야 합니다.';
    }
    else if (user_id.length < 5) {
        errorMsg = '아이디는 적어도 5글자 이상으로 입력해주시기 바랍니다.';
    }
    else if (regexEmail.test(user_id) === false) {
        errorMsg = '아이디는 이메일 형식으로 입력하셔야 합니다.';
    }
    else if (user_pw.length < 7) {
        errorMsg = '비밀번호는 적어도 8글자 이상으로 입력해주시기 바랍니다.';
    }
    else if (regexPassword.test(user_pw) === false) {
        errorMsg = '비밀번호는 영문자와 숫자를 적어도 1개씩 포함해야 합니다.';
    }
    else if (user_pw !== user_pw_confirm) {
        errorMsg = '비밀번호 확인 값과 일치하지 않습니다.';
    }
    else if (user_name.length < 2) {
        errorMsg = '이름은 적어도 2글자 이상으로 입력해주시기 바랍니다.';
    }
    else if (regexPhone.test(user_phone) === false) {
        errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
    }
    else {
        knexBuilder.getConnection().then(cur => {
            cur('user_tbl').insert({
                user_id: user_id,
                user_pw: cur.raw('PASSWORD(?)', [user_pw]),
                user_name: user_name,
                user_email: user_email,
                user_phone: user_phone.replace(/-/g, ''),
                user_agree_sms: user_agree_sms,
                user_recency: cur.raw('UNIX_TIMESTAMP() * -1')
            })
                .then(response => {
                    res.json(
                        resHelper.getJson({
                            msg: 'OK'
                        })
                    );
                })
                .catch(reason => {
                    if (reason.errno === 1062) {
                        // Duplication error
                        cur('user_tbl').count('* as cnt').where({ user_id: user_id }).limit(1)
                            .then(response => {
                                var count = response[0].cnt;
                                var verify = count < 1;
                                if (verify === false) {
                                    res.json(
                                        resHelper.getError('중복된 아이디가 존재합니다.')
                                    )
                                } else {
                                    res.json(
                                        resHelper.getError('회원가입 처리를 진행하는 도중 알 수 없는 문제가 발생했습니다.')
                                    );
                                }
                            })
                            .catch(reason => {
                                res.json(
                                    resHelper.getError('회원가입 처리를 진행하는 도중 알 수 없는 문제가 발생했습니다.')
                                );
                                throw reason;
                            });
                    }
                    throw reason;
                });
        });
    }
});

router.post('/login/facebook', (req, res, next) => {
    var session = req.session;

    var accessToken = req.body['accessToken'] || '';
    var type = 'facebook';

    FB.setAccessToken(accessToken);
    FB.api('/me', {
        fields: ['id', 'name', 'email']
    }, oauthUser => {
        knexBuilder.getConnection().then(cur => {
            cur('user_tbl')
                .where({
                    user_oauth_user: oauthUser.id,
                    user_oauth_type: type
                })
                .limit(1)
                .then(response => {
                    var count = response.length;

                    if (count > 0) {
                        var user = response[0];
                        appHelper.setUser(user, session)
                            .then(() => {
                                ;
                                return res.json(
                                    resHelper.getJson({
                                        result: 'ACK'
                                    })
                                );
                            })
                            .catch(() => {
                                return res.json(
                                    resHelper.getError('로그인 처리 중 알 수 없는 문제가 발생하였습니다.')
                                );
                            });
                    }
                    else {
                        cur('user_tbl').returning('id').insert({
                            user_id: oauthUser.email,
                            user_name: oauthUser.name,
                            user_pw: cur.raw(`PASSWORD(?)`, [oauthUser.id]),
                            user_oauth_user: oauthUser.id,
                            user_oauth_type: type,
                            user_email: oauthUser.email,
                            user_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                        })
                            .then(response => {
                                var user_pk = response[0];
                                return cur('user_tbl')
                                    .where({
                                        user_pk: user_pk
                                    })
                                    .limit(1)
                            })
                            .then(response => {
                                var user = response[0];
                                appHelper.setUser(user, session)
                                    .then(() => {
                                        return res.json(
                                            resHelper.getJson({
                                                result: 'ACK'
                                            })
                                        );
                                    })
                                    .catch(() => {
                                        return res.json(
                                            resHelper.getError('로그인 처리 중 알 수 없는 문제가 발생하였습니다.')
                                        );
                                    });
                            })
                            .catch(reason => {
                                throw reason;
                            });
                    }
                })
                .catch(reason => {
                    res.json(
                        resHelper.getError('페이스북 로그인 도중 알 수 없는 에러가 발생했습니다.')
                    );
                    throw reason;
                });
        });
    });
});

router.post('/login/naver', (req, res, next) => {
    var session = req.session;

    var accessToken = req.body['accessToken'] || '';
    var type = 'naver';
    var header = "Bearer " + accessToken;
    var api_url = 'https://openapi.naver.com/v1/nid/me';
    var request = require('request');
    var options = {
        url: api_url,
        headers: { 'Authorization': header }
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var oauthUser = JSON.parse(body).response;
            knexBuilder.getConnection().then(cur => {
                cur('user_tbl')
                    .where({
                        user_oauth_user: oauthUser.id,
                        user_oauth_type: type
                    })
                    .limit(1)
                    .then(response => {
                        var count = response.length;

                        if (count > 0) {
                            var user = response[0];
                            appHelper.setUser(user, session)
                                .then(() => {
                                    return res.json(
                                        resHelper.getJson({
                                            result: 'ACK'
                                        })
                                    );
                                })
                                .catch(() => {
                                    return res.json(
                                        resHelper.getError('로그인 처리 중 알 수 없는 문제가 발생하였습니다.')
                                    );
                                });
                        }
                        else {
                            cur('user_tbl').returning('id').insert({
                                user_id: oauthUser.email,
                                user_name: oauthUser.name,
                                user_pw: cur.raw('PASSWORD(?)', [oauthUser.id]),
                                user_oauth_user: oauthUser.id,
                                user_oauth_type: type,
                                user_email: oauthUser.email,
                                user_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                            })
                                .then(response => {
                                    var user_pk = response[0];
                                    cur('user_tbl')
                                        .where({
                                            user_pk: user_pk
                                        })
                                        .limit(1)
                                        .then(response => {
                                            var user = response[0];
                                            appHelper.setUser(user, session)
                                                .then(() => {
                                                    return res.json(
                                                        resHelper.getJson({
                                                            result: 'ACK'
                                                        })
                                                    );
                                                })
                                                .catch(() => {
                                                    return res.json(
                                                        resHelper.getError('로그인 처리 중 알 수 없는 문제가 발생하였습니다.')
                                                    );
                                                });
                                        })
                                        .catch(reason => {
                                            throw reason;
                                        });
                                })
                                .catch(reason => {
                                    throw reason;
                                });
                        }
                    })
                    .catch(reason => {
                        res.json(
                            resHelper.getError('페이스북 로그인 도중 알 수 없는 에러가 발생했습니다.')
                        );
                        throw reason;
                    });
            });
        }
        else {
            throw new Error(error);
        }
    });
});

router.post('/login', (req, res, next) => {
    var session = req.session;

    var user_id = req.body['user_id'] || '';
    var user_pw = req.body['user_pw'] || '';

    if (user_id === '') {
        res.json(
            resHelper.getError('로그인 하실 계정의 아이디를 입력해주세요.')
        );
        return;
    }

    if (user_pw === '') {
        return res.json(
            resHelper.getError('로그인 하실 계정의 패스워드를 입력해주세요.')
        );
    }

    knexBuilder.getConnection()
        .then(cur => {
            cur('user_tbl')
            .where({ 
                user_id: user_id
            })
            .whereNull('user_oauth_type')
            .whereRaw('user_pw = PASSWORD(?)', [user_pw]).limit(1)
                .then(response => {
                    if (response.length > 0) {
                        var user = response[0];
                        appHelper.setUser(user, session)
                            .then(() => {
                                return res.json(
                                    resHelper.getJson({
                                        result: 'ACK'
                                    })
                                );
                            })
                            .catch(() => {
                                return res.json(
                                    resHelper.getError('로그인 처리 중 알 수 없는 문제가 발생하였습니다.')
                                );
                            });
                    }
                    else {
                        return res.json(
                            resHelper.getError('해당 아이디와 패스워드에 일치하는 사용자가 없습니다.')
                        );
                    }
                })
                .catch(reason => {
                    res.json(
                        resHelper.getError('로그인 도중 알 수 없는 문제가 발생했습니다.')
                    );
                    throw reason;
                });
        });
});

router.post('/find/id', (req, res, next) => {
    var user_name = req.body['user_name'] || null;
    var user_phone = req.body['user_phone'] || null;

    var errorMsg = null;

    if (user_name === null) {
        errorMsg = '이름을 입력해주세요.';
    }
    else if (user_phone === null) {
        errorMsg = '휴대폰 번호를 입력해주세요.';
    }
    else if (regexPhone.test(user_phone) === false) {
        errorMsg = '휴대폰 번호 형식이 올바르지 않습니다.';
    }

    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
        knexBuilder.getConnection().then(cur => {
            cur('user_tbl')
                .select('user_id')
                .where({
                    user_name: user_name,
                    user_phone: user_phone.replace(/-/g, '')
                })
                .orderBy('user_tbl.user_recency')
                .then(response => {
                    for (var idx in response) {
                        let item = response[idx];
                        let user_id = item.user_id;
                        let user_id_splited = user_id.split('@');
                        let length = user_id_splited[0].length;
                        let star = [];
                        for (var index = 0; index < length - Math.ceil(length / 2); index++) {
                            star.push('*');
                        }
                        user_id_splited[0] = user_id_splited[0].substring(0, Math.ceil(length / 2)) + star.join('');

                        if (typeof user_id_splited[1] === 'undefined') {
                            item.user_id = user_id_splited[0];
                        }
                        else {
                            item.user_id = user_id_splited[0] + '@' + user_id_splited[1];
                        }
                    }

                    res.json(
                        resHelper.getJson({
                            data: response
                        })
                    );
                })
                .catch(reason => {
                    res.json(
                        resHelper.getError('사용자 아이디를 찾는 중 알 수 없는 문제가 발생하였습니다.')
                    );
                });
        });
    }
});

router.post('/find/pw', (req, res, next) => {
    var user_name = req.body['user_name'] || null;
    var user_email = req.body['user_email'] || null;

    var errorMsg = null;

    if (user_name === null) {
        errorMsg = '이름을 입력해주세요.';
    }
    else if (user_email === null) {
        errorMsg = '이메일 주소를 입력해주세요.';
    }
    else if (regexEmail.test(user_email) === false) {
        errorMsg = '이메일 주소 형식이 올바르지 않습니다.';
    }

    if (errorMsg !== null) {
        res.json(
            resHelper.getError(errorMsg)
        );
    }
    else {
        knexBuilder.getConnection().then(cur => {
            cur('user_tbl')
                .select('user_id')
                .where({
                    user_name: user_name,
                    user_email: user_email
                })
                .limit(1)
                .then(response => {
                    if (response.length < 1) {
                        res.json(
                            resHelper.getError('해당 정보와 일치하는 사용자를 찾을 수 없습니다.')
                        );
                    }
                    else {
                        let key = cryptoHelper.encrypt(user_email);
                        randomHelper.getString(64)
                            .then(token => {
                                cur('user_find_token_hst')
                                    .update({
                                        ut_is_used: 'Y'
                                    })
                                    .where({
                                        ut_key: key,
                                        ut_is_used: 'N'
                                    })
                                    .then(response => {
                                        return cur('user_find_token_hst')
                                            .insert({
                                                ut_key: key,
                                                ut_token: token,
                                                ut_expiration: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:dd'),
                                                ut_recency: cur.raw('UNIX_TIMESTAMP() * -1')
                                            });
                                    })
                                    .then(response => {
                                        res.json(
                                            resHelper.getJson({
                                                value: 'OK'
                                            })
                                        );
                                    })
                                    .catch(reason => {
                                        resHelper.getError('사용자 비밀번호 변경 링크를 발급하는 중 알 수 없는 문제가 발생하였습니다.')
                                    });
                            });
                    }
                })
                .catch(reason => {
                    res.json(
                        resHelper.getError('사용자 비밀번호를 찾는 중 알 수 없는 문제가 발생하였습니다.')
                    );
                });
        });
    }
});

module.exports = router;