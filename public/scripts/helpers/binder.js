$(function () {
    var $window = $(window);
    var $visual = $('.main-visual .btn');
    var $footer = $('#footer');
    var $floating = $('.btn-floating');
    var floatingTimeout = 500;
    var floatingTimer;

    var resetFloating = function () {
        try {
            clearTimeout(floatingTimer);
        } catch (e) {
            ;
        }

        floatingTimer = setTimeout(function () {
            $floating.addClass('active');
        }, floatingTimeout);
    };

    $window.bind('scroll.floating', function (event) {
        var scrollTop = $window.scrollTop();
        var scrollBottom = scrollTop + $window.outerHeight();

        try {
            clearTimeout(floatingTimer);
        } catch (e) {
            ;
        }

        $floating.removeClass('active');

        if (
            (
                window.location.pathname !== '/' ||
                $visual.offset().top + $visual.outerHeight() < scrollTop
            ) &&
            scrollBottom < $footer.offset().top
        ) {
            resetFloating();
        }
    }).triggerHandler('scroll.floating');

    $('.phone').each(function (i, e) {
        $(e).bind('keydown.phoneHandler keyup.phoneHandler', function (event) {
            var $this = $(this);
            var value = $this.val().replace(/[^\d]/g, '');

            if (value.length >= 11) {
                $this.val(value.replace(/(\d{3})(\d{4})(\d)/, '$1-$2-$3'));
            }
            else if(value.length >= 7) {
                $this.val(value.replace(/(\d{3})(\d{3})(\d)/, '$1-$2-$3'));
            }
            else if (value.length >= 4) {
                $this.val(value.replace(/(\d{3})(\d+)/, '$1-$2'));
            }
        });
    });

    $('.selectric').each(function (i, e) {
        $(e).selectric({
            disableOnMobile: true
        });
    });

    $('.calendar').each(function (i, e) {
        var $this = $(this);
        console.log($this.data('min'));
        $(e).pignoseCalendar({
            lang: 'ko',
            date: ($this.data('today')? moment($this.data('today')):undefined),
            minDate: $this.data('min'),
            maxDate: $this.data('max')
        });
    });

    $('#header .btn-menu').bind('click', function(event) {
        event.preventDefault();
        var $this = $(this);
        var $target = $('#header .menu');
        if ($target.hasClass('active')) {
            $target.removeClass('active').hide();
        }
        else {
            $target.addClass('active').show();
        }
    });

    $('.magnific').each(function() {
        var $this = $(this);

        $this.bind('click', function(event) {
            event.stopPropagation();
        });
        
        $this.magnificPopup({
            items: {
                src: $this.attr('src')
            },
            type: 'image',
            mainClass: 'mfp-with-zoom',
            zoom: {
                enabled: true,
                duration: 300,
                easing: 'ease-in-out',
                opener: function (opener) {
                    return $this;
                }
            }
        });
    });

    $.fn.bindFile = function() {
        this.each(function() {
            var $this = $(this);
            var $btn = $('<span class="btn btn-yellow btn-sm btn-block">' + $this.attr('placeholder') + '</span>');
            $this.wrap('<span class="btn-file"></span>');
            $this.fileupload({
                paramName: 'filedata',
                dataType: 'json',
                singleFileUploads: true,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                maxFileSize: 1024 * 1024 * 50,
                limitMultiFileUploadSize: 1024 * 1024 * 50,
                limitConcurrentUploads: 5,
                url: '/api/file/upload',
                change: function() {
                    var $this = $(this);
                    $this.siblings().hide();
                    $this.after('<span class="loading"></span>');
                },
                done: function (e, data) {
                    var $this = $(this);
                    $this.siblings('.loading').remove();
                    $this.siblings().show();
                    if (data.result.code === 200) {
                        var result = data.result.data;
                        var mimetype = result.mimetype;
                        var type = $this.data('type') || 'image';
                        var mimeTypesSplited = mimetype.split('/');

                        if (type === 'image') {
                            if (mimeTypesSplited[0] !== 'image') {
                                swal({
                                    title: '이미지 타입만 업로드 하실 수 있습니다.',
                                    type: 'warning'
                                });
                                return;
                            }
                        }
                        else if (type === 'pdf') {
                            if (mimetype !== 'application/pdf') {
                                swal({
                                    title: 'PDF 타입만 업로드 하실 수 있습니다.',
                                    type: 'warning'
                                });
                                return;
                            }
                        }

                        $this.closest('.btn-file').addClass('uploaded').addClass('btn-file-' + type);
                        
                        var $input = $('<input type="hidden">');
                        var name = $this.attr('name') || '';
                        var nameMatch = name.match(/\[\d*\]$/);

                        name = name.replace(/\[\d*\]$/g, '') + '_data';
                        
                        if (nameMatch !== null && nameMatch.length > 0) {
                            name += nameMatch[0];
                        }

                        $input.attr('name', name);

                        if (mimeTypesSplited[0] === 'image') {
                            $this.siblings().remove();
                            var $image = $('<img src="' + result.value + '">');
                            $image.insertAfter($this);
                            $input.val(result.value);
                        }
                        else if (mimetype === 'application/pdf') {
                            $this.siblings().hide();
                            var $btnClose = $('<a href="#" class="btn-close"></a>');
                            var $pdfViewer = $('<div class="owl-carousel pdf-viewer"></div>');
                            result.values.forEach(function(element, index) {
                                $pdfViewer.append('<div class="item pdf-viewer-image"><img src="' + element + '"></div>');
                            });
                            $btnClose.bind('click', function(event) {
                                event.preventDefault();
                                var $this = $(this);
                                $this.closest('.btn-file').removeClass('uploaded').removeClass('btn-file-' + type);
                                $this.siblings().show();
                                $this.remove();
                                $pdfViewer.remove();
                            });
                            $btnClose.insertAfter($this);
                            $pdfViewer.insertAfter($this);
                            $pdfViewer.owlCarousel({
                                loop: true,
                                items: 1,
                                nav: true,
                                dots: false,
                                navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
                            });
                            $input.val(result.values.join(','));
                        }

                        $input.insertAfter($this);
                    }
                    else {
                        console.log(data.result, (typeof data.result.data.msg === 'object'? data.result.data.msg.error:data.result.data.msg));
                        swal({
                            title: (typeof data.result.data.msg === 'object'? data.result.data.msg.error:data.result.data.msg),
                            type: 'warning'
                        });
                    }
                }
            });
            $btn.insertAfter($this);
        });
    };

    $('.btn-fold').bind('click', function(event) {
        event.preventDefault();
        var $this = $(this);
        if ($this.hasClass('active')) {
            $this.removeClass('active');
            $this.next().removeClass('active');
            $this.find('span').text('추가 정보 입력');
        }
        else {
            $this.addClass('active');
            $this.next().addClass('active');
            $this.find('span').text('닫기');
        }
    });

    $('input:file').each(function() {
        var $this = $(this);
        $this.bindFile();
    });
});