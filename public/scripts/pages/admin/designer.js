$(function () {
    var designerID = $('#designer_id').val() || '';
    var $form = $('.form-designer');

    var $inputDesignerName = $('#designer_name');
    var $inputDesignerStyle = $('#designer_style');
    var $inputDesignerPriceMin = $('#designer_price_min');
    var $inputDesignerPriceMax = $('#designer_price_max');


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
        else if(data['designer_image[0]'] === '') {
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
            return;
            loading(true);
            http.post('/api/admin/designer/save' + (designerID? '/' + designerID:''), data)
                ['finally'](function() {
                loading(false);
            })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '포트폴리오가 ' + (designerID !== ''? '수정':'등록') + '되었습니다.',
                        text: '아래 버튼을 클릭해서 리스트로로 이동하세요.',
                        type: 'success',
                        confirmButtonText: '포트폴리오 리스트 페이지로 이동'
                    }, function() {
                        location.href = '/admin';
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
        console.log(form.serializeArray());
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
        var loadPortfolio = function () {
            loading(true);
            http.post('/api/admin/designer/' + designerID)
                ['finally'](function () {
                loading(false);
            })
                .then(function (data) {
                    if (data.data === null) {
                        swal({
                            title: '포트폴리오가 존재하지 않습니다.',
                            text: '포트폴리오가 도중에 삭제된 것 같습니다.',
                            type: 'error',
                            confirmButtonText: '뒤로가기'
                        }, function () {
                            location.href = '/admin';
                        });
                    }
                    else {
                        var designer = data.data;
                        var images = data.images;
                        var positions = data.positions;
                        var documents = data.documents;
                        var designer_images = data.designer_images;
                        var receipt_employee = data.receipt.employee;
                        var receipt_resource = data.receipt.resource;

                        $inputPortfolioTitle.val(designer.pf_title);
                        $inputPortfolioDesigner.val(designer.ds_pk).bind('patch', function() {
                            var $this = $(this);
                            $this.val(designer.ds_pk);
                        });
                        $inputPortfolioAddress.val(designer.pf_address);
                        $inputPortfolioStyle.val(designer.pf_style);
                        $inputPortfolioSize.val(designer.pf_size);
                        $inputPortfolioPrice.val(designer.pf_price);
                        $inputPortfolioDescription.val(designer.pf_description);

                        images.forEach(function(element, index) {
                            var $after;
                            var $before;

                            if (index === 0) {
                                $before = $form.find('[name="designer_before[0]"]');
                                $after = $form.find('[name="designer_after[0]"]');
                                $before.siblings().remove();
                                $after.siblings().remove();
                                $before.after('<img src="' + element.pi_before + '">');
                                $after.after('<img src="' + element.pi_after + '">');
                            }
                            else {
                                var index = $btnAddImage.siblings('.form-item').length;
                                var $formItem = $('\
                                <div class="form-item">\
                                    <div class="col-group">\
                                        <div class="col-6"><input type="file" name="designer_before[' + index + ']" id="designer_before" placeholder="Before"></div>\
                                        <div class="col-6"><input type="file" name="designer_after[' + index + ']" id="designer_after" placeholder="After"></div>\
                                    </div>\
                                    <a href="#" class="btn-close"></a>\
                                </div>\
                            ');
                                $formItem.insertBefore($btnAddImage);
                                $formItem.find('input:file').bindFile();
                                $formItem.find('.btn-close').bind('click', function(event) {
                                    event.preventDefault();
                                    $formItem.remove();
                                });
                                $before = $formItem.find('#designer_before');
                                $after = $formItem.find('#designer_after');
                                $before.siblings().remove();
                                $after.siblings().remove();
                                $before.after('<img src="' + element.pi_before + '">');
                                $after.after('<img src="' + element.pi_after + '">');
                            }
                            var $beforeInput = $('<input type="hidden" name="designer_before_data[' + index + ']">');
                            var $afterInput = $('<input type="hidden" name="designer_after_data[' + index + ']">');

                            $beforeInput.val(element.pi_before);
                            $afterInput.val(element.pi_after);
                            $beforeInput.insertAfter($before);
                            $afterInput.insertAfter($after);
                        });

                        if (documents !== null && documents.length > 0) {
                            var $pdfViewer = $('<div class="owl-carousel pdf-viewer"></div>');
                            var $target = $form.find('#designer_document');
                            $target.siblings().remove();
                            documents.forEach(function(element, index) {
                                $pdfViewer.append('<div class="item pdf-viewer-image"><img src="' + element + '"></div>');
                            });
                            $pdfViewer.insertAfter($target);
                            $pdfViewer.owlCarousel({
                                loop: true,
                                items: 1,
                                nav: true,
                                dots: false,
                                navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
                            });
                            $target.closest('.btn-file').addClass('uploaded btn-file-pdf');
                            var $input = $('<input type="hidden" name="designer_document_data">');
                            $input.val(documents.join(','));
                            $input.insertAfter($target);
                        }



                        console.log(images);
                        //console.log(positions);
                        console.log(documents);
                        //console.log(designer_images);
                        //console.log(receipt_employee);
                        //console.log(receipt_resource);
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

        loadPortfolio();
    }
});