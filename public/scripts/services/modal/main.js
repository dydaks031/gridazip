function Modal() {
}

Modal.getTarget = function(target) {
    if ( target.indexOf('#') > -1 ) {
        var _target = target.split('#');

        return {
            target: _target[0],
            willOpenTab: _target[1],
        }
    } else {
        return {
            target: target
        }
    }
}

Modal.open = function(target) {
    var targetElement = Modal.getTarget(target);

    var $target = $('.' + targetElement.target);

    if ( !$target.get(0) ) {
        return false;
    }

    $target.removeClass('hide');
    $('html').addClass('scroll-block');
};

Modal.close = function(target) {
    var targetElement = Modal.getTarget(target);

    var $target = $('.' + targetElement.target);

    if ( !$target.get(0) ) {
        return false;
    }

    $target.addClass('hide');
    $('html').removeClass('scroll-block');
};

// (function($) {
//
// })(jQuery);