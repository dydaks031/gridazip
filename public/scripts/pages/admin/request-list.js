$(function () {
    var $requestSortTab = $('#request_sort_tab');
    var $requestStyle = $('#request_style');
    var $requestSize = $('#request_size');
    var $requestPrice = $('#request_price');

    var page = new Pagination();
    var filter = new Filter({
        isValuable: null
    });

    var $request = $('.table-request');
    page.setLimit(20);

    var loadPromise;
    var loadDesigner = function () {
        $request.find('tbody').empty().append('<tr><td colspan="7" class="loading"></td></tr>');

        try {
            if (typeof loadPromise !== 'undefined') {
                loadPromise.cancel();
            }
        }
        catch (e) {
            ;
        }

        loadPromise = http.post('/api/admin/request/list', {
            page: page.get(),
            filter: filter.get()
        });

        loadPromise
            ['finally'](function () {
            $request.find('.loading').closest('tr').remove();
        })
            .then(function (data) {
                page.set(data.page);
                if (data.data.length > 0) {
                    data.data.forEach(function (element, idx) {
                        console.log(element.rq_date);
                        console.log(element.rq_date === '0000-00-00');
                        var $row = $('\
                            <tr data-idx="' + element.rq_pk + '">\
                                <td class="center">' + element.rq_pk + '</td>\
                                <td class="center">' + element.rq_name + '</td>\
                                <td class="center">' + element.rq_size_str + '</td>\
                                <td class="center">' + element.rq_budget_str + '</td>\
                                <td class="center">' + element.rq_phone + '</td>\
                                <td class="center">' + (element.rq_date === '0000-00-00' ? '' : moment(element.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')) + '</td>\
                                <td class="center">' + element.rq_time + '</td>\
                                <td class="center switch-btn">\
                                    <label class="switch">\
                                      <input type="checkbox" ' + (element.rq_is_valuable === 2 ? 'checked="checked"': '' ) + '">\
                                      <span class="slider round"></span>\
                                    </label>\
                                </td>\
                            </tr>\
                        ');

                        console.log($row);

                        $row.bind('click', function(event) {
                            event.preventDefault();
                            var $this = $(this);
                            var index = $this.data('idx');
                            location.href = '/admin/request/' + index;
                        });

                        $row.find('.switch-btn').bind('click', function(event) {
                            // event.preventDefault();
                            event.stopPropagation();
                        })

                        $row.find('.switch-btn input[type=checkbox]').bind('change', function() {
                            var $this = $(this);
                            var index = $this.parents('tr').data('idx');
                            var isValuable = $this.prop('checked');

                            updateIsValueable(index, isValuable);
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

                        $row.appendTo($request.find('tbody'));
                    });
                }
                else {
                    var $emptySection = $('\
                    <tr>\
                        <td colspan="6" class="empty-section">\
                            <i class="pe-7s-attention"></i>\
                            <span>조회된 항목이 없습니다.</span>\
                        </td>\
                    </tr>\
                ');
                    $emptySection.appendTo($request);
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
                console.log(error);
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };
    loadDesigner();

    function updateIsValueable(index, isValuable) {
        var updatePromise = http.post('/api/admin/request/save/' + index, {
            request_is_valuable: isValuable ? 2: 1
        }).then(function(data) {
            console.log(data);
        })
    }

});