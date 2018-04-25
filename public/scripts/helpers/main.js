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

$(function () {
  var aTag = $('a')
  var aTagCount = aTag.length

  for (var i = 0; i < aTagCount; i++) {
    if (aTag.eq(i).attr('href') === '#') {
      aTag.eq(i).attr('href', 'javascript:void(0);')
    }
  }
})

location.queryString = {}
location.search.substr(1).split('&').forEach(function (pair) {
  if (pair === '') return
  var parts = pair.split('=')
  location.queryString[parts[0]] = parts[1] &&
        decodeURIComponent(parts[1].replace(/\+/g, ' '))
});

(function () {
  var $body = null
  var $loading = null

  $(function () {
    $body = $('body')
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
    </div>')
  })

  window.loading = function (show) {
    if ($body === null || $loading === null) {
      return
    }

    if (typeof show === 'undefined') {
      show = true
    }
    if ($loading.parent().is($body) === false) {
      $loading.appendTo($body)
    }

    if (show === true) {
      $loading.show()
    } else {
      $loading.hide()
    }
  }
}())
