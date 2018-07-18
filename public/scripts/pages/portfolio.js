$(function () {
    var $portfolioSortTab = $('#portfolio_sort_tab');
    var $portfolioStyle = $('#portfolio_style');
    var $portfolioSize = $('#portfolio_size');
    var $portfolioPrice = $('#portfolio_price');

    var isSetTabList = false;

    var page = new Pagination();
    var filter = new Filter({
        sort: null,
        style: null,
        size: null,
        price: null
    });

    page.setLimit(40)

    var loadingView = $('<div class="loading-view" style="width:100%;"> <img src="https://static.gridazip.co.kr/assets/images_renewal/loading.gif" /> </div>');

    var portfolioTabItemBind = function($element) {
        $element.bind('click', function (event) {
            event.preventDefault();
            var $this = $(this);
            $this.addClass('active').siblings('.active').removeClass('active');

            var value = $this.data('value');
            filter.setFilter('style', value === '' ? null : value);
            page.reset();
            page.setLimit(40);
            loadPortfolio();
        });
    }

    $portfolioStyle.bind('change', function (event) {
        var value = $(this).val();
        filter.setFilter('style', value === '' ? null : value);
        page.reset();
        page.setLimit(40);
        loadPortfolio();
    });

    var portfolioItemBind = function ($element) {
        $element.bind('click', function (event) {
            location.href = $(this).data('link');
        });
    };

    var $portfolio = $('.portfolio-pictures > .row');
    page.setLimit(40);

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

        $portfolio.html(loadingView);

        loadPromise
        .finally(function () {
            $portfolio.removeClass('loader-section');
            $portfolio.find('.loading-view').remove();
        })
        .then(function (data) {
            page.set(data.page);
            var $portfolioList;
            var $portfolioListTemplate = $('#portfolioListTemplate').html();
            var COLUMN_COUNT = 4;

            if (data.data.length > 0) {
                if ( !isSetTabList ) {
                    isSetTabList = true;
                    setTabList(data.data);
                }

                for ( var i = 0; i < COLUMN_COUNT; i ++ ) {
                  $portfolio.append($('<div class="column"></div>'));
                }
                var columns = $portfolio.find('.column')

                data.data.forEach(function (element, index) {
                    $portfolioList = columns.eq(index % COLUMN_COUNT)
                    $portfolioList.append($(
                        $portfolioListTemplate
                            .replace(/{{PF_PK}}/, element.pf_pk)
                            .replace(/{{PI_AFTER}}/, element.pi_after)
                            .replace(/{{PF_TITLE}}/, element.pf_title)
                    ));
                });
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

    var setTabList = function(tabListData) {
        var $portfolioTab = $('#portfoliTab');
        var tabTemplate = $('#tabTemplate').html();
        var tabData = _.uniq(_.pluck(tabListData,  'pf_style'));
        var tabHtml = '';

        tabData.unshift('전체');
        tabData.forEach(function(element, index) {
            tabHtml += tabTemplate
                .replace(/{{TAB_NAME}}/gi, element)
                .replace(/{{TAB_VALUE}}/gi, element === '전체' ? '' : element);
        });

        $portfolioTab.html(tabHtml);

        portfolioTabItemBind($portfolioTab.find('.tab-item'));
    };

    loadPortfolio();
    setTabList()
});