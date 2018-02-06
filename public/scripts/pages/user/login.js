$(function () {
    var $form = $('.management .form');

    var $submit = $form.find('button.submit');
    var $facebook = $form.find('button.oauth.facebook');
    var $naver = $form.find('button.oauth.naver');

    var loginCallback = function () {
        if (typeof location.queryString === 'object' && typeof location.queryString.redirect_url !== 'undefined') {
            location.replace(location.queryString.redirect_url);
        }
        else {
            location.replace('/manage');
        }
    };

    $form.bind('submit', function (event) {
        event.preventDefault();
        loading(true);
        http.post('/api/user/login', $form)
        .then(function (data, error) {
            loginCallback();
        })
        ['finally'](function () {
            loading(false);
        })
        ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'warning'
            });
        });
    });

    $submit.bind('click', function (event) {
        event.preventDefault();
        $form.triggerHandler('submit');
    });

    $facebook.bind('click', function (event) {
        event.preventDefault();
        var scopes = ['email', 'public_profile'];
        var auth = null;

        var fbTryWebLogin = function (authResponse) {
            loading(true);
            http.post('/api/user/login/facebook', {
                accessToken: authResponse.accessToken,
            })
            ['finally'](function () {
                loading(false);
            })
            .then(function (data) {
                loginCallback();
            })
            ['catch'](function (error) {
                swal({
                    title: '문제가 발생했습니다!',
                    text: error.message,
                    type: 'error'
                });
            });
        };

        var fbCheckPermission = function (authResponse) {
            FB.api('/me/permissions', function (response) {
                var permissions = response.data;

                scopes.forEach(function(element, idx) {
                    if (permissions.filter(function (v, i) {
                        return v.permission === element && v.status === 'granted';
                    }).length < 1) {
                        swal({
                            title: '페이스북의 모든 권한요청을 승인해주시기 바랍니다.',
                            type: 'warning'
                        }, function () {
                            fbLogin();
                        });
                        return;
                    }
                });
                fbTryWebLogin(authResponse);
            });
        };

        var fbLogin = function () {
            FB.login(function (response) {
                fbCheckPermission(response.authResponse);
            }, { scope: scopes.join(',') });
        };

        fbLogin();
    });

    $naver.bind('click', function (event) {
        event.preventDefault();
        var protocol = location.protocol;
        var domain = window.location.hostname + (location.port ? ':' + location.port : '');
        var redirectUrl = encodeURI(protocol + '//' + domain + '/oauth/naver');
        var state = 'RANDOM_STATE';
        var url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + NaverApiKey + '&redirect_uri=' + redirectUrl + '&state=' + state;

        var naverTryWebLogin = function (authResponse) {
            if (authResponse.error) {
                swal({
                    title: '문제가 발생했습니다!',
                    text: '네이버 로그인 중 알 수 없는 오류가 발생했습니다.',
                    type: 'error'
                });
            }
            else {
                loading(true);
                http.post('/api/user/login/naver', {
                    accessToken: authResponse.access_token,
                })
                ['finally'](function () {
                    loading(false);
                })
                    .then(function (data) {
                        loginCallback();
                    })
                ['catch'](function (error) {
                    swal({
                        title: '문제가 발생했습니다!',
                        text: error.message,
                        type: 'error'
                    });
                });
            }
        };

        window.oauthCallback = function (authResponse) {
            naverTryWebLogin(authResponse);
        };
        openWindow(url, '네이버로 로그인', 640, 600);
    });
});