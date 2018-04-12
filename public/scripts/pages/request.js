var requestView = function(options) {

    var authTimer = null;
    var authValidateTime = null;
    var authValidated = false;

    var $authRequestBtn = options.authRequestBtn,
        $confirmBtn = options.confirmBtn,
        $form = options.form;

    var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

    var bindEvent = function() {
        $authRequestBtn.bind('click', authRequest);
        $confirmBtn.bind('click', authValidate);
        // $confirmBtn.bind('click', requestConsultation);
        $form.bind('submit', function (event) {
            event.preventDefault();
        });
    };

    var decrementTime = function () {
        $('.auth-timer').text(toMinSec(authValidateTime));
        if(authValidateTime > 0) authValidateTime--;
        else {
            clearInterval(authTimer);
        }
    };

    var toMinSec = function (t) {
        var min;
        var sec;
        min = Math.floor(t / 60);
        sec = t - (min * 60);
        if(sec < 10) sec = '0' + sec;
        return min + ':' + sec;
    };

    var startTimer = function() {
        authValidateTime = 180;
        clearInterval(authTimer);
        authTimer = setInterval(function(){decrementTime()}, 1000);
    };

    var authRequest = function() {

        // var hiddenInput = $form.find('.request-input-wrapper.hide');
        //
        // hiddenInput.show();
        //
        // return;
        var formData = $form.serializeJson();

        event.preventDefault();
        if (authValidateTime > 150) {
            swal({
                title: (authValidateTime - 150) + '초 뒤에 다시 시도해주세요.',
                type: 'warning'
            });
        } else if (formData.user_phone === '') {
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (regexPhone.test(formData.user_phone) === false) {
            swal({
                title: '휴대폰 번호 형식이 올바르지 않습니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else {
            var data = {
                phone: formData.user_phone
            };

            http.post('/api/authentication/sms/request', data)
                .then(function (data) {
                    if (!data.isError) {
                        $('.form-item.auth').show();
                        startTimer();
                        swal({
                            title: data.msg,
                            type: 'success'
                        });
                    }
                })
                ['catch'](function (error) {
                swal({
                    title: error.value,
                    type: 'warning'
                });
            });
        }
    };


    var authValidate = function (event) {
        event.preventDefault();
        console.log('auth-validate');
        var formData = $form.serializeJson();

        var data = {
            phone: formData.user_phone.toString(),
            authKey: formData.auth_key,
        };

        if (formData.user_phone === '') {
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (regexPhone.test(formData.user_phone) === false) {
            swal({
                title: '휴대폰 번호 형식이 올바르지 않습니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (authValidateTime === 0) {
            swal({
                title: '인증 유효 시간이 초과되었습니다. 다시 인증하여 주시기 바랍니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else {
            http.post('/api/authentication/sms/validate', data)
                .then(function (data) {
                    if (!data.isError) {
                        // swal({
                        //     title: data.msg,
                        //     type: 'success'
                        // });
                        authValidated = true;
                        requestConsultation();
                    }
                    else {
                        swal({
                            title: data.value,
                            type: 'warning'
                        });
                    }
                })
                ['catch'](function (error) {
                console.log(error);
                swal({
                    title: error.value,
                    type: 'warning'
                });
            });
        }
    };


    var requestConsultation = function () {
        console.log(authValidated);
        console.log(typeof authValidated);

        var data = $form.serializeJson();

        /**
         * GA Request start event tracking.
         */
        ga('send', 'event', 'request', 'start', location.pathname);

        if (data.user_name === '') {
            swal({
                title: '이름은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_name]').focus();
                }, 50);
            });
        } else if (data.user_phone === '') {
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (authValidateTime === null || authValidateTime === 0) {
            swal({
                title: '핸드폰번호 인증이 필요합니다.\n인증번호요청 버튼을 눌러주시기 바랍니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (data.auth_key === '') {
            swal({
                title: '인증번호를 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=auth_key]').focus();
                }, 50);
            });
        } else if (authValidated === false) {
            swal({
                title: '인증번호 확인이 필요합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=auth_key]').focus();
                }, 50);
            });
        }
        else if (regexPhone.test(data.user_phone) === false) {
            swal({
                title: '휴대폰 번호 형식이 올바르지 않습니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        }
        else {
            loading(true);
            http.post('/api/request/save', data)
                ['finally'](function () {
                loading(false);
            })
                .then(function (data) {
                    /**
                     * GA Request complete event tracking.
                     */
                    ga('send', 'event', 'request', 'complete', location.pathname);

                    window.onbeforeunload = null;
                    swal({
                        title: '견적 상담 요청이 완료되었습니다.',
                        text: '',
                        type: 'success',
                        confirmButtonText: '확인'
                    });
                })
                ['catch'](function (error) {
                swal({
                    title: error.value,
                    type: 'warning'
                });
            });
        }
    };

    return {
        bindEvent: bindEvent,
    }
};

requestView.prototype.bindEvent = function(options) {

}

$(function () {

});