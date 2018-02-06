$(function () {
    var $window = $(window);
    var $form = $('.service-form');

    var $inputUserName = $('#user_name');
    var $inputUserFamily = $('#user_family');
    var $inputUserFamilyOther = $('#user_family_other');
    var $inputUserSize = $('#user_size');
    var $inputUserAddressBrief = $('#user_address_brief');
    var $inputUserAddressDetail = $('#user_address_detail');
    var $inputUserPhone = $('#user_phone');
    var $inputUserMoveDate = $('#user_move_date');
    var $inputUserStyleLikes = $('#user_style_likes');
    var $inputUserStyleDislikes = $('#user_style_dislikes');
    var $inputUserColorLikes = $('#user_color_likes');
    var $inputUserColorDislikes = $('#user_color_dislikes');
    var $inputUserBudget = $('#user_budget');
    var $inputUserPlace = $('#user_place');
    var $inputUserDate = $('#user_date');
    var $inputUserTime = $('#user_time');
    var $inputUserTimeOther = $('#user_time_other');
    var $inputUserRequest = $('#user_request');
    var $inputUserRequestSelect = $('#user_request_select');
    var $inputUserRequestOther = $('#user_request_other');

    var request_size_map = {
        '': '평수 없음',
        'lt20': '20평대 미만',
        'eq20': '20평대',
        'eq30': '30평대',
        'eq40': '40평대',
        'eq50': '50평대',
        'eq60': '60평대',
        'gte70': '70평대 이상'
    };

    var request_budget_map = {
        '': '예산 선택안함',
        '1500~2000': '1500~2000만원',
        '2000~2500': '2000~2500만원',
        '2500~3000': '2500~3000만원',
        '3000~3500': '3000~3500만원',
        '3500~4000': '3500~4000만원',
        '4000~4500': '4000~4500만원',
        '4500~5000': '4500~5000만원',
        '5000~5500': '5000~5500만원',
        '5500~6000': '5500~6000만원',
        '6000~6500': '6000~6500만원',
        '6500~7000': '6500~7000만원',
        'lt1500': '1500만원 미만',
        'lt2000': '2000만원 미만',
        'lt2500': '2500만원 미만',
        'lt3000': '3000만원 미만',
        'lt3500': '3500만원 미만',
        'lt4000': '4000만원 미만',
        'lt4500': '4500만원 미만',
        'lt5000': '5000만원 미만',
        'gte2500': '2500만원 이상',
        'gte3000': '3000만원 이상',
        'gte3500': '3500만원 이상',
        'gte4000': '4000만원 이상',
        'gte4500': '4500만원 이상',
        'gte5000': '5000만원 이상',
        'gte6000': '6000만원 이상',
        'gte7000': '7000만원 이상',
        'contact': '협의로 결정'
    };

    $form.find('input, select, textarea').bind('change', function (event) {
        if (typeof event.originalEvent === 'undefined') {
            return;
        }

        window.onbeforeunload = function () {
            return '이 페이지를 나가게 되면,\n고객님이 작성하셨던 견적 신청 내용이 저장되지 않습니다.\n정말로 페이지를 나가시겠습니까?';
        }
    });

    var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;

    var validation = function (data) {
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
                    $inputUserName.focus();
                }, 50);
            });
        }
        /*
        else if (data.user_family === '') {
            swal({
                title: '가족구성원 항목은 반드시 선택해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserFamily.focus();
                }, 50);
            });
        }
        else if (data.user_size === '') {
            swal({
                title: '평수 항목은 반드시 선택해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserSize.focus();
                }, 50);
            });
        }
        else if (data.user_budget === '') {
            swal({
                title: '예산 항목은 반드시 선택해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserBudget.focus();
                }, 50);
            });
        }
        else if (data.user_address_brief === '') {
            swal({
                title: '기본주소는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserAddressBrief.focus();
                }, 50);
            });
        }
        else if (data.user_address_detail === '') {
            swal({
                title: '상세주소는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserAddressDetail.focus();
                }, 50);
            });
        }
        */
        else if (data.user_phone === '') {
            swal({
                title: '휴대폰 번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserPhone.focus();
                }, 50);
            });
        }
        /*
        else if (data.user_move_date === '') {
            swal({
                title: '이사 날짜는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserMoveDate.focus();
                }, 50);
            });
        }
        */
        else if (regexPhone.test(data.user_phone) === false) {
            swal({
                title: '휴대폰 번호 형식이 올바르지 않습니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserPhone.focus();
                }, 50);
            });
        }
        /*
        else if (
            data.user_date !== '' &&
            data.user_time === ''
        ) {
            swal({
                title: '방문 상담 시간을 선택해주세요.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserTime.focus();
                }, 50);
            });
        }
        else if (
            data.user_time !== '' &&
            data.user_date === ''
        ) {
            swal({
                title: '방문 상담 날짜를 선택해주세요.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserDate.focus();
                }, 50);
            });
        }
        else if (_.keys(request_size_map).indexOf(data.user_size) === -1) {
            swal({
                title: '허용되지 않는 평수입니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserSize.focus();
                }, 50);
            })
        }
        else if (data.user_budget !== '' && _.keys(request_budget_map).indexOf(data.user_budget) === -1) {
            swal({
                title: '허용되지 않는 예산 타입입니다.',
                type: 'warning'
            }, function () {
                setTimeout(function () {
                    $inputUserBudget.focus();
                }, 50);
            });
        }
        */
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
                        text: '아래 버튼을 클릭해서 메인 페이지로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '메인 페이지로 이동'
                    }, function () {
                        location.href = '/';
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

    $inputUserFamily.bind('change', function (event) {
        var $this = $(this);
        var $parent = $this.closest('.selectric-wrapper');
        var value = $this.val();

        if ($parent.length < 1) {
            $parent = $this;
        }

        if (value === 'other') {
            $parent.next().show().focus();
        }
        else {
            $parent.next().hide();
        }
    });

    $inputUserTime.bind('change', function (event) {
        var $this = $(this);
        var $parent = $this.closest('.selectric-wrapper') || $this;
        var value = $this.val();

        if ($parent.length < 1) {
            $parent = $this;
        }

        if (value === 'other') {
            $parent.next().show().pickatime({
                clear: '닫기',
                formatLabel: function (time) {
                    var hours = (time.pick - this.get('now').pick) / 60;
                    var label = hours < 0 ? ' !시간 전' : hours > 0 ? ' !시간 후' : '현재';
                    return 'h:i a <sm!all>' + (hours ? Math.abs(hours) : '') + label + '</sm!all>'
                }
            }).focus();
        }
        else {
            $selectric.next().hide();
        }
    });

    var $selectItemGroup = $('<div class="form-select-group"></div>');
    $inputUserRequestSelect.hide().find('option').each(function (index, element) {
        var $this = $(element);
        var $selectItem = $('\
      <a href="#" class="form-select-item form-select-request" data-value="' + $this.val() + '">\
        <i class="fa fa-square"></i>\
        <span>' + $this.text() + '</span>\
      </a>\
    ');
        $selectItem.bind('click', function (event) {
            event.preventDefault();
            var $this = $(this);
            var value = $this.data('value');

            $inputUserRequestSelect.val(value);

            if ($this.hasClass('active')) {
                $this.removeClass('active');
                $this.find('i').removeClass('fa-check-square').addClass('fa-square');
            }
            else {
                $this.addClass('active');
                $this.find('i').removeClass('fa-sqaure').addClass('fa-check-square');
            }

            if (value === 'other') {
                /*
                $this.siblings('.active').each(function(index, element) {
                  var $this = $(element);
                  $this.removeClass('active');
                  $this.find('i').removeClass('fa-check-square').addClass('fa-square');
                });
                */
                if ($this.hasClass('active') === true) {
                    $selectItemGroup.next().show().focus();
                } else {
                    $selectItemGroup.next().hide();
                }
            }
            else {
                $selectItemGroup.find('.form-select-item.active[data-value="other"]').each(function (index, element) {
                    var $this = $(element);
                    $this.removeClass('active');
                    $this.find('i').removeClass('fa-check-square').addClass('fa-square');
                });
            }
        });
        $selectItem.appendTo($selectItemGroup);
    });
    $selectItemGroup.insertAfter($inputUserRequestSelect);

    /*
    $inputUserRequestSelect.bind('change', function(event) {
      var $this = $(this);
      var $selectric = $this.closest('.selectric-wrapper');
      var value = $this.val();
  
      if (value === 'other') {
        $('.form-select-item.form-select-request').hide();
        $selectric.next().show().focus();
      }
      else {
        $('.form-select-item.form-select-request').show();
        $selectric.next().hide();
  
        if (value !== '') {
          var $item = $('<div class="form-select-item form-select-request" data-value="' + value + '"><span>' + value + '</span><a href="#" class="btn-close"><i class="pe-7s-close"></i></a></div>');
          $this.find('option[value="' + value + '"]').remove();
          $this.selectric('refresh');
          $item.find('.btn-close').bind('click', function(event) {
            event.preventDefault();
            var value = $item.data('value');
            var $option = $('option[value="' + value + '"]');
            $option.insertBefore($this.find('option[value="other"]'));
            $item.remove();
            $this.selectric('refresh');
          });
          $item.insertBefore($selectric);
        }
      }
    });
    */

    $inputUserSize.bind('change', function (event) {
        var $this = $(this);
        var value = $this.val();

        var options = {};

        if (value === 'lt20') {
            options = {
                'lt1500': '1500만원 미만',
                '2000~2500': '2000~2500만원',
                '2500~3000': '2500~3000만원',
                '3000~3500': '3000~3500만원',
                'gte3500': '3500만원 이상'
            };
        }
        else if (value === 'eq20') {
            options = {
                'lt2000': '2000만원 미만',
                '2500~3000': '2500~3000만원',
                '3000~3500': '3000~3500만원',
                '3500~4000': '3500~4000만원',
                'gte4000': '4000만원 이상'
            };
        }
        else if (value === 'eq30') {
            options = {
                'lt2500': '2500만원 미만',
                '3000~3500': '3000~3500만원',
                '3500~4000': '3500~4000만원',
                '4000~4500': '4000~4500만원',
                'gte4500': '4500만원 이상'
            };
        }
        else if (value === 'eq40') {
            options = {
                'lt3500': '3500만원 미만',
                '4000~4500': '4000~4500만원',
                '4500~5000': '4500~5000만원',
                '5000~5500': '5000~5500만원',
                '5500~6000': '5500~6000만원',
                'gte6000': '6000만원 이상'
            };
        }
        else if (value === 'eq50') {
            options = {
                'lt4500': '4500만원 미만',
                '4500~5000': '4500~5000만원',
                '5000~5500': '5000~5500만원',
                '5500~6000': '5500~6000만원',
                '6000~6500': '6000~6500만원',
                '6500~7000': '6500~7000만원',
                'gte7000': '7000만원 이상'
            };
        }
        else if (value === 'eq60') {
            options = {
                'lt5000': '5000만원 미만',
                '5000~5500': '5000~5500만원',
                '5500~6000': '5500~6000만원',
                '6000~6500': '6000~6500만원',
                '6500~7000': '6500~7000만원',
                'gte7000': '7000만원 이상'
            };
        }
        else if (value === 'gte70') {
            options = {
                'contact': '협의로 결정'
            };
        }
        else {
            options = {
                '': '먼저 평수를 선택해주세요.'
            };
        }

        $inputUserBudget.find('option:not(.default)').remove();

        for (var idx in options) {
            var value = options[idx];
            $inputUserBudget.append('<option value="' + idx + '">' + value + '</option>');
        }

        if ($inputUserBudget.data('selectric').disableOnMobile === true) {
            if ($inputUserBudget.data('selectric').utils.isMobile() !== true) {
                $inputUserBudget.selectric('refresh');
            }
        }
        else {
            $inputUserBudget.selectric('refresh');
        }
    });

    $form.bind('submit', function (event) {
        event.preventDefault();
    });

    $form.find('.complete').bind('click', function (event) {
        event.preventDefault();
        var $formStyleGrid = $('.form-grid.form-style');
        var $formColorGrid = $('.form-grid.form-color');
        var $formPlace = $('.form-choice.form-place');
        var formStyleLikes = [];
        var formStyleDislikes = [];
        var formColorLikes = [];
        var formColorDislikes = [];

        $formStyleGrid.find('.form-col').filter('.liked, .disliked').each(function (index, element) {
            var $element = $(element);
            var value = $element.data('value');

            if ($element.hasClass('liked')) {
                formStyleLikes.push(value);
            }
            else {
                formStyleDislikes.push(value);
            }
        });

        $formColorGrid.find('.form-col').filter('.liked, .disliked').each(function (index, element) {
            var $element = $(element);
            var value = $element.data('value');

            if ($element.hasClass('liked')) {
                formColorLikes.push(value);
            }
            else {
                formColorDislikes.push(value);
            }
        });

        $inputUserStyleLikes.val(formStyleLikes.join(','));
        $inputUserStyleDislikes.val(formStyleDislikes.join(','));
        $inputUserColorLikes.val(formColorLikes.join(','));
        $inputUserColorDislikes.val(formColorDislikes.join(','));

        $inputUserPlace.val($formPlace.find('.form-choice-item.active').eq(0).data('value'));

        var form = $form.serializeJson();

        if (form.user_family === 'other') {
            form.user_family = $inputUserFamilyOther.val();
        }

        if (form.user_time === 'other') {
            form.user_time = $inputUserTimeOther.val();
        }

        form.user_request = '';
        $('.form-select-item.form-select-request.active').each(function (index, element) {
            var $element = $(element);
            var value = $element.data('value');
            if (value !== 'other') {
                form.user_request += (value + '\n');
            }
        });
        form.user_request += $inputUserRequestOther.val();

        validation(form);
    });

    $inputUserAddressBrief.bind('focus', function (event) {
        var $this = $(this);
        $this.blur();
        new daum.Postcode({
            oncomplete: function (data) {
                $this.val(data.jibunAddress || data.address);
                $inputUserAddressDetail.focus();
            }
        }).open();
    });

    $form.find('.form-grid .form-col').find('.btn-like, .btn-dislike').bind('click', function (event) {
        event.preventDefault();
        var $this = $(this);
        var $target = $this.closest('.form-col');
        $target.removeClass('liked').removeClass('disliked');
        if ($this.hasClass('btn-like')) {
            $target.addClass('liked');
        }
        else {
            $target.addClass('disliked');
        }
    });

    var $gridActiveZoom;

    if (browser().mobile === false) {
        $form.find('.form-grid.form-grid-zoom .form-col')
            .hover(
            function () {
                var $this = $(this);
                var $picture = $this.find('.picture');
                var image = $picture.css('background-image').match(/\((.*?)\)/)[1].replace(/('|")/g, '');
                $gridActiveZoom = $('<div class="form-zoom" data-index="' + $this.index() + '"><img src="' + image + '" /></div>');
                $gridActiveZoom.appendTo('body');
            },
            function () {
                var $this = $(this);
                $('.form-zoom[data-index="' + $this.index() + '"]').remove();
            }
            )
            .mousemove(function (event) {
                if (
                    typeof $gridActiveZoom !== 'undefined' && $gridActiveZoom !== null
                ) {
                    var left = event.pageX + 10;
                    var top = event.pageY + 10;
                    var scrollTop = $window.scrollTop();
                    var scrollBottom = scrollTop + $window.outerHeight() - 10;

                    top = Math.min(top, scrollBottom - $gridActiveZoom.outerHeight());

                    $gridActiveZoom.css({
                        left: left,
                        top: top
                    });
                }
            });
    }

    $form.find('.form-choice .form-choice-item').bind('click', function (event) {
        var $this = $(this);
        if ($this.hasClass('active') === false) {
            $this.addClass('active').siblings('.active').removeClass('active');
        }
    });

    if (window.user !== null) {
        $inputUserName.val(window.user.user_name);
        $inputUserPhone.val(window.user.user_phone).triggerHandler('keyup.phoneHandler');
    }
});