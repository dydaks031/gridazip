$(function () {
    var portfolioID = $('#portfolio_id').val() || '';
    var $form = $('.form-portfolio');

    var $inputPortfolioTitle = $('#portfolio_title');
    var $inputPortfolioDesigner = $('#portfolio_designer');
    var $inputPortfolioAddress = $('#portfolio_address');
    var $inputPortfolioStyle = $('#portfolio_style');
    var $inputPortfolioSize = $('#portfolio_size');
    var $inputPortfolioPrice = $('#portfolio_price');
    var $inputPortfolioDescription = $('#portfolio_description');

    var $btnAddImage = $form.find('.btn-add-image');
    var $btnComplete = $form.find('.complete');

    $btnAddImage.bind('click', function(event) {
        event.preventDefault();
        var $this = $(this);
        var index = $this.siblings('.form-item').length;
        var $formItem = $('\
            <div class="form-item">\
                <div class="col-group">\
                    <div class="col-6"><input type="file" name="portfolio_before[' + index + ']" id="portfolio_before" placeholder="Before"></div>\
                    <div class="col-6"><input type="file" name="portfolio_after[' + index + ']" id="portfolio_after" placeholder="After"></div>\
                </div>\
                <a href="#" class="btn-close"></a>\
            </div>\
        ');
        $formItem.insertBefore($this);
        $formItem.find('input:file').bindFile();
        $formItem.find('.btn-close').bind('click', function(event) {
            event.preventDefault();
            $formItem.remove();
        });
    });

    var validation = function(data) {
        if (data.portfolio_title === '') {
            swal({
                title: '제목은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioTitle.focus();
                }, 50);
            });
        }
        else if (data.portfolio_designer === '') {
            swal({
                title: '디자이너는 반드시 선택해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioDesigner.focus();
                }, 50);
            });
        }
        else if(data.portfolio_address === '') {
            swal({
                title: '주소는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioAddress.focus();
                }, 50);
            });
        }
        else if(data.portfolio_style === '') {
            swal({
                title: '스타일은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioStyle.focus();
                }, 50);
            });
        }
        else if(data.portfolio_size === '') {
            swal({
                title: '평수는 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioSize.focus();
                }, 50);
            });
        }
        else if(data.portfolio_price === '') {
            swal({
                title: '비용은 반드시 입력해야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $inputPortfolioPrice.focus();
                }, 50);
            });
        }
        else if(data['portfolio_before_data[0]'] === '') {
            swal({
                title: '적어도 1개의 BEFORE 이미지를 업로드 하셔야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $form.find('[name="portfolio_before_data[0]"]').focus();
                }, 50);
            });
        }
        else if(data['portfolio_after_data[0]'] === '') {
            swal({
                title: '적어도 1개의 AFTER 이미지를 업로드 하셔야 합니다.',
                type: 'warning'
            }, function() {
                setTimeout(function() {
                    $form.find('[name="portfolio_after_data[0]"]').focus();
                }, 50);
            });
        }
        else {
            loading(true);
            http.post('/api/admin/portfolio/save' + (portfolioID? '/' + portfolioID:''), data)
                ['finally'](function() {
                    loading(false);
                })
                .then(function(data) {
                    window.onbeforeunload = null;
                    swal({
                        title: '포트폴리오가 ' + (portfolioID !== ''? '수정':'등록') + '되었습니다.',
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
        validation(form);
    });

    $inputPortfolioAddress.bind('focus', function(event) {
        var $this = $(this);
        $this.blur();
        new daum.Postcode({
            oncomplete: function(data) {
                $this.val(data.jibunAddress || data.address);
            }
        }).open();
    });

    http.post('/api/admin/portfolio/designer')
        .then(function (data) {
            data.data.forEach(function(element, index) {
                $inputPortfolioDesigner.append('<option value="' + element.ds_pk + '">' + element.ds_name + '</option>');
            });
            $inputPortfolioDesigner.triggerHandler('patch');
        });

    if (typeof portfolioID === 'undefined' || portfolioID === '') {

    }
    else {
        var loadPortfolio = function () {
            loading(true);
            http.post('/api/admin/portfolio/' + portfolioID)
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
                    var portfolio = data.data;
                    var images = data.images;
                    var positions = data.positions;
                    var documents = data.documents;
                    var designer_images = data.designer_images;
                    var receipt_employee = data.receipt.employee;
                    var receipt_resource = data.receipt.resource;

                    $inputPortfolioTitle.val(portfolio.pf_title);
                    $inputPortfolioDesigner.val(portfolio.ds_pk).bind('patch', function() {
                        var $this = $(this);
                        $this.val(portfolio.ds_pk);
                    });
                    $inputPortfolioAddress.val(portfolio.pf_address);
                    $inputPortfolioStyle.val(portfolio.pf_style);
                    $inputPortfolioSize.val(portfolio.pf_size);
                    $inputPortfolioPrice.val(portfolio.pf_price);
                    $inputPortfolioDescription.val(portfolio.pf_description);

                    images.forEach(function(element, index) {
                        var $after;
                        var $before;

                        if (index === 0) {
                            $before = $form.find('[name="portfolio_before[0]"]');
                            $after = $form.find('[name="portfolio_after[0]"]');
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
                                        <div class="col-6"><input type="file" name="portfolio_before[' + index + ']" id="portfolio_before" placeholder="Before"></div>\
                                        <div class="col-6"><input type="file" name="portfolio_after[' + index + ']" id="portfolio_after" placeholder="After"></div>\
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
                            $before = $formItem.find('#portfolio_before');
                            $after = $formItem.find('#portfolio_after');
                            $before.siblings().remove();
                            $after.siblings().remove();
                            $before.after('<img src="' + element.pi_before + '">');
                            $after.after('<img src="' + element.pi_after + '">');
                        }
                        var $beforeInput = $('<input type="hidden" name="portfolio_before_data[' + index + ']">');
                        var $afterInput = $('<input type="hidden" name="portfolio_after_data[' + index + ']">');

                        $beforeInput.val(element.pi_before);
                        $afterInput.val(element.pi_after);
                        $beforeInput.insertAfter($before);
                        $afterInput.insertAfter($after);
                    });

                    if (documents !== null && documents.length > 0) {
                        var $pdfViewer = $('<div class="owl-carousel pdf-viewer"></div>');
                        var $target = $form.find('#portfolio_document');
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
                        var $input = $('<input type="hidden" name="portfolio_document_data">');
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