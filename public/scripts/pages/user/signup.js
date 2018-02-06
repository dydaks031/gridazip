$(function() {
  var $forms = $('.management form');
  var $formAgree = $('.management .form-agree');
  var $formSignup = $('.management .form-signup');
  var $step = $('.step');
  var $nextButton = $formAgree.find('button.next');
  var $completeButton = $formSignup.find('button.complete');
  var $verifyButton = $formSignup.find('a.user_id_verify');
  var $agreeTerms = $formAgree.find('.agree-terms');
  var $agreePrivacy = $formAgree.find('.agree-privacy');
  var $agreeAll = $formAgree.find('.agree-all');
  var $agreeSms = $formAgree.find('.agree-sms');

  //var regexId = /^[A-Za-z\d_-]{5,}$/;
  var regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{8,}$/;
  var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
  var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var $inputUserId = $formSignup.find('#user_id');
  var $inputUserPw = $formSignup.find('#user_pw');
  var $inputUserPwConfirm = $formSignup.find('#user_pw_confirm');
  var $inputUserName = $formSignup.find('#user_name');
  var $inputUserEmailFirst = $formSignup.find('#user_email_first');
  var $inputUserEmailLast = $formSignup.find('#user_email_last');
  var $inputUserEmailLastDirect = $formSignup.find('#user_email_last_direct');
  var $inputUserPhone = $formSignup.find('#user_phone');

  var verifiedId = '';

  var validation = function(data) {
    if (data.user_id === '') {
      swal({
        title: '아이디는 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_pw === '') {
      swal({
        title: '비밀번호는 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPw.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_pw_confirm === '') {
      swal({
        title: '비밀번호 확인란은 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPwConfirm.focus(); 
        }, 50);
      });
      return;
    }
    else if(data.user_name === '') {
      swal({
        title: '이름은 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserName.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_phone === '') {
      swal({
        title: '휴대폰 번호는 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPhone.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_id.length < 5) {
      swal({
        title: '아이디는 적어도 5글자 이상으로 입력해주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
      return;
    }
    else if(regexEmail.test(data.user_id) === false) {
      swal({
        title: '아이디는 이메일 형식으로 입력하셔야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_pw.length < 7) {
      swal({
        title: '비밀번호는 적어도 8글자 이상으로 입력해주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPw.focus();
        }, 50);
      });
      return;
    }
    else if(regexPassword.test(data.user_pw) === false) {
      swal({
        title: '비밀번호는 영문자와 숫자를 적어도 1개씩 포함해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPw.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_pw !== data.user_pw_confirm) {
      swal({
        title: '비밀번호 확인 값과 일치하지 않습니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPwConfirm.focus();
        }, 50);
      });
      return;
    }
    else if(data.user_name.length < 2) {
      swal({
        title: '이름은 적어도 2글자 이상으로 입력해주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserName.focus();
        }, 50);
      });
      return;
    }
    else if(regexPhone.test(data.user_phone) === false) {
      swal({
        title: '휴대폰 번호 형식이 올바르지 않습니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserPhone.focus();
        }, 50);
      });
      return;
    }
    /*
    else if (data.user_email_first !== '') {
      var email = data.user_email_first + '@';

      if (data.user_email_last === 'direct') {
        email += data.user_email_last_direct;
      }
      else {
        email += data.user_email_last;
      }

      if (regexEmail.test(email) === false) {
        swal({
          title: '이메일 형식이 올바르지 않습니다.',
          type: 'warning'
        }, function() {
          setTimeout(function() {
            $inputUserEmailFirst.focus();
          }, 50);
        });
        return;
      }

      data.user_email = email;
    }
    */
    else if ($verifyButton.hasClass('active') === false) {
      swal({
        title: '아이디 중복확인을 하시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $verifyButton.focus();
        }, 50);
      });
      return;
    }

    loading(true);
    http.post('/api/user/signup', data)
      ['finally'](function() {
        loading(false);
      })
      .then(function(data) {
        swal({
          title: '회원가입이 완료되었습니다!',
          text: '로그인 페이지로 이동하여 생성한 계정에 접속하세요.',
          type: 'success',
          confirmButtonText: '로그인 페이지로 이동'
        }, function() {
          location.href = '/user/login';
        });
      })
      ['catch'](function(error) {
        swal({
          title: error.value,
          type: 'warning'
        });
      });
  };

  $inputUserId.bind('keyup keydown', function(event) {
    if (verifiedId !== null) {
      var currentUserId = $inputUserId.val();

      if (currentUserId !== verifiedId) {
        verifiedId = null;
        $verifyButton.removeClass('active');
      }
    }
  });

  $inputUserEmailLast.bind('change', function(event) {
    var value = $inputUserEmailLast.val();

    if (value === 'direct') {
      $inputUserEmailLast.closest('.form-item').next().show();
      $inputUserEmailLastDirect.focus();
    } else {
      $inputUserEmailLast.closest('.form-item').next().hide();
      $inputUserEmailLastDirect.val('');
    }
  });

  $forms.bind('submit', function(event) {
    event.preventDefault();
  });

  $verifyButton.bind('click', function(event) {
    event.preventDefault();
    var data = $formSignup.serializeJson();
    if (data.user_id === '') {
      swal({
        title: '아이디는 반드시 입력해야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
    }
    else if(data.user_id.length < 5) {
      swal({
        title: '아이디는 적어도 5글자 이상으로 입력해주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
    }
    else if(regexEmail.test(data.user_id) === false) {
      swal({
        title: '아이디는 이메일 형식으로 입력하셔야 합니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $inputUserId.focus();
        }, 50);
      });
    }
    else {
      loading(true);
      http.post('/api/user/verify/id', {
        user_id: data.user_id
      })
        ['finally'](function() {
          loading(false);
        })
        .then(function(data) {
          if (data.verify === true) {
            swal({
              title: '해당 아이디는 사용이 가능합니다.',
              type: 'success'
            });
            verifiedId = data.user_id;
            $verifyButton.addClass('active');
          }
          else {
            swal({
              title: '중복된 아이디가 존재합니다.',
              type: 'warning'
            });
          }
        })
        ['catch'](function(error) {
          swal({
            title: error.value,
            type: 'warning'
          });
        });
    }
  });

  $nextButton.bind('click', function(event) {
    event.preventDefault();

    var formData = $formAgree.serializeJson();

    if (
      typeof formData['agree-terms'] === 'undefined' ||
      formData['agree-terms'] !== 'Y'
    ) {
      swal({
        title: '이용약관에 동의하여 주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $agreeTerms.focus();
        }, 50);
      });
    }
    else if (
      typeof formData['agree-privacy'] === 'undefined' ||
      formData['agree-privacy'] !== 'Y'
    ) {
      swal({
        title: '개인정보처리방침에 동의하여 주시기 바랍니다.',
        type: 'warning'
      }, function() {
        setTimeout(function() {
          $agreePrivacy.focus();
        }, 50);
      });
    }
    else {
      var $active = $step.filter('.active');
      var $next = $active.next();
      
      if ($next.hasClass('step')) {
        $next.addClass('active');
        $active.removeClass('active');
      }
    }
  });

  $formAgree.find('input:checkbox').not($agreeAll).bind('change', function(event) {
    var $this = $(this);
    var checked = $this.prop('checked');

    if (checked === false) {
      $agreeAll.prop('checked', false);
    } 
    else {
      if ($formAgree.find('input:checkbox').not($agreeAll).not(':checked').length < 1) {
        $agreeAll.prop('checked', true);
      }
    }
  });

  $agreeAll.bind('change', function(event) {
    var checked = $agreeAll.prop('checked');

    $formAgree.find('input:checkbox').not($agreeAll).prop('checked', checked);
  });

  $completeButton.bind('click', function(event) {
    event.preventDefault();
    var user = $formSignup.serializeJson();
    validation(user);
  });
});