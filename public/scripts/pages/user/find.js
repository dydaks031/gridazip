$(function () {
  var $pageType = $('#page_type')
  var pageType = $pageType.val()

  var $find = $('.find')
  var $findItem = $find.find('.find-item')
  var $formFind = $('.form.form-find')
  var $formResult = $('.form-result')

  var regexPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/
  var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  var $inputUserName = $formFind.find('#user_name')
  var $inputUserPhone = $formFind.find('#user_phone')
  var $inputUserEmail = $formFind.find('#user_email')

  var $formResultItemTemplate = $('\
    <div class="form-result-item">\
      <div class="title">\
        <span>아이디</span>\
      </div>\
      <div class="value">sniper45han@naver.com</div>\
    </div>\
  ')

  var validation = function (data) {
    if (pageType === 'pw') {
      if (data.user_name === '') {
        swal({
          title: '이름을 입력해주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            console.log('test')
            $inputUserName.focus()
          }, 50)
        })
      } else if (data.user_email === '') {
        swal({
          title: '이메일 주소를 입력해주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $inputUserEmail.focus()
          }, 50)
        })
      } else if (regexEmail.test(data.user_email) === false) {
        swal({
          title: '이메일 주소 형식이 올바르지 않습니다.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $inputUserEmail.focus()
          }, 50)
        })
      } else {
        loading(true)
        http.post('/api/user/find/pw', data)
          .finally(function () {
            loading(false)
          })
          .then(function (data) {
            swal({
              title: '새 비밀번호를 설정하세요!',
              text: '고객님이 작성하신 이메일 주소로\n새 비밀번호를 설정 할 수 있는 링크를 보내드렸습니다.',
              type: 'success'
            }, function () {
              location.href = '/user/login'
            })
          })
          .catch(function (error) {
            swal({
              title: error.value,
              type: 'warning'
            })
          })
      }
    } else {
      if (data.user_name === '') {
        swal({
          title: '이름을 입력해주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $inputUserName.focus()
          }, 50)
        })
      } else if (data.user_phone === '') {
        swal({
          title: '휴대폰 번호를 입력해주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $inputUserPhone.focus()
          }, 50)
        })
      } else if (regexPhone.test(data.user_phone) === false) {
        swal({
          title: '휴대폰 번호 형식이 올바르지 않습니다.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $inputUserPhone.focus()
          }, 50)
        })
      } else {
        loading(true)
        http.post('/api/user/find/id', data)
          .finally(function () {
            loading(false)
          })
          .then(function (data) {
            if (data.data.length < 1) {
              swal({
                title: '해당 정보의 사용자를 찾을 수 없습니다.',
                type: 'warning'
              })
            } else {
              $formFind.hide()
              $formResult.show()

              for (var idx in data.data) {
                var item = data.data[idx]
                var $formResultItem = $formResultItemTemplate.clone()
                $formResultItem.find('.value').text(item.user_id)
                $formResultItem.appendTo($formResult.find('.form-result-inner'))
                $formResultItem.bind('click', function (event) {
                  event.preventDefault()
                  location.href = '/user/login'
                })
              }
            }
          })
          .catch(function (error) {
            console.log(error)
            swal({
              title: error.value,
              type: 'warning'
            })
          })
      }
    }
  }

  $findItem.bind('click', function (event) {
    var $this = $(this)
    var link = $this.data('link')
    location.href = link
  })

  $formFind.bind('submit', function (event) {
    event.preventDefault()
  })

  $formFind.find('.complete').bind('click', function (event) {
    event.preventDefault()
    var data = $formFind.serializeJson()
    validation(data)
  })
})
