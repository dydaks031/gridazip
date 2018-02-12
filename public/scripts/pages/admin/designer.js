$(function () {
    var designerID = $('#designer_id').val() || '';
    var $form = $('.form-designer');

    var $inputDesignerName = $('#designer_name');
    var $inputDesignerStyle = $('#designer_style');
    var $inputDesignerPriceMin = $('#designer_price_min');
    var $inputDesignerPriceMax = $('#designer_price_max');
    var $inputDesignerIntroduce = $('#designer_introduce');
    var $inputDesignerScoreCommunication = $('#designer_score_communication');
    var $inputDesignerScoreQuality = $('#designer_score_quality');
    var $inputDesignerScoreTimestrict = $('#designer_score_timestrict');


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

    console.log($skillForm);

    var validation = function(data) {
        if (data.designer_name === '') {
            swal({
                title: '이름은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputDesignerName.focus();
                }, 50);
            });
        }
        else if (data.designer_style === '') {
            swal({
                title: '스타일은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputDesignerStyle.focus();
                }, 50);
            });
        }
        else if(data.designer_price_min === '') {
            swal({
                title: '최소금액은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputDesignerPriceMin.focus();
                }, 50);
            });
        }
        else if(data.designer_price_max === '') {
            swal({
                title: '최대금액은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputDesignerPriceMax.focus();
                }, 50);
            });
        }
        else if(data.designer_score_communication === 0) {
            swal({
                title: '커뮤니케이션 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data.designer_score_quality === 0) {
            swal({
                title: '퀄리티 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data.designer_score_timestrict === 0) {
            swal({
                title: '시간엄수 점수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    // $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data['designer_image_data[0]'] === '') {
            swal({
                title: '디자이너 사진은 반드시 업로드해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $form.find('[name="designer_image"]').focus();
                }, 50);
            });
        }
        else {
            loading(true);
            http.post('/api/admin/designer/save' + (designerID? '/' + designerID:''), data)
                ['finally'](function() {
                loading(false);
            })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '디자이너가 ' + (designerID !== ''? '수정':'등록') + '되었습니다.',
                        text: '아래 버튼을 클릭해서 리스트로로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '디자이너 리스트 페이지로 이동'
                    }, function() {
                        location.href = '/admin/designer/list';
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
        form.designer_score_communication = $form.find('.designer-score-communication > i.active').length;
        form.designer_score_quality = $form.find('.designer-score-quality > i.active').length;
        form.designer_score_timestrict = $form.find('.designer-score-timestrict > i.active').length;
        // form.
        console.log(form);
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

    if (typeof designerID === 'undefined' || designerID === '') {

    }
    else {
        var loadDesigner = function () {
            loading(true);
            http.post('/api/admin/profile/designer/' + designerID)
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
                        var designer = data.data;
                        var designerImages = designer.ds_image;

                        $inputDesignerName.val(designer.ds_name);
                        $inputDesignerStyle.val(designer.ds_style);
                        $inputDesignerPriceMin.val(designer.ds_price_min);
                        $inputDesignerPriceMax.val(designer.ds_price_max);
                        $inputDesignerIntroduce.val(designer.ds_introduce);

                        for ( var i = 0; i < designer.ds_score_communication; i ++ ) {
                            $inputDesignerScoreCommunication.children().eq(i).addClass('active');
                        }

                        for ( var i = 0; i < designer.ds_score_quality; i ++ ) {
                            $inputDesignerScoreQuality.children().eq(i).addClass('active');
                        }

                        for ( var i = 0; i < designer.ds_score_timestrict; i ++ ) {
                            $inputDesignerScoreTimestrict.children().eq(i).addClass('active');
                        }
                    }


                        var $image;

                            $image = $form.find('[name="designer_image[0]"]');
                            $image.siblings().remove();
                            $image.after('<img src="' + designerImages + '">');
                })
                ['catch'](function (error) {
                console.log(error);
                swal({
                    title: error.value,
                    type: 'error'
                });
            });
        };

        loadDesigner();
    }
});