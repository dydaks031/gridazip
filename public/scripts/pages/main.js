$(function () {
  $('.main-visual-slider .slider-wrapper').addClass('owl-carousel').owlCarousel({
    loop: true,
    items: 1,
    nav: true,
    dots: true,
    navContainerClass: 'owl-nav-custom',
    navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    dotsContainer: '#carousel-custom-dots'
    // autoplay:true,
    // autoplayTimeout:5000,
    // autoplayHoverPause:true
  })

  $('.modal-portfolio .slider-wrapper').addClass('owl-carousel').owlCarousel({
    loop: true,
    items: 1,
    nav: false,
    // center: true,
    dots: false,
    navContainerClass: 'owl-nav-custom',
    navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
  })

  var page = new Pagination()
  var filter = new Filter({
    sort: null,
    style: null,
    size: null,
    price: null
  })

  page.setLimit(10)

  var requestViewInstance = requestView({
    authRequestBtn: $('#authRequestBtn'),
    confirmBtn: $('#confirmBtn'),
    form: $('#mainRequestForm')
  })

  requestViewInstance.bindEvent()

  var loadPromise
  var loadPortfolio = function () {
    var carousel = $('.main-portfolio .slider-wrapper')
    var carouselOptions = {
      loop: true,
      center: true,
      dots: true,
      margin: 40,
      navContainerClass: 'owl-nav-custom',
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      dotsContainer: '#carousel-custom-dots-portfolio',
      responsiveClass: true,
      lazyLoad: true,
      responsive: {
        0: {
          items: 1,
          nav: false
        },
        980: {
          items: 3,
          nav: true
        },
        1600: {
          items: 4,
          nav: true
        }
      }
    }

    carousel.addClass('owl-carousel').owlCarousel(carouselOptions)

    try {
      if (typeof loadPromise !== 'undefined') {
        loadPromise.cancel()
      }
    } catch (e) {
      ;
    }

    loadPromise = http.post('/api/portfolio', {
      page: page.get(),
      filter: filter.get()
    })

    loadPromise
      .finally(function () {

      })
      .then(function (data) {
        page.set(data.page)

        var portfolioImageTemplate = $('#portfolioImageTemplate').html()
        var portfolioImageHtml = ''

        var portfolioData = data.data

        carousel.trigger('destroy.owl.carousel')
        carousel.find('.owl-stage-outer').children().unwrap()
        carousel.removeClass('owl-center owl-loaded owl-text-select-on')

        _.forEach(portfolioData, function (portfolio, index) {
          portfolioImageHtml += portfolioImageTemplate
            .replace(/{{PF_PK}}/, portfolio.pf_pk)
            .replace(/{{PI_AFTER}}/, portfolio.pi_after)
            .replace(/{{PF_PK}}/, portfolio.pf_pk)
            .replace(/{{PF_ADDRESS}}/, portfolio.pf_address)
            .replace(/{{PF_SIZE}}/, portfolio.pf_size)
            .replace(/{{PF_PRICE}}/, portfolio.pf_price)
        })

        var $portfolioImageHtml = $(portfolioImageHtml)
        carousel.html($portfolioImageHtml)
        // reinitialize the carousel (call here your method in which you've set specific carousel properties)
        carousel.owlCarousel(carouselOptions)

        $(document).on('click', '#portfolioListView .image-items', function () {
          var $this = $(this)
          var portfolioKey = $this.data('value')

          location.href = '/portfolio/' + portfolioKey
        })
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  var loadReviewPromise
  var loadReview = function () {
    try {
      if (typeof loadReviewPromise !== 'undefined') {
        loadReviewPromise.cancel()
      }
    } catch (e) {
      ;
    }

    loadReviewPromise = http.post('/api/portfolio/review')

    loadReviewPromise
      .finally(function () {

      })
      .then(function (data) {
        var reviewTemplate = $('#reviewTemplate').html()
        var reviewContainer = $('.review-wrapper')

        var reviewData = data.reviewList

        if (reviewData.length === 0) {
          return
        }

        var curReviewData = reviewData[0]
        var reviewElement

        reviewElement = reviewTemplate
          .replace(/{{PF_REVIEW}}/, curReviewData.pf_review)
          .replace(/{{PF_USER}}/, curReviewData.pf_user)
          .replace(/{{PF_TITLE}}/, curReviewData.pf_title)

        reviewContainer.append(reviewElement)
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  loadPortfolio()
  loadReview()
})
