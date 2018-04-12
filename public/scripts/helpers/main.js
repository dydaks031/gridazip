// eslint-disable-next-line no-extend-native
Object.defineProperty(Number.prototype, 'format', {
  enumerable: false,
  value: function (number, section) {
    var regex = '\\d(?=(\\d{' + (section || 3) + '})+' + (number > 0 ? '\\.' : '$') + ')'
    return this.toFixed(Math.max(0, ~~number)).replace(new RegExp(regex, 'g'), '$&,')
  }
})

Promise.config({
  cancellation: true
})

moment.locale('ko')

$(function() {
    var aTag = $('a'),
        aTagCount = aTag.length;

    for ( var i = 0; i < aTagCount; i ++ ) {
        if ( aTag.eq(i).attr('href') === '#' ) {
            aTag.eq(i).attr('href', 'javascript:void(0);');
        }
    }
});

location.queryString = {}
location.search.substr(1).split('&').forEach(function (pair) {
  if (pair === '') return
  var parts = pair.split('=')
  location.queryString[parts[0]] = parts[1] &&
        decodeURIComponent(parts[1].replace(/\+/g, ' '))
})

var loading;
(function() {
  var $body = null;
  var $loading = null;

  $(function() {
    $body = $('body');
    $loading = $('<div class="loader-full">\
      <div class="loader-inner">\
        <div class="loader">\
          <div class="bounce1"></div>\
          <div class="bounce2"></div>\
        </div>\
        <div class="message">\
          요청을 처리하고있습니다.<br />\
          잠시만 기다려주세요.\
        </div>\
      </div>\
    </div>');
  });

  loading = function(show) {
    if ($body === null || $loading === null) {
      return;
    }

    if (typeof show === 'undefined') {
      show = true;
    }
    if ($loading.parent().is($body) === false) {
      $loading.appendTo($body);
    }

    if (show === true) {
      $loading.show();
    } else {
      $loading.hide();
    }
  };
} ());

var openWindow = function (url, name, width, height, options) {
    "use strict";

    var finalOptions, opts, winTop, winLeft, finalTop, finalLeft, winHeight, winWidth;

    finalOptions = [];

    if (!options) {
        options = "";
    }

    width = +width;
    if (isNaN(width)) {
        width = 400;
    }

    height = +height;
    if (isNaN(height)) {
        height = 400;
    }

    if (options.indexOf("top=") < 0) {
        winTop = +(window.screenY || window.screenTop || 50);
        winHeight = +(window.outerHeight || window.innerHeight || 500);
        finalTop = (winTop + ((winHeight / 2) - (height / 2)));
        finalOptions.push("top=" + finalTop);
    }

    if (options.indexOf("left=") < 0) {
        winLeft = +(window.screenX || window.screenLeft || 50);
        winWidth = +(window.outerWidth || window.innerWidth || 500);
        finalLeft = (winLeft + ((winWidth / 2) - (width / 2)));
        finalOptions.push("left=" + finalLeft);
    }

    finalOptions.push("height=" + height);
    finalOptions.push("width=" + width);

    opts = finalOptions.join(",") + (options ? "," + options : "");

    return window.open(url, name, opts);
}
