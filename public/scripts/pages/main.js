$(function () {
    $('.main-visual-slider .slider-wrapper').addClass('owl-carousel').owlCarousel({
        loop: true,
        items: 1,
        nav: true,
        dots: true,
        navContainerClass: 'owl-nav-custom',
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        dotsContainer: '#carousel-custom-dots',
        // autoplay:true,
        // autoplayTimeout:5000,
        // autoplayHoverPause:true
    });


    $('.modal-portfolio .slider-wrapper').addClass('owl-carousel').owlCarousel({
        loop: true,
        items: 1,
        nav: false,
        // center: true,
        dots: false,
        navContainerClass: 'owl-nav-custom',
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    });

    var page = new Pagination();
    var filter = new Filter({
        sort: null,
        style: null,
        size: null,
        price: null
    });

    page.setLimit(10);

    var requestViewInstance = requestView({
        authRequestBtn: $('#authRequestBtn'),
        confirmBtn: $('#confirmBtn'),
        form: $('#mainRequestForm')
    });

    requestViewInstance.bindEvent();

    var loadPromise;
    var loadPortfolio = function () {

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

            })
            .then(function (data) {
                console.log(data);
                page.set(data.page);

                var portfolioImageTemplate = $('#portfolioImageTemplate').html();
                var portfolioImageHtml = '';

                var portfolioData = data.data;

                _.forEach(portfolioData, function(portfolio, index) {
                    portfolioImageHtml += portfolioImageTemplate
                        .replace(/{{PF_PK}}/, portfolio.pf_pk)
                        .replace(/{{PI_AFTER}}/, portfolio.pi_after)
                        .replace(/{{PF_PK}}/, portfolio.pf_pk)
                        .replace(/{{PF_ADDRESS}}/, portfolio.pf_address)
                        .replace(/{{PF_SIZE}}/, portfolio.pf_size)
                        .replace(/{{PF_PRICE}}/, portfolio.pf_price);
                });

                $('#portfolioListView').html(portfolioImageHtml);


                $('.main-portfolio .slider-wrapper').addClass('owl-carousel').owlCarousel({
                    loop: true,
                    center: true,
                    dots: true,
                    margin:40,
                    navContainerClass: 'owl-nav-custom',
                    navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                    dotsContainer: '#carousel-custom-dots-portfolio',
                    responsiveClass:true,
                    responsive: {
                        0: {
                            items: 1,
                            nav: false,
                        },
                        980: {
                            items: 3,
                            nav: true,
                        },
                        1600: {
                            items: 4,
                            nav: true,
                        },
                    }
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