var requestView = function(options) {

    var authTimer = null;
    var authValidateTime = null;
    var authValidated = false;

    var $authRequestBtn = options.authRequestBtn,
        $confirmBtn = options.confirmBtn,
        $backBtn = options.backBtn,
        $form = options.form;

    var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

    var bindEvent = function() {
        $authRequestBtn.bind('click', authRequest);
        $confirmBtn.bind('click', authValidate);

        if ($backBtn) {
            $backBtn.bind('click', backRequest);
        }

        $form.bind('submit', function (event) {
            event.preventDefault();
        });
    };

    var decrementTime = function () {
        $form.find('.timer').text(toMinSec(authValidateTime));
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

    var backRequest= function() {
        $form.find('.auth-input').addClass('hide');
        $form.find('.info-input').removeClass('hide');
    };

    var authRequest = function() {
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
            loading(true);

            http.post('/api/authentication/sms/request', data)
                .finally(function() {
                    loading(false);
                })
                .then(function (data) {
                    if (!data.isError) {
                        $form.find('.info-input').addClass('hide');
                        $form.find('.auth-input').removeClass('hide');

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
        var formData = $form.serializeJson();

        var data = {
            phone: formData.user_phone.toString(),
            authKey: formData.auth_key,
        };

        if (data.phone === '') {
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (regexPhone.test(data.phone) === false) {
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
            loading(true);
            http.post('/api/authentication/sms/validate', data)
                .finally(function() {
                })
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
                        loading(false);
                        swal({
                            title: data.value,
                            type: 'warning'
                        });
                    }
                })
                ['catch'](function (error) {
                    loading(false);
                    swal({
                        title: error.value,
                        type: 'warning'
                    });
                });
       }
    };


    var requestConsultation = function () {
        var data = $form.serializeJson();

        data.user_phone = data.user_phone.toString();

        /**
         * GA Request start event tracking.
         */
        ga('send', 'event', 'request', 'start', location.pathname);

        if (data.user_name === '') {
            loading(false);
            swal({
                title: '이름은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_name]').focus();
                }, 50);
            });
        } else if (data.user_phone === '') {
            loading(false);
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (authValidateTime === null || authValidateTime === 0) {
            loading(false);
            swal({
                title: '핸드폰번호 인증이 필요합니다.\n인증번호요청 버튼을 눌러주시기 바랍니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=user_phone]').focus();
                }, 50);
            });
        } else if (data.auth_key === '') {
            loading(false);
            swal({
                title: '인증번호를 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $form.find('[name=auth_key]').focus();
                }, 50);
            });
        } else if (authValidated === false) {
            loading(false);
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
            loading(false);
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
                        text: '자세한 사항은 유선으로 연락 드리겠습니다.\n문의사항은 무료상담 채팅을 이용해주세요.\n감사합니다.',
                        type: 'success',
                        confirmButtonText: '확인'
                    }, function() {
                        $form.find(':input')
                            .not(':button, :submit, :reset, :hidden')
                            .val('')
                            .removeAttr('checked')
                            .removeAttr('selected');

                        Modal.close('modal-request');
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