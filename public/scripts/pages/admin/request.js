$(function () {
    var requestID = $('#request_id').val() || '';

    var $inputRequestId = $('#request_id');
    var $form = $('.form-request');
    var $inputRequestIsValuable = $('#rq_valuable input[name=request_is_valuable]');
    var $inputRequestIsContracted = $('#rq_contracted input[name=request_is_contracted]');
    var $inputRequestRegDt = $('#request_reg_dt');
    var $inputRequestName = $('#request_name');
    var $inputRequestPhone = $('#request_phone');
    var $inputRequestFamily = $('#request_family');
    var $inputRequestSizeStr = $('#request_size');
    var $inputRequestBudgetStr = $('#request_budget');
    var $inputRequestAddressBrief = $('#request_address_brief');
    var $inputRequestAddressDetail = $('#request_address_detail');
    var $inputRequestMoveDate = $('#request_move_date');
    var $inputRequestDate = $('#request_date');
    var $inputRequestTime = $('#request_time');
    var $choiceRequestPlace = $('#request_place_choice');
    var $inputRequestRequest = $('#request_request');
    var $inputRequestStyle = $('#request_style');
    var $inputRequestColor = $('#request_color');
    var $textareaRequestMemo = $('#request_memo');

    var $inputRequestStyleLikes = $('#request_style_likes')
    var $inputRequestStyleDislikes = $('#request_style_dislikes')
    var $inputRequestColorLikes = $('#request_color_likes')
    var $inputRequestColorDislikes = $('#request_color_dislikes')
    var $inputRequestPlace = $('#request_place')
    var $inputRequestFamilyOther = $('#request_family_other');
    var $inputRequestTimeOther = $('#request_time_other');
    var $inputRequestRequestOther = $('#request_request_other');

    var $btnComplete = $('button.complete');

    var formStyleLikes = [];
    var formStyleDislikes = [];


    var styleTemplate = [
        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-01.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-02.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-03.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-04.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-05.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-06.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-07.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-08.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-09.jpeg\');" />\
        </div>',
    ]

    var colorTemplate = [
        '<div class="form-col">\
            <div class="picture" style="background-color: #f9f2f1;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #0A0200;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #92C4E0;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #D4C1D3;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #F0E842;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #BDC3C7;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #16A085;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #B37618;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #2DE3C3;">\
            </div>\
        </div>',
    ];

    $inputRequestIsValuable.click(function() {
        var $this = $(this);
        var isValuable = $this.val();

        updateIsValueable(requestID, isValuable);
    });


    function updateIsValueable(index, isValuable) {
        var updatePromise = http.post('/api/admin/request/save/' + index, {
            request_is_valuable: isValuable,
        }).then(function(data) {
            console.log(data);
        })
    }

    $btnComplete.bind('click', function(event) {
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

        $inputRequestStyleLikes.val(formStyleLikes.join(','));
        $inputRequestStyleDislikes.val(formStyleDislikes.join(','));
        $inputRequestColorLikes.val(formColorLikes.join(','));
        $inputRequestColorDislikes.val(formColorDislikes.join(','));

        $inputRequestPlace.val($formPlace.find('.form-choice-item.active').eq(0).data('value'));

        var form = $form.serializeJson();

        if($inputRequestIsValuable.filter(':checked').length === 0) {
            form.request_is_valuable = 0;
        }

        if($inputRequestIsContracted.filter(':checked').length === 0) {
            form.request_is_contracted = 0;
        }

        form.request_phone = form.request_phone.replace(/\-/gi, '');

        if (form.user_family === 'other') {
            // form.user_family = $inputUserFamilyOther.val();
            form.user_family = '기타';
        }

        if (form.user_time === 'other') {
            form.user_time = '기타'
        }

        form.request_request = '';
        $('.form-select-item.form-select-request.active').each(function (index, element) {
            var $element = $(element);
            var value = $element.data('value');
            if (value !== 'other') {
                form.request_request += (value + '\n');
            }
        });
        // debugger;
        // form.user_request += $inputUserRequestOther.val();

        validation(form);


    });

    var validation = function(data) {
        if (data.request_name === '') {
            swal({
                title: '이름은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputRequestName.focus();
                }, 50);
            });
        } else if (data.request_phone === '') {
            swal({
                title: '전화번호는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputRequestPhone.focus();
                }, 50);
            });
        } else {
            http.post('/api/admin/request/save' + (requestID ? '/' + requestID: '/'), data)
                ['finally'](function() {
                loading(false);
            })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '상담정보가 수정되었습니다.',
                        text: '아래 버튼을 클릭해서 리스트로로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '상담정보 리스트 페이지로 이동'
                    }, function() {
                        location.href = '/admin/request/list';
                    });
                })
                ['catch'](function(error) {
                swal({
                    title: error.value,
                    type: 'warning'
                });
            });
        }
    };

    var loadRequest = function () {
        loading(true);
        http.post('/api/admin/request/' + requestID)
            ['finally'](function () {
            loading(false);
        })
            .then(function (data) {
                if (data.data === null) {
                    swal({
                        title: '디자이너가 존재하지 않습니다.',
                        text: '디자이너가 도중에 삭제된 것 같습니다.',
                        type: 'error',
                        confirmButtonText: '뒤로가기'
                    }, function () {
                        location.href = '/admin';
                    });
                }
                else {
                    var request = data.data;

                    $inputRequestIsValuable.filter('[value=' + request.rq_is_valuable + ']').prop("checked", true);
                    $inputRequestIsContracted.filter('[value=' + request.rq_is_contracted + ']').prop("checked", true);

                    $inputRequestId.text(request.rq_id || '없음');
                    $inputRequestRegDt.text(request.rq_reg_dt === '0000-00-00' ? '없음' : moment(request.rq_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestName.val(request.rq_name || '없음');
                    $inputRequestPhone.val(request.rq_phone || '없음');

                    $inputRequestFamily.children().filter('option[value=\"' + request.rq_family + '\"]').prop('selected', true);
                    $inputRequestFamily.selectric('refresh');

                    $inputRequestSizeStr.children().filter('option[value=\"' + request.rq_size + '\"]').prop('selected', true);
                    $inputRequestSizeStr.selectric('refresh');

                    $inputRequestBudgetStr.children().filter('option[value=\"' + request.rq_budget + '\"]').prop('selected', true);
                    $inputRequestBudgetStr.selectric('refresh');

                    $inputRequestAddressBrief.val(request.rq_address_brief);
                    $inputRequestAddressDetail.val(request.rq_address_detail);
                    $inputRequestMoveDate.val(request.rq_move_date  === '0000-00-00 00:00:00' ? '' : moment(request.rq_move_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestDate.val(request.rq_date  === '0000-00-00' ? '' : moment(request.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));

                    $inputRequestTime.children().filter('option[value=\"' + request.rq_time + '\"]').prop('selected', true);
                    $inputRequestTime.selectric('refresh');

                    $choiceRequestPlace.children().filter('[data-value=\"' + request.rq_place + '\"]').addClass('active');

                    $textareaRequestMemo.val(request.rq_memo);

                    $form.find('.form-choice .form-choice-item').bind('click', function (event) {
                        var $this = $(this);
                        if ($this.hasClass('active') === false) {
                            $this.addClass('active').siblings('.active').removeClass('active');
                        }
                    });

                    var styleLikesList = request.rq_style_likes === "" ? [] : request.rq_style_likes.split(',');
                    var styleDislikesList = request.rq_style_dislikes === "" ? [] : request.rq_style_dislikes.split(',');
                    var colorLikesList = request.rq_color_likes === "" ? [] : request.rq_color_likes.split(',');
                    var colorDislikesList = request.rq_color_dislikes === "" ? [] : request.rq_color_dislikes.split(',');

                    var requestStyleChildren = $inputRequestStyle.children();
                    var requestColorChildren = $inputRequestColor.children();

                    for ( var i = 0; i < styleLikesList.length; i ++ ) {
                        requestStyleChildren.filter('[data-value=\"' + styleLikesList[i] + '\"]').addClass('liked');
                    }

                    for ( var i = 0; i < styleDislikesList.length; i ++ ) {
                        requestStyleChildren.filter('[data-value=\"' + styleDislikesList[i] + '\"]').addClass('disliked');
                    }

                    for ( var i = 0; i < colorLikesList.length; i ++ ) {
                        requestColorChildren.filter('[data-value=\"' + colorLikesList[i] + '\"]').addClass('liked');
                    }

                    for ( var i = 0; i < colorDislikesList.length; i ++ ) {
                        requestColorChildren.filter('[data-value=\"' + colorDislikesList[i] + '\"]').addClass('disliked');
                    }

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

                    var $selectItemGroup = $('<div class="form-select-group"></div>');
                    var requestList = request.rq_request.split('\n');

                    $inputRequestRequest.hide().find('option').each(function (index, element) {
                        var $this = $(element);
                        var $selectItem = $('\
                          <a href="#" class="form-select-item form-select-request" data-value="' + $this.val() + '">\
                            <i class="fa fa-square"></i>\
                            <span>' + $this.text() + '</span>\
                          </a>\
                        ');

                        if (requestList.indexOf($this.val()) > -1) {
                            $selectItem.addClass('active');
                            $selectItem.find('i').removeClass('fa-sqaure').addClass('fa-check-square');
                        }

                        $selectItem.bind('click', function (event) {
                            event.preventDefault();
                            var $this = $(this);
                            var value = $this.data('value');

                            $inputRequestRequest.val(value);

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
                    $selectItemGroup.insertAfter($inputRequestRequest);
                }
            })
            ['catch'](function (error) {
                console.log(error);
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    loadRequest();
});