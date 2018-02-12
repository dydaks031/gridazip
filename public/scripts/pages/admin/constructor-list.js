$(function () {
    var $constructorSortTab = $('#constructor_sort_tab');
    var $constructorStyle = $('#constructor_style');
    var $constructorSize = $('#constructor_size');
    var $constructorPrice = $('#constructor_price');

    var page = new Pagination();
    var filter = new Filter({
        sort: null,
        style: null,
        size: null,
        price: null
    });

    var $constructor = $('.table-constructor');
    page.setLimit(20);

    var loadPromise;
    var loadConstructor = function () {
        $constructor.find('tbody').empty().append('<tr><td colspan="7" class="loading"></td></tr>');

        try {
            if (typeof loadPromise !== 'undefined') {
                loadPromise.cancel();
            }
        }
        catch (e) {
            ;
        }

        loadPromise = http.post('/api/admin/profile/constructor', {
            page: page.get(),
            filter: filter.get()
        });

        loadPromise
            ['finally'](function () {
            $constructor.find('.loading').closest('tr').remove();
        })
            .then(function (data) {
                page.set(data.page);
                debugger;
                if (data.data.length > 0) {
                    data.data.forEach(function (element, idx) {
                        var $row = $('\
                        <tr data-idx="' + element.cr_pk + '">\
                            <td class="center">' + element.cr_pk + '</td>\
                            <td class="center"><a href="' + element.cr_image + '" class="block no-font magnific"><img src="' + element.cr_image + '" ' + element.cr_image + '/></a></td>\
                            <td class="left">' + element.cr_name + '</td>\
                            <td class="left">' + element.cr_address + '</td>\
                            <td class="center">' + element.cr_score + '</td>\
                            <td class="center"><a href="#" class="btn btn-yellow btn-sm btn-delete">삭제</a></td>\
                        </tr>\
                    ');

                        $row.bind('click', function(event) {
                            event.preventDefault();
                            var $this = $(this);
                            var index = $this.data('idx');
                            location.href = '/admin/constructor/' + index;
                        });

                        $row.find('.magnific').bind('click', function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }).magnificPopup({
                            items: {
                                src: element.cr_image
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
                                http.post('/api/admin/constructor/delete/' + element.cr_pk)
                                    .then(function(data) {
                                        page.reset();
                                        page.setLimit(20);
                                        loadConstructor();
                                    })
                                    ['catch'](function(error) {
                                    swal({
                                        title: error.value,
                                        type: 'warning'
                                    });
                                });
                            }
                        });

                        $row.appendTo($constructor.find('tbody'));
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
                    $emptySection.appendTo($constructor);
                }

                var $pagination = $('.pagination');
                $pagination.html(page.getHtml());
                $pagination.find('a').bind('click', function (event) {
                    event.preventDefault();
                    var $this = $(this);
                    var index = $this.data('index');
                    page.setIndex(index);
                    loadConstructor();
                });

            })
            ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };
    loadConstructor();
});