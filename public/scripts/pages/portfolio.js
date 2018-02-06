$(function () {
    var $portfolioSortTab = $('#portfolio_sort_tab');
    var $portfolioStyle = $('#portfolio_style');
    var $portfolioSize = $('#portfolio_size');
    var $portfolioPrice = $('#portfolio_price');

    var page = new Pagination();
    var filter = new Filter({
        sort: null,
        style: null,
        size: null,
        price: null
    });

    $portfolioSortTab.find('.tab-item').bind('click', function (event) {
        event.preventDefault();
        var $this = $(this);
        $this.addClass('active').siblings('.active').removeClass('active');

        var value = $this.data('value');
        filter.setFilter('sort', value === '' ? null : value);
        page.reset();
        page.setLimit(4);
        loadPortfolio();
    });

    $portfolioStyle.bind('change', function (event) {
        var value = $(this).val();
        filter.setFilter('style', value === '' ? null : value);
        page.reset();
        page.setLimit(4);
        loadPortfolio();
    });

    $portfolioSize.bind('change', function (event) {
        var $this = $(this);
        var value = $this.val();

        var options = {};

        if (value === 'lt20') {
            options = {
                'lt1500': '1500만원 미만',
                '1500~2000': '1500~2000만원',
                '2000~2500': '2000~2500만원',
                'gte2500': '2500만원 이상'
            };
        }
        else if (value === 'eq20') {
            options = {
                'lt1500': '1500만원 미만',
                '1500~2000': '1500~2000만원',
                '2000~2500': '2000~2500만원',
                '2500~3000': '2500~3000만원',
                'gte3000': '3000만원 이상'
            };
        }
        else if (value === 'eq30') {
            options = {
                'lt2000': '2000만원 미만',
                '2000~2500': '2000~2500만원',
                '2500~3000': '2500~3000만원',
                '3000~3500': '3000~3500만원',
                '3500~4000': '3500~4000만원',
                'gte4000': '4000만원 이상'
            };
        }
        else if (value === 'eq40') {
            options = {
                'lt2500': '2500만원 미만',
                '2500~3000': '2500~3000만원',
                '3000~3500': '3000~3500만원',
                '3500~4000': '3500~4000만원',
                '4000~4500': '4000~4500만원',
                '4500~5000': '4500~5000만원',
                'gte5000': '5000만원 이상'
            };
        }
        else if (value === 'eq50') {
            options = {
                'lt3000': '3000만원 미만',
                '3000~3500': '3000~3500만원',
                '3500~4000': '3500~4000만원',
                '4000~4500': '4000~4500만원',
                '4500~5000': '4500~5000만원',
                '5000~5500': '5000~5500만원',
                '5500~6000': '5500~6000만원',
                'gte6000': '6000만원 이상'
            };
        }
        else if (value === 'gte60') {
            options = {
                'contact': '협의로 결정'
            };
        }
        else {
            options = {
                '': '먼저 평수를 선택해주세요.'
            };
        }

        $portfolioPrice.find('option:not(.default)').remove();

        for (var idx in options) {
            var element = options[idx];
            $portfolioPrice.append('<option value="' + idx + '">' + element + '</option>');
        }
        $portfolioPrice.val('').triggerHandler('change');
        $portfolioPrice.selectric('refresh');

        var value = $this.val();
        filter.setFilter('size', value === '' ? null : value);
        page.reset();
        page.setLimit(4);
        loadPortfolio();
    });

    $portfolioPrice.bind('change', function (event) {
        var value = $(this).val();
        filter.setFilter('price', value === '' ? null : value);
        page.reset();
        page.setLimit(4);
        loadPortfolio();
    });

    var portfolioItemBind = function ($element) {
        $element.bind('click', function (event) {
            location.href = $(this).data('link');
        });
    };

    var $portfolio = $('.portfolio');
    page.setLimit(4);

    var $colGroupTemplate = $('<div class="col-group"></div>');

    var loadPromise;
    var loadPortfolio = function () {
        $portfolio.addClass('loader-section').empty();

        try {
            if (typeof loadPromise !== 'undefined') {
                loadPromise.cancel();
            }
        }
        catch (e) {
            ;
        }

        loadPromise = http.post('/api/portfolio', {
            page: page.get(),
            filter: filter.get()
        });

        loadPromise
        ['finally'](function () {
            $portfolio.removeClass('loader-section');
        })
        .then(function (data) {
            page.set(data.page);

            var $colGroup1;
            var $colGroup2;
            var $colGroup3;

            if (data.data.length > 0) {
                data.data.forEach(function (element, index) {
                    switch (Number(index) + 1) {
                        case 1:
                        case 4:
                            $colGroup1 = $colGroupTemplate.clone();
                            var $portfolioItem = $('\
                                                    <div class="col-12" data-link="/portfolio/' + element.pf_pk + '">\
                                                        <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\'' + element.pi_after + '\');"></a>\
                                                        <div class="info">\
                                                        <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0).format() + '만원</span>\
                                                        <span class="pull-right">' + element.pf_address + '</span>\
                                                        </div>\
                                                    </div>\
                                                    ');
                            portfolioItemBind($portfolioItem);
                            $portfolioItem.appendTo($colGroup1);
                            $colGroup1.appendTo($portfolio);
                            break;
                        case 2:
                        case 3:
                            if (typeof $colGroup2 === 'undefined') {
                                $colGroup2 = $colGroupTemplate.clone();
                                $colGroup2.appendTo($portfolio);
                            }
                    }

                    if (index === 1) {
                        var $portfolioItem = $('\
                                                <div class="col-8" data-link="/portfolio/' + element.pf_pk + '">\
                                                    <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\'' + element.pi_after + '\');"></a>\
                                                    <div class="info">\
                                                    <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0).format() + '만원</span>\
                                                    <span class="pull-right">' + element.pf_address + '</span>\
                                                    </div>\
                                                </div>\
                                                ');
                        portfolioItemBind($portfolioItem);
                        $portfolioItem.appendTo($colGroup2);
                        console.log(index + 1);
                    }
                    else if (index === 2) {
                        $portfolioItem = $('\
                                            <div class="col-4" data-link="/portfolio/' + element.pf_pk + '">\
                                                <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\'' + element.pi_after + '\');"></a>\
                                                <div class="info">\
                                                <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0).format() + '만원</span>\
                                                <span class="pull-right">' + element.pf_address + '</span>\
                                                </div>\
                                            </div>\
                                            ');
                        portfolioItemBind($portfolioItem);
                        $portfolioItem.appendTo($colGroup2);
                    }
                });
            }
            else {
                var $emptySection = $('\
                                        <div class="empty-section">\
                                            <i class="pe-7s-attention"></i>\
                                            <span>조회된 항목이 없습니다.</span>\
                                        </div>\
                                        ');
                $emptySection.appendTo($portfolio);
            }

            var $pagination = $('.pagination');
            $pagination.html(page.getHtml());
            $pagination.find('a').bind('click', function (event) {
                event.preventDefault();
                var $this = $(this);
                var index = $this.data('index');
                page.setIndex(index);
                loadPortfolio();
            });

        })
        ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };
    loadPortfolio();
});