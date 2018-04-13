function initMap() {
    var uluru = {lat: 37.5592720, lng: 126.8609550};
    var map = new google.maps.Map(document.querySelector('.google-maps'), {
        zoom: 18,
        center: uluru,
        zoomControl: false,
        scaleControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: 'none'
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
}

$(function () {
    loading(true);
    var $supportList = $('.support-list');
    var $supportNotice = $supportList.filter('.support-notice');
    var $supportFaq = $supportList.filter('.support-faq');

    var noticePage = new Pagination();
    var faqPage = new Pagination();

    noticePage.setLimit(5);
    // faqPage.setLimit(5);

    var $supportItemTemplate = $('#supportListTemplate').html();

    var supportItemBind = function ($element) {
        $element.find('.folding-btn').bind('click', function (event) {
            event.preventDefault();
            var $this = $(this);
            var $target = $this.parents('li');

            if ($target.hasClass('fold')) {
                $target.removeClass('fold');
                $this.find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
            }
            else {
                $target.addClass('fold');
                $this.find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
            }
        });
    };

    var supportMoreBind = function ($element, loaderFunc) {
        $element.bind('click', function (event) {
            event.preventDefault();
            $element.find('span').text('불러오는 중입니다.');
            loaderFunc($element);
        });
    };

    var loadNotice = function ($element) {
        if (typeof $element !== 'undefined') {
            $element.remove();
        }

        http.post('/api/board/notice', {
            page: noticePage.get()
        })
        .finally(function () {
            $supportNotice.removeClass('loading');
        })
        .then(function (data) {
            if (noticePage.getPage() === 0) {
                $supportNotice.empty();
            }

            noticePage.set(data.page);

            var supportListHtml = '';

            data.data.forEach(function(element, idx) {
                var isFold = true;
                if ( idx === 0 ) {
                    isFold = false;
                }

                supportListHtml += $supportItemTemplate
                    .replace(/{{FOLD_CLASS}}/, isFold ? 'fold' : '')
                    .replace(/{{TITLE}}/, element.nt_title)
                    .replace(/{{CONTENT}}/, element.nt_content.replace(/\n/gi, '<br />'));
            });

            supportListHtml = $(supportListHtml);
            $('#noticeListView').html(supportListHtml);
            supportItemBind(supportListHtml);

            //
            // if (noticePage.isEnd() === false) {
            //     var $supportMore = $supportItemMoreTemplate.clone();
            //     supportMoreBind($supportMore, loadNotice);
            //     $supportMore.appendTo($supportNotice);
            // }
        })
        ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    var loadFaq = function ($element) {
        if (typeof $element !== 'undefined') {
            $element.remove();
        }

        http.post('/api/board/faq', {
            page: faqPage.get()
        })
        ['finally'](function () {
            $supportFaq.removeClass('loading');
        })
        .then(function (data) {
            if (faqPage.getPage() === 0) {
                $supportFaq.empty();
            }

            faqPage.set(data.page);

            var supportListHtml = '';

            data.data.forEach(function(element, idx) {
                var isFold = true;
                if ( idx === 0 ) {
                    isFold = false;
                }

                supportListHtml += $supportItemTemplate
                    .replace(/{{FOLD_CLASS}}/, isFold ? 'fold' : '')
                    .replace(/{{TITLE}}/, element.faq_question)
                    .replace(/{{CONTENT}}/, element.faq_answer.replace(/\n/gi, '<br />'));
            });

            supportListHtml = $(supportListHtml);
            $('#faqListView').html(supportListHtml);

            supportItemBind(supportListHtml);
            loading(false);

            if (faqPage.isEnd() === false) {
                var $supportMore = $supportItemMoreTemplate.clone();
                supportMoreBind($supportMore, loadFaq);
                $supportMore.appendTo($supportFaq);
            }
        })
        ['catch'](function (error) {
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    loadNotice();
    loadFaq();
});

