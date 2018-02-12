$(function () {
    var constructorID = $('#constructor_id').val() || '';
    var $form = $('.form-constructor');

    var $inputConstructorName = $('#constructor_name');
    var $inputConstructorCompany = $('#constructor_cppk');
    var $inputConstructorScore = $('#constructor_score_communication');
    var $inputConstructorIsDev = $('input[name=constructor_is_dev]')


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
        if (data.constructor_name === '') {
            swal({
                title: '이름은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputConstructorName.focus();
                }, 50);
            });
        }
        else if (data.constructor_cppk === '') {
            swal({
                title: '회사는 반드시 선택해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputConstructorCompany.focus();
                }, 50);
            });
        }
        else if(data.constructor_score === 0) {
            swal({
                title: '시공자 평가는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputConstructorScore.focus();
                }, 50);
            });
        }
        else if(!data['constructor_image_data'] || data['constructor_image_data'] === '') {
            swal({
                title: '시공자 사진은 반드시 업로드해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $form.find('[name="constructor_image"]').focus();
                }, 50);
            });
        }
        else {
            loading(true);
            http.post('/api/admin/profile/constructor/save' + (constructorID? '/' + constructorID:''), data)
                ['finally'](function() {
                loading(false);
            })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '시공자가 ' + (constructorID !== ''? '수정':'등록') + '되었습니다.',
                        text: '아래 버튼을 클릭해서 리스트로로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '시공자 리스트 페이지로 이동'
                    }, function() {
                        location.href = '/admin/constructor/list';
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
        form.constructor_score = $form.find('.constructor-score > i.active').length;
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

    if (typeof constructorID === 'undefined' || constructorID === '') {

    }
    else {
        var loadConstructor = function () {
            loading(true);
            http.post('/api/admin/profile/constructor/' + constructorID)
                ['finally'](function () {
                loading(false);
            })
                .then(function (data) {
                    if (data.data === null) {
                        swal({
                            title: '시공자가 존재하지 않습니다.',
                            text: '시공자가 도중에 삭제된 것 같습니다.',
                            type: 'error',
                            confirmButtonText: '뒤로가기'
                        }, function () {
                            location.href = '/admin/constructor/list';
                        });
                    }
                    else {
                        var constructor = data.data;
                        var constructorImages = constructor.cr_image;

                        $inputConstructorName.val(constructor.cr_name);
                        $inputConstructorCompany.children('option[value=' + constructor.cr_cppk + ']').prop('selected', true);

                        for ( var i = 0; i < constructor.cr_score; i ++ ) {
                            $inputConstructorScore.children().eq(i).addClass('active');
                        }


                        var $image;

                        $image = $form.find('[name="constructor_image"]');
                        $image.siblings().remove();
                        $image.after('<img src="' + constructorImages + '">');
                        $image.after('<input type="hidden" value="' + constructorImages + '" name="constructor_image_data" >');

                        $inputConstructorIsDev.filter('[value=' + constructor.cr_is_dev + ']').prop('checked', true);
                    }
                })
                ['catch'](function (error) {

                swal({
                    title: error.value,
                    type: 'error'
                });
            });
        };

        loadConstructor();
    }
});