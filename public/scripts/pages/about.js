$(function() {
   var historyBtn = $('.history-line-view .history-date');
   var historyScrollView = $('.history-line-view');

    $('.slider-wrapper').addClass('owl-carousel').owlCarousel({
        loop: true,
        items: 1,
        nav: true,
        dots: true,
        navContainerClass: 'owl-nav-custom',
        dotsContainer: '#carousel-custom-dots',
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    });

   historyBtn.on('click', function() {

        var $this = $(this);
        $this.parent().find('.active').removeClass('active');
        $this.addClass('active');

        $('.history-list').addClass('hide');
        $('.history-list[data-cur-date=' + $this.data('curDate') +']').removeClass('hide');

        historyScrollView.scrollLeft(($this.index() * 100) - 125);
   });

    historyScrollView.scrollLeft((historyBtn.filter('.active').index() * 100) - 125);
});