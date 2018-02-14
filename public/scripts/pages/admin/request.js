$(function () {
    var requestID = $('#request_id').val() || '';
    var $form = $('.form-request');

    var $inputRequestName = $('#request_name');
    var $inputRequestStyle = $('#request_style');
    var $inputRequestPriceMin = $('#request_price_min');
    var $inputRequestPriceMax = $('#request_price_max');
    var $inputRequestIntroduce = $('#request_introduce');
    var $inputRequestScoreCommunication = $('#request_score_communication');
    var $inputRequestScoreQuality = $('#request_score_quality');
    var $inputRequestScoreTimestrict = $('#request_score_timestrict');
    var $inputRequestImage = $('#request_image');
    var $inputRequestIsDev = $('input[name=request_is_dev]');


    var $btnAddImage = $form.find('.btn-add-image');
    var $btnComplete = $form.find('.complete');

    var $skillForm = $form.find('.skill-form-group');


    $skillForm.find('.fa-star').on('mouseover', function() {
        var $this = $(this);
        var index = $this.index();
        var $parents = $this.parent();

        for ( var i = 5; i >= index; i -- ) {
            $parents.children().eq(i).removeClass('active');
        }

        for ( var i = 0; i <= index; i ++ ) {
            $parents.children().eq(i).addClass('active');
        }
    })

    $skillForm.find('.fa-star').on('mouseout', function(e) {

        var $this = $(this);
        var index = $this.index();
        var $parents = $this.parent();
        var starCount = $parents.children().length
        if ( index === 0 ) {
            $parents.children().eq(index).removeClass('active');
        } else if ( index === starCount - 1 ) {
            $parents.children().eq(index).addClass('active');
        }
    });

    $skillForm.find('.fa-star').on('click', function(e) {


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
        }
        else if (data.request_style === '') {
            swal({
                title: '스타일은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputRequestStyle.focus();
                }, 50);
            });
        }
        else if(data.request_price_min === '') {
            swal({
                title: '최소금액은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputRequestPriceMin.focus();
                }, 50);
            });
        }
        else if(data.request_price_max === '') {
            swal({
                title: '최대금액은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputRequestPriceMax.focus();
                }, 50);
            });
        }
        else if(data.request_score_communication === 0) {
            swal({
                title: '커뮤니케이션 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data.request_score_quality === 0) {
            swal({
                title: '퀄리티 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data.request_score_timestrict === 0) {
            swal({
                title: '시간엄수 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data['request_image_data'] === '') {
            swal({
                title: '디자이너 사진은 반드시 업로드해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $form.find('[name="request_image"]').focus();
                }, 50);
            });
        }
        else {
            loading(true);
            http.post('/api/admin/profile/request/save' + (requestID? '/' + requestID: '/'), data)
                ['finally'](function() {
                loading(false);
            })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '디자이너가 ' + (requestID !== ''? '수정':'등록') + '되었습니다.',
                        text: '아래 버튼을 클릭해서 리스트로로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '디자이너 리스트 페이지로 이동'
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

    $btnComplete.bind('click', function(event) {
        event.preventDefault();
        var form = $form.serializeJson();
        form.request_score_communication = $form.find('.request-score-communication > i.active').length;
        form.request_score_quality = $form.find('.request-score-quality > i.active').length;
        form.request_score_timestrict = $form.find('.request-score-timestrict > i.active').length;
        // form.

        validation(form);
    });

    // $inputPortfolioAddress.bind('focus', function(event) {
    //     var $this = $(this);
    //     $this.blur();
    //     new daum.Postcode({
    //         oncomplete: function(data) {
    //             $this.val(data.jibunAddress || data.address);
    //         }
    //     }).open();
    // });

    if (typeof requestID === 'undefined' || requestID === '') {

    }
    else {
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
                        var requestImages = request.ds_image;

                        $inputRequestName.val(request.ds_name);
                        $inputRequestStyle.val(request.ds_style);
                        $inputRequestPriceMin.val(request.ds_price_min);
                        $inputRequestPriceMax.val(request.ds_price_max);
                        $inputRequestIntroduce.val(request.ds_introduce);

                        for (var i = 0; i < request.ds_score_communication; i++) {
                            $inputRequestScoreCommunication.children().eq(i).addClass('active');
                        }

                        for (var i = 0; i < request.ds_score_quality; i++) {
                            $inputRequestScoreQuality.children().eq(i).addClass('active');
                        }

                        for (var i = 0; i < request.ds_score_timestrict; i++) {
                            $inputRequestScoreTimestrict.children().eq(i).addClass('active');
                        }

                        var $image;

                        $image = $form.find('[name="request_image"]');
                        $image.siblings().remove();
                        $image.after('<img src="' + requestImages + '">');
                        $image.after('<input type="hidden" value="' + requestImages + '" name="request_image_data" >');

                        $inputRequestIsDev.filter('[value=' + request.ds_is_dev + ']').prop('checked', true);

                    }
                })
                ['catch'](function (error) {

                swal({
                    title: error.value,
                    type: 'error'
                });
            });
        };

        loadRequest();
    }
});