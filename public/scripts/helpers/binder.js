$(function () {
  var $window = $(window)
  var $visual = $('.main-visual .btn')
  var $footer = $('#footer')
  var $floating = $('.btn-floating')
  var floatingTimeout = 500
  var floatingTimer

  var resetFloating = function () {
    try {
      clearTimeout(floatingTimer)
    } catch (e) {
      ;
    }

    floatingTimer = setTimeout(function () {
      $floating.addClass('active')
    }, floatingTimeout)
  }

    // $window.bind('scroll.floating', function (event) {
    //     var scrollTop = $window.scrollTop();
    //     var scrollBottom = scrollTop + $window.outerHeight();
    //
    //     try {
    //         clearTimeout(floatingTimer);
    //     } catch (e) {
    //         ;
    //     }
    //
    //     $floating.removeClass('active');
    //
    //     if (
    //         (
    //             window.location.pathname !== '/' ||
    //             $visual.offset().top + $visual.outerHeight() < scrollTop
    //         ) &&
    //         scrollBottom < $footer.offset().top
    //     ) {
    //         resetFloating();
    //     }
    // }).triggerHandler('scroll.floating');

  $('.phone').each(function (i, e) {
    $(e).bind('keydown.phoneHandler keyup.phoneHandler', function (event) {
      var $this = $(this)
      var value = $this.val().replace(/[^\d]/g, '')

      if (value.length >= 11) {
        $this.val(value.replace(/(\d{3})(\d{4})(\d)/, '$1-$2-$3'))
      } else if (value.length >= 7) {
        $this.val(value.replace(/(\d{3})(\d{3})(\d)/, '$1-$2-$3'))
      } else if (value.length >= 4) {
        $this.val(value.replace(/(\d{3})(\d+)/, '$1-$2'))
      }
    })
  })

  $('.selectric').each(function (i, e) {
    $(e).selectric({
      disableOnMobile: true
    })
  })

  $('.calendar').each(function (i, e) {
    var $this = $(this)
    $(e).pignoseCalendar({
      lang: 'ko',
      date: ($this.data('today') ? moment($this.data('today')) : undefined),
      minDate: $this.data('min'),
      maxDate: $this.data('max')
    })
  })

  $('#header .btn-menu').bind('click', function (event) {
    event.preventDefault()

    var $target = $('#header .menu')
    if ($target.hasClass('active')) {
      $target.removeClass('active').hide()
    } else {
      $target.addClass('active').show()
    }
  })

  $('.magnific').each(function () {
    var $this = $(this)

    $this.bind('click', function (event) {
      event.stopPropagation()
    })

    $this.magnificPopup({
      items: {
        src: $this.attr('src')
      },
      type: 'image',
      mainClass: 'mfp-with-zoom',
      zoom: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        opener: function (opener) {
          return $this
        }
      }
    })
  })

    $.fn.bindFile = function() {
        // var fileManager = new FileManager();

        this.each(function() {
            if ($(this).data('initBind') !== false) {
                // fileManager.bindFileProcess($(this));
            }
        });
    };


  $('.btn-fold').bind('click', function (event) {
    event.preventDefault()
    var $this = $(this)
    if ($this.hasClass('active')) {
      $this.removeClass('active')
      $this.next().removeClass('active')
      $this.find('span').text('추가 정보 입력')
    } else {
      $this.addClass('active')
      $this.next().addClass('active')
      $this.find('span').text('닫기')
    }
  })

    $('input:file').each(function() {
        var $this = $(this);
        $this.bindFile();
    });

    $('[data-modal]').bind('click', function() {
       var $this = $(this);
       var modalTarget = $this.data('modal');

       Modal.open(modalTarget);
    });

    $('[data-close-modal]').bind('click', function() {
        var $this = $(this);
        var modalTarget = $this.data('closeModal');

        Modal.close(modalTarget);
    });

    $('.modal div.background').bind('click', function() {
        var $this = $(this);
        var closeBtn = $this.parents('.modal').find('[data-close-modal]');

        var modalTarget = closeBtn.data('closeModal');

        Modal.close(modalTarget);
    });

    var modalRequestForm = $('#modalRequestForm');

    var requestViewInstance = requestView({
        authRequestBtn: modalRequestForm.find('#modalAuthRequestBtn'),
        confirmBtn: modalRequestForm.find('#modalConfirmBtn'),
        form: modalRequestForm
    });

    requestViewInstance.bindEvent();
});