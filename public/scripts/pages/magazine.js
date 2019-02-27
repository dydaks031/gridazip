$(function () {

  var page = new Pagination();
  page.setLimit(4);

  var loadingView = $('<div class="loading-view" style="width:100%;"> <img src="https://static.gridazip.co.kr/assets/images_renewal/loading.gif" /> </div>');

  var $magazine = $('.magazine-pictures > .row');
  var loadPromise;
  var loadMagazine = function () {
    $magazine.addClass('loader-section').empty();

    try {
      if (typeof loadPromise !== 'undefined') {
        loadPromise.cancel();
      }
    }
    catch (e) {
      ;
    }

    loadPromise = http.post(`/api/magazine`, {page: page.get()});

    $magazine.html(loadingView);

    loadPromise
      .finally(function () {
        console.log('fnly');
        $magazine.removeClass('loader-section');
        $magazine.find('.loading-view').remove();
      })
      .then(function (data) {
        page.set(data.page);

        var $magazineList;
        var $magazineListTemplate = $('#magazineListTemplate').html();
        var $magazineCounter = $('.magazine-count');

        if (data.data.length > 0) {
          $magazineCounter.html('전체 ' + data.page.count + '건이 조회되었습니다.');

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
      .catch(function (error) {
        console.log(error);
        swal({
          title: error.value,
          type: 'error'
        });
    });
  };

  loadMagazine();
});