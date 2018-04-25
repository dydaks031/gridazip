function Modal () {
}

Modal.getTarget = function (target) {
  if (!target) {
    return {
      target: target
    }
  }

  if (target.indexOf('#') > -1) {
    var _target = target.split('#')

    return {
      target: _target[0],
      willOpenTab: _target[1]
    }
  } else {
    return {
      target: target
    }
  }
}

Modal.open = function (target) {
  var targetElement = Modal.getTarget(target)

  var $target = $('.' + targetElement.target)

  if (!$target.get(0)) {
    return false
  }

  $target.removeClass('hide')
  $('html').addClass('scroll-block')

  // $target.css({
  //     top: $target.offset().top,
  //     position:'absolute'
  // });

  // $(document).on('touchmove', function(e) {
  //     e.preventDefault();
  // });

  // if(browser().mobile) {
  //     $target.find('input').on('blur', function() {
  //         $(window).scrollTop($target.offset().top);
  //     });
  //
  //     $target.find('input').on('focus', function() {
  //         var $this = $(this);
  //         $(window).scrollTop($this.offset().top - 50);
  //     });
  // }

  if (targetElement.hasOwnProperty('willOpenTab')) {
    $target.find('.tab-contents').addClass('hide')
    $target.find('#' + targetElement.willOpenTab).removeClass('hide')
  }
}

Modal.close = function (target) {
  var targetElement = Modal.getTarget(target)
  var $target = $('.' + targetElement.target)

  if (!$target.get(0)) {
    return false
  }

  $target.addClass('hide')
  $('html').removeClass('scroll-block')

  if (target === 'modal-request') {
    $target.find('.auth-input').addClass('hide')
    $target.find(':input')
      .not(':button, :submit, :reset, :hidden')
      .val('')
      .removeAttr('checked')
      .removeAttr('selected')
  }
}