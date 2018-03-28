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

    var portfolioItemBind = function ($element) {
        $element.bind('click', function (event) {
            location.href = $(this).data('link');
        });
    };

    var $portfolio = $('.portfolio-pictures > .row');
    page.setLimit(20);

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
        .finally(function () {
            $portfolio.removeClass('loader-section');
        })
        .then(function (data) {
            page.set(data.page);
            console.log(data);
            var $portfolioList;
            var $portfolioListTemplate = $('#portfolioListTemplate').html();
            var $portfolioListContainer = $('#')

            if (data.data.length > 0) {
                data.data.forEach(function (element, index) {
                    if ( index % 4 === 0 ) {
                        console.log($portfolioList);
                        $portfolio.append($portfolioList);
                        $portfolioList = $('<div class="column"></div>');
                        console.log($portfolioList);
                    }

                    $portfolioList.append($(
                        $portfolioListTemplate
                            .replace(/{{PF_PK}}/, element.pf_pk)
                            .replace(/{{PI_AFTER}}/, element.pi_after)
                            .replace(/{{PF_TITLE}}/, element.pf_title)
                    ));
                });

                if ( $portfolioList.find('.image-items').length > 0 ) {
                    $portfolio.append($portfolioList);
                }
            }
            else {

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