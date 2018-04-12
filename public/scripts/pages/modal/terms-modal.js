$(function() {

    var tabBtn = $('.tab .tab-item');

    tabBtn.click(function() {
        var $this = $(this);
        var currentTab = $this.data('tab');

        var tab = $('section.tab-contents');

        tab.addClass('hide');
        $(currentTab).removeClass('hide');
        $(currentTab).scrollTop(0);
    });
});