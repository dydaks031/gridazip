$(function () {
  var $supportList = $('.support-list')
  var $supportNotice = $supportList.filter('.support-notice')
  var $supportFaq = $supportList.filter('.support-faq')

  var noticePage = new Pagination()
  var faqPage = new Pagination()

  noticePage.setLimit(5)
  faqPage.setLimit(5)

  var $supportItemTemplate = $('\
    <div class="support-group">\
      <div class="support-item">\
        <span class="title"></span>\
        <span class="date"></span>\
        <span class="arrow">\
          <i class="pe-7s-angle-down"></i>\
        </span>\
      </div>\
      <div class="support-content">\
      </div>\
    </div>')

  var $supportItemMoreTemplate = $('\
    <a href="#" class="btn-more">\
      <i class="fa fa-chevron-down"></i>\
      <span>더보기</span>\
    </a>\
  ')

  var supportItemBind = function ($element) {
    $element.bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var $target = $this.closest('.support-group')

      if ($target.hasClass('active')) {
        $target.removeClass('active')
      } else {
        $target.addClass('active')
      }
    })
  }

  var supportMoreBind = function ($element, loaderFunc) {
    $element.bind('click', function (event) {
      event.preventDefault()
      $element.find('span').text('불러오는 중입니다.')
      loaderFunc($element)
    })
  }

  var loadNotice = function ($element) {
    if (typeof $element !== 'undefined') {
      $element.remove()
    }

    http.post('/api/board/notice', {
      page: noticePage.get()
    })
      .finally(function () {
        $supportNotice.removeClass('loading')
      })
      .then(function (data) {
        if (noticePage.getPage() === 0) {
          $supportNotice.empty()
        }

        noticePage.set(data.page)

        data.data.forEach(function (element, idx) {
          var $supportItem = $supportItemTemplate.clone()
          supportItemBind($supportItem)
          $supportItem.find('.title').text(element.nt_title)
          $supportItem.find('.date').text(moment(element.nt_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'))
          $supportItem.find('.support-content').html(element.nt_content.replace(/\n/g, '<br />'))
          $supportItem.appendTo($supportNotice)
        })

        if (noticePage.isEnd() === false) {
          var $supportMore = $supportItemMoreTemplate.clone()
          supportMoreBind($supportMore, loadNotice)
          $supportMore.appendTo($supportNotice)
        }
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  var loadFaq = function ($element) {
    if (typeof $element !== 'undefined') {
      $element.remove()
    }

    http.post('/api/board/faq', {
      page: faqPage.get()
    })
      .finally(function () {
        $supportFaq.removeClass('loading')
      })
      .then(function (data) {
        if (faqPage.getPage() === 0) {
          $supportFaq.empty()
        }

        faqPage.set(data.page)

        data.data.forEach(function (element, idx) {
          var $supportItem = $supportItemTemplate.clone()
          supportItemBind($supportItem)
          $supportItem.find('.title').text(element.faq_question)
          $supportItem.find('.date').text(moment(element.faq_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'))
          $supportItem.find('.support-content').html(element.faq_answer.replace(/\n/g, '<br />'))
          $supportItem.appendTo($supportFaq)
        })

        if (faqPage.isEnd() === false) {
          var $supportMore = $supportItemMoreTemplate.clone()
          supportMoreBind($supportMore, loadFaq)
          $supportMore.appendTo($supportFaq)
        }
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  loadNotice()
  loadFaq()
})
