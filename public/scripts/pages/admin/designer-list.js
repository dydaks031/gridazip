$(function () {
    var $designerSortTab = $('#designer_sort_tab');
    var $designerStyle = $('#designer_style');
    var $designerSize = $('#designer_size');
    var $designerPrice = $('#designer_price');

    var page = new Pagination();
    var filter = new Filter({
        sort: null,
        style: null,
        size: null,
        price: null
    });

    var $designer = $('.table-designer');
    page.setLimit(20);

    var loadPromise;
    var loadDesigner = function () {
        $designer.find('tbody').empty().append('<tr><td colspan="7" class="loading"></td></tr>');

        try {
            if (typeof loadPromise !== 'undefined') {
                loadPromise.cancel();
            }
        }
        catch (e) {
            ;
        }

        loadPromise = http.post('/api/profile/designer', {
            page: page.get(),
            filter: filter.get()
        });

        loadPromise
            ['finally'](function () {
            $designer.find('.loading').closest('tr').remove();
        })
            .then(function (data) {
                page.set(data.page);
                if (data.data.length > 0) {
                    data.data.forEach(function (element, idx) {
                        var $row = $('\
                        <tr data-idx="' + element.ds_pk + '">\
                            <td class="center">' + element.ds_pk + '</td>\
                            <td class="center"><a href="' + element.ds_image + '" class="block no-font magnific"><img src="' + element.ds_image + '" ' + element.ds_image + '/></a></td>\
                            <td class="left">' + element.ds_name + '</td>\
                            <td class="center">' + element.ds_price_min.format() + ' 만원</td>\
                            <td class="center">' + element.ds_price_max.format() + ' 만원</td>\
                            <td class="center">' + element.ds_style + '</td>\
                            <td class="center"><a href="#" class="btn btn-yellow btn-sm btn-delete">삭제</a></td>\
                        </tr>\
                    ');

                        $row.bind('click', function(event) {
                            event.preventDefault();
                            var $this = $(this);
                            var index = $this.data('idx');
                            location.href = '/admin/designer/' + index;
                        });

                        $row.find('.magnific').bind('click', function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }).magnificPopup({
                            items: {
                                src: element.ds_image
                            },
                            type: 'image',
                            mainClass: 'mfp-with-zoom',
                            zoom: {
                                enabled: true,
                                duration: 300,
                                easing: 'ease-in-out',
                                opener: function (opener) {
                                    return $row.find('.magnific img');
                                }
                            }
                        });

                        $row.find('.btn-delete').bind('click', function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (confirm('정말로 삭제하시겠습니까?')) {
                                http.post('/api/admin/designer/delete/' + element.ds_pk)
                                    .then(function(data) {
                                        page.reset();
                                        page.setLimit(20);
                                        loadDesigner();
                                    })
                                    ['catch'](function(error) {
                                    swal({
                                        title: error.value,
                                        type: 'warning'
                                    });
                                });
                            }
                        });

                        $row.appendTo($designer.find('tbody'));
                    });
                }
                else {
                    var $emptySection = $('\
                    <tr>\
                        <td colspan="7" class="empty-section">\
                            <i class="pe-7s-attention"></i>\
                            <span>조회된 항목이 없습니다.</span>\
                        </td>\
                    </tr>\
                ');
                    $emptySection.appendTo($designer);
                }

                var $pagination = $('.pagination');
                $pagination.html(page.getHtml());
                $pagination.find('a').bind('click', function (event) {
                    event.preventDefault();
                    var $this = $(this);
                    var index = $this.data('index');
                    page.setIndex(index);
                    loadDesigner();
                });

            })
            ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };
    loadDesigner();
});