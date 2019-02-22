$(function () {

  var page = new Pagination();

  page.setLimit(40)

  var loadingView = $('<div class="loading-view" style="width:100%;"> <img src="https://static.gridazip.co.kr/assets/images_renewal/loading.gif" /> </div>');


  var portfolioItemBind = function ($element) {
    $element.bind('click', function (event) {
      location.href = $(this).data('link');
    });
  };

  var $magazine = $('.magazine-pictures > .row');
  page.setLimit(40);

  var loadPromise;
  var loadMagazine = function () {
    console.log('loadMagazine loadMagazine loadMagazine');
    $magazine.addClass('loader-section').empty();

    try {
      if (typeof loadPromise !== 'undefined') {
        loadPromise.cancel();
      }
    }
    catch (e) {
      ;
    }

    loadPromise = http.get('/api/magazine?page=' + page.getPage());

    $magazine.html(loadingView);

    loadPromise
      .finally(function () {
        $magazine.removeClass('loader-section');
        $magazine.find('.loading-view').remove();
      })
      .then(function (data) {
        page.set(data.page);
        var $magazineList;
        var $magazineListTemplate = $('#magazineListTemplate').html();
        var $magazineCounter = $('.magazine-count');
        var COLUMN_COUNT = 10;

        if (data.data.length > 0) {
          $magazineCounter.html('전체 ' + data.data.length + '건이 조회되었습니다.');

          for ( var i = 0; i < data.data.length; i ++ ) {
            $magazine.append($('<div class="column"></div>'));
          }
          var columns = $magazine.find('.column');

          data.data.forEach(function (element, index) {
            $magazineList = columns.eq(index);
            $magazineList.append($(
              $magazineListTemplate
                .replace(/{{MG_PK}}/, element.mg_pk)
                .replace(/{{MG_THUMBNAIL}}/, element.mg_thumbnail)
                .replace(/{{MG_SUBJECT}}/, element.mg_subject)
                .replace(/{{MG_CONTENT}}/, element.mg_content)

            ));
          });
        }
        else {
          $magazineCounter.html('조회된 건이 없습니다.');
        }

        var $pagination = $('.pagination');
        $pagination.html(page.getHtml());
        $pagination.find('a').bind('click', function (event) {
          event.preventDefault();
          var $this = $(this);
          var index = $this.data('index');
          page.setIndex(index);
          loadMagazine();
        });

      })
      ['catch'](function (error) {
      swal({
        title: error.value,
        type: 'error'
      });
    });
  };

  loadMagazine();
});