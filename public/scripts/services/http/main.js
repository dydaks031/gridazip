/* eslint-disable no-extend-native */
Object.defineProperty(Array.prototype, 'toJson', {
  enumerable: false,
  value: function () {
    var data = {}
    this.map(function (x) { data[x.name] = x.value })
    return data
  }
});

(function ($) {
  $.fn.serializeJson = function () {
    return this.serializeArray().toJson()
  }
}(jQuery))

function Http () {
  this.options = {
    timeout: 30000
  }
}

Http.prototype.request = function (url, type, data) {
  var context = this

  if (typeof data !== 'undefined') {
    if (data instanceof jQuery) {
      data = data.serializeJson()
    }
  } else {
    data = {}
  }

  var promise = new Promise(function (resolve, reject, cancel) {
    var request = $.ajax({
      url: url,
      contentType: 'application/json',
      type: type,
      data: JSON.stringify(data),
      dataType: 'json',
      timeout: context.options.timeout,
      complete: function () {

      },
      success: function (data, status, xhr) {
        data = context.decapsulation(data)
        if (data.isError === true) {
          if (data.code === 403) {
            swal({
              title: data.value || '먼저 로그인을 진행하여주시기 바랍니다.',
              type: 'warning'
            }, function () {
              setTimeout(function () {
                location.href = '/user/login'
              }, 50)
            })
          } else {
            reject(data)
          }
        } else {
          resolve(data)
        }
      },
      error: function (xhr, status, error) {
        reject(context.generateError(xhr.statusText, 800, true))
      }
    })

    cancel(function () {
      request.abort()
    })
  })

  return promise
}

Http.prototype.get = function (url, data) {
  return this.request(url, 'get', data)
}

Http.prototype.post = function (url, data) {
  return this.request(url, 'post', data)
}

Http.prototype.decapsulation = function (data) {
  var context = this

  if (typeof data !== 'undefined' && typeof data.code !== 'undefined') {
    if (data.code === 200) {
      if (typeof data.data !== 'undefined') {
        return $.extend({
          isError: false
        }, data.data)
      } else {
        return context.generateError('데이터를 포함한 응답을 수신하지 못했습니다.')
      }
    } else {
      if (
        typeof data.code !== 'undefined' &&
                typeof data.data !== 'undefined' &&
                typeof data.data.msg !== 'undefined'
      ) {
        return context.generateError(data.data.msg, data.code)
      } else {
        return context.generateError('오류에 대한 정보를 수신하지 못했습니다.')
      }
    }
  } else {
    return context.generateError('서버에서 데이터가 올바르게 전송되지 않은 것 같습니다.')
  }
}

Http.prototype.generateError = function (msg, code, isNative) {
  code = code || -1
  isNative = isNative || false
  return {
    isError: true,
    isNative: isNative,
    code: code,
    value: msg
  }
}

window.http = new Http()
