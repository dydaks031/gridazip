$(function () {
  var $fullCalendar = $('.full-calendar')
  var $managePdfViewer = $('#manage_pdf_viewer')
  var $manageConstructor = $('#manage_constructor')
  var $manageReceiptEmployee = $('.receipt-employee table tbody')
  var $manageReceiptResource = $('.receipt-resource table tbody')
  var $manageReceiptBrief = $('.receipt .brief')
  var $manageWeekDayCalendar = $('#manage_week_day_calendar')
  var $manageConstructionDetail = $('#manage_construction_detail')

  var startWeekday = moment().startOf('week')
  var endWeekday = moment().endOf('week')

  for (var date = startWeekday.clone(); date.diff(endWeekday) <= 0; date.add(1, 'day')) {
    var $weekDay = $('<div class="weeks-day"></div>')
    $weekDay.text(date.format('MM/DD dd'))
    $weekDay.appendTo($manageWeekDayCalendar.find('.weeks-header'))
  }

  var loadWork = function () {
    loading(true)
    http.post('/api/manage')
      .finally(function () {
        loading(false)
      })
      .then(function (data) {
        if (data.work === null) {
          swal({
            title: '고객님이 진행중인 공사가 없습니다.',
            text: '먼저 `무료견적받기`에서 상담을 신청해주세요.',
            type: 'warning'
          }, function () {
            location.href = '/request'
          })
        } else {
          var documents = data.documents
          var schedules = data.schedules
          var receiptEmployee = data.receipt.employee
          var receiptResource = data.receipt.resource

          documents.forEach(function (element, idx) {
            var $documentImage = $('<div class="item pdf-viewer-image"></div>')
            $documentImage.append('<img src="' + element + '" />')
            $documentImage.appendTo($managePdfViewer)
          })

          var scheduleEvents = []

          var order = 0
          schedules.forEach(function (element, idx) {
            var passed = false
            var startDate = moment(element.ws_start_dt, 'YYYY-MM-DDTHH:mm:ss')
            var endDate = moment(element.ws_end_dt, 'YYYY-MM-DDTHH:mm:ss')

            for (var date = startWeekday.clone(), index = 0; date.diff(endWeekday) <= 0; date.add(1, 'day'), index++) {
              if (startDate.diff(date) <= 0 && endDate.diff(date) >= 0) {
                if (passed === false) {
                  passed = true
                  order++
                }
                var $weekEvent = $('<div class="weeks-event weeks-order-' + order + '"></div>')
                $weekEvent.text(element.rt_name + ' (' + element.rc_name + ')')
                $weekEvent.appendTo($manageWeekDayCalendar.find('.weeks-body .weeks-day:eq(' + index + ')'))
              }
            }

            scheduleEvents.push({
              id: idx,
              title: element.rt_name + ' (' + element.rc_name + ')',
              start: startDate.format('YYYY-MM-DD'),
              end: endDate.add(1, 'day').format('YYYY-MM-DD')
            })
          })

          $fullCalendar.fullCalendar({
            header: {
              left: null
            },
            eventLimit: true,
            height: 600,
            events: scheduleEvents
          })

          $managePdfViewer.addClass('owl-carousel').owlCarousel({
            loop: true,
            items: 1,
            nav: true,
            dots: false,
            navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
          })

          var typePrice = {}

          var $beforePlace = null
          receiptEmployee.forEach(function (element, idx) {
            var date = ''

            if (element.re_start_dt !== null) {
              date += moment(element.reg_start_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
            }

            if (element.re_end_dt !== null) {
              if (date !== '') {
                date += ' ~ ' + moment(element.re_end_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
              } else {
                date += moment(element.re_end_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
              }
            }

            var $tr = $('<tr></tr>')

            if (typeof typePrice[element.ct_type_name] === 'undefined') {
              typePrice[element.ct_type_name] = 0
            }
            typePrice[element.ct_type_name] += parseInt((element.ct_price || 0) * (element.re_amount || 0))

            if ($beforePlace === null || $beforePlace.text() !== element.re_place) {
              $beforePlace = $('<td>' + element.re_place + '</td>')
              $beforePlace.appendTo($tr)
            } else {
              var rowspan = $beforePlace.attr('rowspan') || 0
              rowspan += 1
              $beforePlace.attr('rowspan', rowspan)
            }

            $tr.append('<td class="disabled">' + element.ct_type_name + '</td>')
            $tr.append('<td>' + element.ct_name + '</td>')
            $tr.append('<td>' + element.re_amount + '</td>')
            $tr.append('<td class="right">&#8361; ' + (element.ct_price || 0).format() + '</td>')
            $tr.append('<td>' + element.ct_unit + '</td>')
            $tr.append('<td class="right">&#8361; ' + parseInt((element.ct_price || 0) * (element.re_amount || 0)).format() + '</td>')
            $tr.append('<td>' + date + '</td>')
            $tr.appendTo($manageReceiptEmployee)
          })

          var $beforeType = null
          receiptResource.forEach(function (element, idx) {
            var date = ''

            if (element.re_start_dt !== null) {
              date += moment(element.reg_start_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
            }

            if (element.re_end_dt !== null) {
              if (date !== '') {
                date += ' ~ ' + moment(element.re_end_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
              } else {
                date += moment(element.re_end_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
              }
            }

            var $tr = $('<tr></tr>')

            if (typeof typePrice[element.ct_type_name] === 'undefined') {
              typePrice[element.ct_type_name] = 0
            }
            typePrice[element.ct_type_name] += parseInt((element.rp_price || 0) * (element.rs_amount || 0))

            if ($beforeType === null || $beforeType.text() !== element.ct_type_name) {
              $beforeType = $('<td class="disabled">' + element.ct_type_name + '</td>')
              $beforeType.appendTo($tr)
            } else {
              var rowspan = $beforeType.attr('rowspan') || 0
              rowspan += 1
              $beforeType.attr('rowspan', rowspan)
            }

            $tr.append('<td class="no-padding"><a href="' + element.rs_image + '" class="magnific" target="_blank"><div class="picture" style="background-image: url(\"' + element.rs_image + '\");" /></a></td>')
            $tr.append('<td>' + element.rt_name + '</td>')
            $tr.append('<td>' + element.rc_name + '</td>')
            $tr.append('<td>' + element.rs_name + '</td>')
            $tr.append('<td>' + element.rs_amount + '</td>')
            $tr.append('<td>' + element.rp_name + '</td>')
            $tr.append('<td class="right">&#8361; ' + (element.rp_price || 0).format() + '</td>')
            $tr.append('<td class="right">&#8361; ' + parseInt((element.rp_price || 0) * (element.rs_amount || 0)).format() + '</td>')
            $tr.appendTo($manageReceiptResource)

            var imageMagnificPopup = function () {
              var $opener = $tr.find('.magnific')
              $opener.magnificPopup({
                items: {
                  src: element.rs_image
                },
                type: 'image',
                mainClass: 'mfp-with-zoom',
                zoom: {
                  enabled: true,
                  duration: 300,
                  easing: 'ease-in-out',
                  opener: function (opener) {
                    return $opener.find('.picture')
                  }
                }
              })
            }

            imageMagnificPopup()
          })

          var totalTypePrice = 0
          for (var idx in typePrice) {
            var item = typePrice[idx]
            totalTypePrice += item
            var $tr = $('<tr></tr>')
            $tr.append('<td class="left">' + idx + ' 비용' + '</td>')
            $tr.append('<td class="right">' + item.format() + '</td>')
            $tr.appendTo($manageReceiptBrief.find('tbody'))
          }
          $manageReceiptBrief.find('.total .pull-right').text(totalTypePrice.format())

          if (schedules.length < 1) {
            $manageConstructor.closest('.section').remove()
          } else {
            var scheduleItem = null
            var nextSchedule = schedules.filter(function (value, index) {
              return moment().diff(moment(value.ws_start_dt, 'YYYY-MM-DDTHH:mm:ss')) >= 0
            })

            if (nextSchedule > 0) {
              scheduleItem = nextSchedule[0]
            } else {
              schedules = _.sortBy(schedules, 'ws_start_dt').reverse()
              scheduleItem = schedules[0]
            }

            $manageConstructor.find('.manage-profile .picture').css('background-image', "url('" + scheduleItem.cr_image + "')")
            $manageConstructor.find('.manage-profile h3').text(scheduleItem.cr_name)
            $manageConstructor.find('.manage-profile-company .value').text(scheduleItem.cp_name)
            $manageConstructor.find('.manage-profile-address .value').text(scheduleItem.cr_address || '-')

            $manageConstructionDetail.find('.col-4 .manage-item:not(".manage-item-header")').remove()
            $manageConstructionDetail.find('.col-4.place').append('<div class="manage-item">' + scheduleItem.cp_name + '</div>')
            $manageConstructionDetail.find('.col-4.construction-type').append('<div class="manage-item">' + scheduleItem.ct_type_name + '</div>')
            $manageConstructionDetail.find('.col-4.resource').append('<div class="manage-item">' + scheduleItem.rs_name + '</div>')
          }
        }
      })
      .catch(function (error) {
        console.error(error)
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  loadWork()

  $('.btn-toggle-bar').bind('click', function (event) {
    event.preventDefault()
    var $this = $(this)
    if ($this.hasClass('active')) {
      $this.removeClass('active')
      $this.next().show()
      $this.find('span').text('상세 견적서 닫기')
      $this.find('i').addClass('fa-chevron-up').removeClass('fa-chevron-down')
    } else {
      $this.addClass('active')
      $this.next().hide()
      $this.find('span').text('상세 견적서 열기')
      $this.find('i').addClass('fa-chevron-down').removeClass('fa-chevron-up')
    }
  })
})
