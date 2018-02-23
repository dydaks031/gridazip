$(function () {
  var portfolioID = $('#portfolio_id').val()
  var $portfolioAddress = $('#portfolio_address')
  var $portfolioSize = $('#portfolio_size')
  var $portfolioPrice = $('#portfolio_price')
  var $portfolioPrimaryPicture = $('#portfolio_primary_picture')
  var $portfolioTitle = $('#portfolio_title')
  var $portfolioDescription = $('#portfolio_description')
  var $portfolioBeforeAfterSection = $('#portfolio_before_after_section')
  var $portfolioBeforeAfterWrapper = $('#portfolio_before_after_wrapper')
  var $portfolioPdfViewer = $('#portfolio_pdf_viewer')
  var $portfolioProfile = $('#portfolio_profile')
  var $portfolioReceiptEmployee = $('.receipt-employee table tbody')
  var $portfolioReceiptResource = $('.receipt-resource table tbody')
  var $portfolioReceiptBrief = $('.receipt .brief')

  function ImageLoader (images, positions) {
    this.index = 0
    this.images = images
    this.positions = positions
    this.setImage()
    this.pointer()
  };

  ImageLoader.prototype.setIndex = function (index) {
    if (index < 0) {
      index = this.images.length - index + 1
    }

    index %= this.images.length

    this.index = index
  }

  ImageLoader.prototype.next = function () {
    this.setIndex(this.index + 1)
    this.setImage()
    this.pointer()
  }

  ImageLoader.prototype.prev = function () {
    this.setIndex(this.index - 1)
    this.setImage()
    this.pointer()
  }

  ImageLoader.prototype.setImage = function () {
    var image = this.images[this.index]
    $portfolioBeforeAfterWrapper.find('.col-before .picture').css('background-image', "url('" + image.pi_before + "')")
    $portfolioBeforeAfterWrapper.find('.col-after .picture').css('background-image', "url('" + image.pi_after + "')")
  }

  ImageLoader.prototype.pointer = function () {
    var image = this.images[this.index]
    var imageID = image.pi_pk

    var pointerMatch = this.positions.filter(function (v, i) {
      return v.pi_pos_pipk === imageID
    })

    pointerMatch.forEach(function (element, idx) {
      var $pointer = $('<div class="pointer" data-number="' + idx + '"></div>')
      $pointer.css({
        left: element.pi_pos_x + '%',
        top: element.pi_pos_y + '%'
      })
      $pointer.data('value', JSON.stringify(element))
      $pointer.appendTo($portfolioBeforeAfterWrapper.find('.col-screen .picture'))
      $pointer.text(parseInt(idx) + 1)
    })

    var $viewer = $('.resource-viewer')
    $portfolioBeforeAfterWrapper.find('.pointer').hover(
      function (event) {
        var $this = $(this)
        var value = $this.data('value')
        var valueObject = JSON.parse(value)

        $viewer.show()
        $viewer.find('.picture').css('background-image', "url('" + valueObject.rs_image + "')")
        $viewer.find('.row-name .value').text(valueObject.rs_code)
        $viewer.find('.row-comp .value').text(valueObject.cp_name)
        $viewer.find('.row-size .value').text(valueObject.rs_size_w + 'x' + valueObject.rs_size_h)
        $viewer.find('.row-price .value').text((valueObject.rs_price || 0).format())
        $viewer.find('.row-unit .value').text(valueObject.rs_area + '²')
      },
      function () {
        $viewer.hide()
      }
    ).bind('mousemove', function (event) {
      if ($viewer !== null) {
        var pos = {
          x: event.pageX + 10,
          y: event.pageY + 10
        }

        $viewer.css({
          left: pos.x,
          top: pos.y
        })
      }
    })
  }

  var loadPortfolio = function () {
    loading(true)
    http.post('/api/portfolio/' + portfolioID)
      .finally(function () {
        loading(false)
      })
      .then(function (data) {
        if (data.data === null) {
          swal({
            title: '포트폴리오가 존재하지 않습니다.',
            text: '포트폴리오가 도중에 삭제된 것 같습니다.',
            type: 'error',
            confirmButtonText: '뒤로가기'
          }, function () {
            location.href = '/portfolio'
          })
        } else {
          var portfolio = data.data
          var images = data.images
          var positions = data.positions
          var documents = data.documents
          var designerImages = data.designer_images
          var receiptEmployee = data.receipt.employee
          var receiptResource = data.receipt.resource

          $portfolioAddress.text(portfolio.pf_address)
          $portfolioSize.text(portfolio.pf_size)
          $portfolioPrice.text((portfolio.pf_price || 0).format())
          $portfolioTitle.text(portfolio.pf_title)
          $portfolioDescription.html(portfolio.pf_description.replace(/\n/g, '<br />'))

          $portfolioProfile.find('.picture').css('background-image', "url('" + portfolio.ds_image + "')")
          $portfolioProfile.find('.name .value').text(portfolio.ds_name)
          $portfolioProfile.find('.info-skill-communication').siblings('.info-skill-value').text(portfolio.ds_score_communication.toFixed(1))
          $portfolioProfile.find('.info-skill-timestrict').siblings('.info-skill-value').text(portfolio.ds_score_timestrict.toFixed(1))
          $portfolioProfile.find('.info-skill-quality').siblings('.info-skill-value').text(portfolio.ds_score_quality.toFixed(1))
          $portfolioProfile.find('.info-skill-communication .info-skill-score').html(Render.generateStar(portfolio.ds_score_communication))
          $portfolioProfile.find('.info-skill-timestrict .info-skill-score').html(Render.generateStar(portfolio.ds_score_timestrict))
          $portfolioProfile.find('.info-skill-quality .info-skill-score').html(Render.generateStar(portfolio.ds_score_quality))
          $portfolioProfile.find('.info-ext-address .textarea').text(portfolio.ds_address || '-')
          $portfolioProfile.find('.info-ext-style .textarea').text(portfolio.ds_style)
          $portfolioProfile.find('.info-ext-introduce .textarea').text(portfolio.ds_introduce)
          $portfolioProfile.find('.info-ext-price .textarea').text((portfolio.ds_price_min || 0).format() + ' ~ ' + (portfolio.ds_price_max || portfolio.ds_price_min || 0).format() + ' 만')

          if (documents.length > 0) {
            documents.forEach(function (element, idx) {
              var $documentImage = $('<div class="item pdf-viewer-image"></div>')
              $documentImage.append('<img src="' + element + '" />')
              $documentImage.appendTo($portfolioPdfViewer)
            })
          } else {
            $portfolioPdfViewer.closest('.section').remove()
          }

          designerImages.forEach(function (element, idx) {
            var $designerItem = $('<div class="item"></div>')
            $designerItem.css('background-image', "url('" + element.pi_after + "')")
            $designerItem.appendTo($portfolioProfile.find('.main .visual'))
          })

          var typePrice = {}

          var $beforePlace = null
          if (receiptEmployee.length > 0) {
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
              $tr.appendTo($portfolioReceiptEmployee)
            })
          } else {
            $portfolioReceiptEmployee.closest('.detail-group').remove()
          }

          var $beforeType = null
          if (receiptResource.length > 0) {
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
              $tr.appendTo($portfolioReceiptResource)
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
          } else {
            $portfolioReceiptResource.closest('.detail-group').remove()
          }

          var totalTypePrice = 0
          if (_.keys(typePrice).length > 0) {
            for (var idx in typePrice) {
              var item = typePrice[idx]
              totalTypePrice += item
              var $tr = $('<tr></tr>')
              $tr.append('<td class="left">' + idx + ' 비용' + '</td>')
              $tr.append('<td class="right">' + item.format() + '</td>')
              $tr.appendTo($portfolioReceiptBrief.find('tbody'))
            }
            $portfolioReceiptBrief.find('.total .pull-right').text(totalTypePrice.format())
          } else {
            $portfolioReceiptBrief.closest('.section-breif').remove()
          }

          $portfolioProfile.find('.main .visual').addClass('owl-carousel').owlCarousel({
            loop: true,
            items: 1,
            nav: true,
            dots: false,
            navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
          })

          $portfolioPdfViewer.addClass('owl-carousel').owlCarousel({
            loop: true,
            items: 1,
            nav: true,
            dots: false,
            navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
          })

          var primaryImage = images.filter(function (v, i) {
            return v.pi_is_primary === 'Y'
          })

          if (primaryImage.length < 1) {
            $portfolioPrimaryPicture.remove()
          } else {
            $portfolioPrimaryPicture.css('background-image', "url('" + primaryImage[0].pi_after + "')")
          }

          if (images.length < 1) {
            $portfolioBeforeAfterSection.remove()
          } else {
            var imageLoader = new ImageLoader(images, positions)
            $portfolioBeforeAfterWrapper.find('.resource-arrow.prev').bind('click', function (event) {
              event.preventDefault()
              imageLoader.prev()
            })
            $portfolioBeforeAfterWrapper.find('.resource-arrow.next').bind('click', function (event) {
              event.preventDefault()
              imageLoader.next()
            })
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

  loadPortfolio()

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
