function Header() {
}

Header.setScroll = function($) {

    $(window).scroll(function() {
        var scrollTop = $(window).scrollTop();
        if (scrollTop >= 100) {
            $('#header').addClass("scrolled");
        }
        else {
            $('#header').removeClass("scrolled");
        }
    });
};

Header.setMenuEvent = function($) {
    var mainView = $('html');

    $(document).on('click', '#header .mobile-menu-icon', function() {
        var $this = $(this);
        $this.parents('.header-inner').toggleClass('open');
        mainView.toggleClass('scroll-block');
    })
};

(function($) {
    Header.setScroll($);
    Header.setMenuEvent($);
})(jQuery);