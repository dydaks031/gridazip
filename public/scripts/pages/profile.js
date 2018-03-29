$(function () {
  var $document = $(document)
  var $profileType = $('#profile_type')
  var $profileWrapper = $('.profile-wrapper')
  var $profileSortTab = $('#profile_sort_tab')
  var profileType = $profileType.val()

  var page = new Pagination()
  var filter = new Filter()
  var commentPage = new Pagination()
  var qnaPage = new Pagination()
  page.setLimit(9)

  $profileSortTab.find('.tab-item').bind('click', function (event) {
    event.preventDefault()
    var $this = $(this)
    $this.addClass('active').siblings('.active').removeClass('active')

    var value = $this.data('value')
    filter.setFilter('sort', value === '' ? null : value)
    page.reset()
    page.setLimit(9)
    loadProfile()
  })

  var designerGridItemBind = function ($element) {
    $element.bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var id = $this.data('id')

      $('.profile-detail').remove()

      if ($this.hasClass('active')) {
        $this.removeClass('active')
      } else {
        $profileWrapper.find('.profile-detail').addClass('profile-detail-loading')
        $profileWrapper.find('.profile.active').removeClass('active')
        $this.addClass('active')

        var $profileDetail = $profileDetailTemplate.clone()
        $profileDetail.data('id', id)
        designerDetailBind($profileDetail)
        $profileDetail.insertAfter($this.closest('.profile-list'))
        $('html, body').stop().animate({
          scrollTop: $profileDetail.offset().top
        }, 600)
        commentPage.reset()
        commentPage.setLimit(5)
        loadComment(id, $profileDetail)

        http.post('/api/profile/designer/' + id)
          .finally(function () {
            $profileWrapper.find('.profile-detail').removeClass('profile-detail-loading')
          })
          .then(function (data) {
            var portfolio = data.portfolio

            if (portfolio.length < 1) {
              $profileDetail.find('.gallery-wrapper').remove()
            } else {
              portfolio.forEach(function (element, idx) {
                var $galleryItem = $galleryItemTemplate.clone()
                $galleryItem.find('.picture').css('background-image', "url('" + element.pi_after + "')")
                $galleryItem.find('.btn-document').data('pid', element.pf_pk)
                $galleryItem.find('.btn-document').data('portfolio', JSON.stringify(element))
                designerDocumentBind($galleryItem.find('.btn-document'))
                $galleryItem.appendTo($profileDetail.find('.gallery-list'))
              })
            }
          })
          .catch(function (error) {
            swal({
              title: error.value,
              type: 'error'
            })
          })
      }
    })
  }

  var designerDetailBind = function ($element) {
    var $comment = $element.find('.comment')
    var id = $element.data('id')

    $element.find('.btn-toggle-bar').bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      $this.closest('.profile-detail').remove()
      $profileWrapper.find('.profile.active').removeClass('active')
    })

    $element.find('.comment .comment-tab .comment-tab-item').bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var type = $this.data('type')
      $this.addClass('active').siblings('.active').removeClass('active')

      if (type === 'qna') {
        qnaPage.reset()
        qnaPage.setLimit(5)
        loadQna(id, $comment)
      } else {
        commentPage.reset()
        commentPage.setLimit(5)
        loadComment(id, $comment)
      }
    })
  }

  var designerDocumentBind = function ($element) {
    $element.bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var portfolioID = $this.data('pid')
      var portfolioInfo = JSON.parse($this.data('portfolio'))
      $this.closest('.gallery-wrapper').siblings('.gallery-wrapper').remove()
      var $profilePortfolio = $profilePortfolioTemplate.clone()
      $profilePortfolio.insertAfter($this.closest('.gallery-wrapper'))

      http.post('/api/profile/designer/document/' + portfolioID)
        .finally(function () {
          $profilePortfolio.removeClass('gallery-wrapper-loading')
        })
        .then(function (data) {
          var documents = data.documents
          var images = data.images

          $profilePortfolio.find('.gallery-info-price .value').text((portfolioInfo.pf_price || 0).format() + ' 만원')
          $profilePortfolio.find('.gallery-info-address .value').text(portfolioInfo.pf_address)
          $profilePortfolio.find('.gallery-info-size .value').text(portfolioInfo.pf_size + ' 평')

          images.forEach(function (element, idx) {
            var $galleryItemSimple = $galleryItemSimpleTemplate.clone()
            $galleryItemSimple.find('.picture').css('background-image', "url('" + element.pi_after + "')")
            $galleryItemSimple.appendTo($profilePortfolio.find('.gallery-list'))
          })

          documents.forEach(function (element, idx) {
            var $documentItem = $('<div class="pdf-viewer-image"></div>')
            $documentItem.append('<img src="' + element + '" />')
            $documentItem.appendTo($profilePortfolio.find('.pdf-viewer'))
          })

          $profilePortfolio.find('.pdf-viewer').addClass('owl-carousel').owlCarousel({
            loop: true,
            items: 1,
            nav: true,
            dots: false,
            navText: ['<i class="pe-7s-angle-left"></i>', '<i class="pe-7s-angle-right"></i>']
          })
        })
        .catch(function (error) {
          swal({
            title: error.value,
            type: 'error'
          })
        })
    })
  }

  var commentInputBind = function ($element) {
    var $comment = $element.closest('.comment')
    var channel = $comment.data('channel')
    var id = $comment.data('id')
    $element.find('.comment-submit').bind('click', function (event) {
      event.preventDefault()
      var score = $element.find('.comment-input-score .comment-star-rate').data('value')
      var text = $element.find('#user_comment').val()

      if (text.length < 10) {
        swal({
          title: '코맨트는 10자 이상으로 적어주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $element.find('#user_comment').focus()
          }, 50)
        })
      } else {
        loading(true)
        http.post('/api/comment/save/' + channel + '/' + id, {
          score: score,
          text: text
        })
          .finally(function () {
            loading(false)
          })
          .then(function (data) {
            commentPage.reset()
            commentPage.setLimit(5)
            loadComment(id, $comment)
          })
          .catch(function (error) {
            swal({
              title: error.value,
              type: 'error'
            })
          })
      }
    })
    commentStarBind($element.find('.comment-input-score .comment-star-rate'))
  }

  var qnaItemBind = function (id, $element) {
    $element.bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var $comment = $this.closest('.comment')
      var channel = $comment.data('channel')

      loading(true)
      http.post('/api/qna/answer/' + channel + '/' + id)
        .finally(function () {
          loading(false)
        })
        .then(function (data) {
          if ($element.next().hasClass('comment-qna-answer-type')) {
            $element.next().remove()
          }

          var $qnaAnswerBox = $qnaAnswerBoxTemplate.clone()

          if (data.data !== null) {
            var answer = data.data
            $qnaAnswerBox.find('.label').text('답변')
            $qnaAnswerBox.find('.date').text(moment(answer.qna_answer_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'))
            $qnaAnswerBox.find('.comment-description').html(answer.qna_answer_description.replace(/\n/g, '<br />'))
          } else {
            $qnaAnswerBox.addClass('comment-box-empty center')
            $qnaAnswerBox.find('.comment-header').remove()
            $qnaAnswerBox.find('.comment-description').text('답변 내용이 없습니다.')
          }
          $qnaAnswerBox.insertAfter($element)
        })
        .catch(function (error) {
          swal({
            title: error.value,
            type: 'error'
          })
        })
    })
  }

  var qnaInputBind = function ($element) {
    var $comment = $element.closest('.comment')
    var channel = $comment.data('channel')
    var id = $comment.data('id')
    $element.find('.comment-submit').bind('click', function (event) {
      event.preventDefault()
      var text = $element.find('#user_comment').val()

      if (text.length < 10) {
        swal({
          title: '질문을 10자 이상으로 적어주세요.',
          type: 'warning'
        }, function () {
          setTimeout(function () {
            $element.find('#user_comment').focus()
          }, 50)
        })
      } else {
        loading(true)
        http.post('/api/qna/save/' + channel + '/' + id, {
          text: text
        })
          .finally(function () {
            loading(false)
          })
          .then(function (data) {
            qnaPage.reset()
            qnaPage.setLimit(5)
            loadQna(id, $comment)
          })
          .catch(function (error) {
            swal({
              title: error.value,
              type: 'error'
            })
          })
      }
    })
    commentStarBind($element.find('.comment-input-score .comment-star-rate'))
  }

  var commentStarBind = function ($element) {
    var closeDropdown = function () {
      $('.dropdown-star').remove()
      $document.unbind('click.starHandler')
    }

    $element.bind('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      var $this = $(this)
      var offset = $this.offset()
      var fixedOffset = {
        top: 4
      }

      closeDropdown()

      var $commentStarDropdown = $commentStarDropdownTemplate.clone()
      $commentStarDropdown.find('.dropdown-star-item').bind('click', function (event) {
        event.preventDefault()
        event.stopPropagation()
        var $this = $(this)
        var value = $this.data('value')
        closeDropdown()
        $element.find('.star').html(Render.generateStar(value))
        $element.find('.value').text(value)
        $element.data('value', value)
      })
      $commentStarDropdown.appendTo($('body'))

      var pos = {
        left: offset.left + (($this.outerWidth() - $commentStarDropdown.outerWidth()) / 2),
        top: offset.top + $this.outerHeight() + fixedOffset.top
      }

      $commentStarDropdown.css({
        left: pos.left,
        top: pos.top
      })

      $document.unbind('click.starHandler').bind('click.starHandler', function () {
        closeDropdown()
      })
    })
  }

  var commentPaginationBind = function ($element, callback) {
    $element.find('a').bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var index = $this.data('index')
      commentPage.setIndex(index)
      callback()
    })
  }

  var qnaPaginationBind = function ($element, callback) {
    $element.find('a').bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var index = $this.data('index')
      qnaPage.setIndex(index)
      callback()
    })
  }

  var $designerGridItemTemplate = $('\
    <div class="profile">\
      <div class="picture">\
        <div class="name">\
          <span>디자이너</span>\
          <span class="value"></span>\
        </div>\
      </div>\
      <div class="info">\
        <div class="info-group">\
          <div class="info-skill-group">\
            <div class="info-skill-detail info-skill-communication">\
              <div class="info-skill-name">커뮤니케이션</div>\
              <div class="info-skill-score">\
              </div>\
            </div>\
            <div class="info-skill-value"></div>\
          </div>\
          <div class="info-skill-group">\
            <div class="info-skill-detail info-skill-timestrict">\
              <div class="info-skill-name">시간엄수</div>\
              <div class="info-skill-score">\
              </div>\
            </div>\
            <div class="info-skill-value"></div>\
          </div>\
          <div class="info-skill-group">\
            <div class="info-skill-detail info-skill-quality">\
              <div class="info-skill-name">디자인 완성도</div>\
              <div class="info-skill-score">\
              </div>\
            </div>\
            <div class="info-skill-value"></div>\
          </div>\
        </div>\
        <div class="info-group">\
          <div class="info-ext-group info-ext-style">\
            <div class="title">스타일</div>\
            <div class="textarea"></div>\
          </div>\
          <div class="info-ext-group info-ext-introduce">\
            <div class="title">자기소개</div>\
            <div class="textarea"></div>\
          </div>\
          <div class="info-ext-group info-ext-price">\
            <div class="title">디자인 비용</div>\
            <div class="textarea"></div>\
          </div>\
        </div>\
      </div>\
    </div>\
  ')
  var $constructorGridItemTemplate = $('\
    <div class="profile">\
      <div class="picture">\
        <div class="name">\
          <span style="margin-right: 10px;">\
            <span class="company"></span>\
            <span>기사</span>\
          </span>\
          <span class="value">한오교</span>\
        </div>\
      </div>\
      <div class="info">\
        <div class="info-group">\
          <div class="info-skill-group">\
            <div class="info-skill-detail">\
              <div class="info-skill-name">시공자평가</div>\
              <div class="info-skill-score">\
              </div>\
            </div>\
            <div class="info-skill-value"></div>\
          </div>\
        </div>\
      </div>\
    </div>\
  ')
  var $galleryItemTemplate = $('\
    <div class="gallery-item">\
      <div class="picture"></div>\
      <a href="#" class="btn btn-primary btn-document">제안서 보기</a>\
    </div>\
  ')
  var $galleryItemSimpleTemplate = $('\
    <div class="gallery-item">\
      <div class="picture"></div>\
    </div>\
  ')
  var $profileDetailTemplate = $('\
    <div class="profile-detail profile-detail-loading" style="background-color: #e9e9e9;">\
      <a href="#" class="btn-toggle-bar">\
        <span>디자이너 상세정보 닫기</span>\
        <i class="fa fa-chevron-up"></i>\
      </a>\
      <div class="section">\
        <div class="article no-padding-bottom gallery-wrapper">\
          <h3>시공사례</h3>\
          <div class="loader-section">\
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
          </div>\
          <div class="gallery-list">\
          </div>\
        </div>\
        <div class="section margin-top">\
          <div class="comment">\
            <div class="comment-tab">\
              <a href="#" class="comment-tab-item active" data-type="review">리뷰</a>\
              <a href="#" class="comment-tab-item" data-type="qna">문의/답변</a>\
            </div>\
            <div class="comment-boxes">\
              <div class="comment-box">\
                <div class="comment-header">\
                  <div class="date"></div>\
                  <div class="rate">\
                    <span class="star">\
                    </span>\
                    <span class="score"></span>\
                  </div>\
                </div>\
                <p></p>\
              </div>\
            </div>\
            <div class="margin-top">\
              <div class="pagination pagination-comment"></div>\
            </div>\
          </div>\
        </div>\
      </div>\
    </div>\
  ')
  var $profilePortfolioTemplate = $('\
    <div class="gallery-wrapper gallery-wrapper-loading margin-top">\
      <h2>디자인 제안서</h2>\
      <div class="loader-section">\
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
      </div>\
      <div class="article no-padding-bottom">\
        <div class="gallery-info">\
          <div class="gallery-info-item gallery-info-price">\
            <div class="title">비용</div>\
            <div class="value"></div>\
          </div>\
          <div class="gallery-info-item gallery-info-address">\
            <div class="title">위치</div>\
            <div class="value"></div>\
          </div>\
          <div class="gallery-info-item gallery-info-size">\
            <div class="title">평수</div>\
            <div class="value"></div>\
          </div>\
        </div>\
        <div class="gallery-list">\
        </div>\
        <div class="pdf-viewer">\
        </div>\
      </div>\
    </div>\
  ')
  var $commentBoxTemplate = $('\
    <div class="comment-box">\
      <div class="comment-header">\
        <div class="date"></div>\
        <div class="rate">\
          <span class="star">\
          </span>\
          <span class="score"></span>\
        </div>\
      </div>\
      <p class="comment-description"></p>\
    </div>\
  ')
  var $qnaBoxTemplate = $('\
    <div class="comment-box comment-qna-type">\
      <div class="comment-header">\
        <div class="label"></div>\
        <div class="date"></div>\
      </div>\
      <p class="comment-description"></p>\
    </div>\
  ')
  var $qnaAnswerBoxTemplate = $('\
    <div class="comment-box comment-qna-answer-type">\
      <div class="comment-header">\
        <div class="label label-primary"></div>\
        <div class="date"></div>\
      </div>\
      <p class="comment-description"></p>\
    </div>\
  ')
  var $commentBoxInputTemplate = $('\
    <div class="comment-box comment-input">\
      <div class="comment-layout">\
        <div class="comment-input-inner">\
          <div class="comment-input-score">\
            <strong>디자이너 서비스에 얼마나 만족하셨나요?</strong>\
            <span id="user_score" class="comment-star-rate" data-value="0">\
              <span class="star">\
                <i class="fa fa-star"></i>\
                <i class="fa fa-star"></i>\
                <i class="fa fa-star"></i>\
                <i class="fa fa-star"></i>\
                <i class="fa fa-star"></i>\
              </span>\
              <span class="value">0</span>\
              <i class="fa fa-angle-down"></i>\
            </span>\
          </div>\
          <textarea id="user_comment" placeholder="리뷰를 남겨 주세요!"></textarea>\
        </div>\
        <a href="#" class="comment-submit">작성</a>\
      </div>\
    </div>\
  ')
  var $qnaBoxInputTemplate = $('\
    <div class="comment-box comment-input">\
      <div class="comment-layout">\
        <div class="comment-input-inner">\
          <div class="comment-input-score">\
            <strong>궁금한 점을 물어보세요!</strong>\
          </div>\
          <textarea id="user_comment" placeholder="질문을 남겨 주세요!"></textarea>\
        </div>\
        <a href="#" class="comment-submit">작성</a>\
      </div>\
    </div>\
  ')
  var $commentStarDropdownTemplate = $('\
    <div class="dropdown-star">\
      <a href="#" class="dropdown-star-item" data-value="0">\
        <span class="star">\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
        </span>\
        <span class="value">0</span>\
      </a>\
      <a href="#" class="dropdown-star-item" data-value="1">\
        <span class="star">\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
        </span>\
        <span class="value">1</span>\
      </a>\
      <a href="#" class="dropdown-star-item" data-value="2">\
        <span class="star">\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
        </span>\
        <span class="value">2</span>\
      </a>\
      <a href="#" class="dropdown-star-item" data-value="3">\
        <span class="star">\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star"></i>\
          <i class="fa fa-star"></i>\
        </span>\
        <span class="value">3</span>\
      </a>\
      <a href="#" class="dropdown-star-item" data-value="4">\
        <span class="star">\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star"></i>\
        </span>\
        <span class="value">4</span>\
      </a>\
      <a href="#" class="dropdown-star-item" data-value="5">\
        <span class="star">\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
          <i class="fa fa-star active"></i>\
        </span>\
        <span class="value">5</span>\
      </a>\
  ')
  var $profileListTemplate = $('<div class="profile-list"></div>')

  loading(true)

  var loadProfile = function () {
    if (profileType === 'designer') {
      http.post('/api/profile/designer', {
        page: page.get(),
        filter: filter.get()
      })
        .finally(function () {
          loading(false)
        })
        .then(function (data) {
          page.get(data.page)
          $profileWrapper.empty()

          var $profileList

          data.data.forEach(function (element, idx) {
            var index = parseInt(idx)

            if (index % 3 === 0) {
              $profileList = $profileListTemplate.clone()
              $profileList.appendTo($profileWrapper)
            }

            var $designerGridItem = $designerGridItemTemplate.clone()
            $designerGridItem.data('id', element.ds_pk)
            $designerGridItem.find('.picture').css('background-image', "url('" + element.ds_image + "')")
            $designerGridItem.find('.name .value').text(element.ds_name)
            $designerGridItem.find('.info-skill-communication').siblings('.info-skill-value').text(element.ds_score_communication.toFixed(1))
            $designerGridItem.find('.info-skill-timestrict').siblings('.info-skill-value').text(element.ds_score_timestrict.toFixed(1))
            $designerGridItem.find('.info-skill-quality').siblings('.info-skill-value').text(element.ds_score_quality.toFixed(1))
            $designerGridItem.find('.info-skill-communication .info-skill-score').html(Render.generateStar(element.ds_score_communication))
            $designerGridItem.find('.info-skill-timestrict .info-skill-score').html(Render.generateStar(element.ds_score_timestrict))
            $designerGridItem.find('.info-skill-quality .info-skill-score').html(Render.generateStar(element.ds_score_quality))
            $designerGridItem.find('.info-ext-address .textarea').text(element.ds_address || '-')
            $designerGridItem.find('.info-ext-style .textarea').text(element.ds_style)
            $designerGridItem.find('.info-ext-introduce .textarea').text(element.ds_introduce || '-')
            $designerGridItem.find('.info-ext-price .textarea').text((element.ds_price_min || 0).format() + ' ~ ' + (element.ds_price_max || element.ds_price_min || 0).format() + ' 만')
            $designerGridItem.appendTo($profileList)
            designerGridItemBind($designerGridItem)
          })
        })
        .catch(function (error) {
          swal({
            title: error.value,
            type: 'error'
          })
        })
    } else {
      http.post('/api/profile/constructor', {
        page: page.get(),
        filter: filter.get()
      })
        .finally(function () {
          loading(false)
        })
        .then(function (data) {
          page.get(data.page)
          $profileWrapper.empty()

          var $profileList

          data.data.forEach(function (element, idx) {
            var index = parseInt(idx)

            if (index % 3 === 0) {
              $profileList = $profileListTemplate.clone()
              $profileList.appendTo($profileWrapper)
            }

            var $constructorGridItem = $constructorGridItemTemplate.clone()
            $constructorGridItem.data('id', element.cr_pk)
            $constructorGridItem.find('.picture').css('background-image', "url('" + element.cr_image + "')")
            $constructorGridItem.find('.name .company').text(element.cr_comp)
            $constructorGridItem.find('.name .value').text(element.cr_name)
            $constructorGridItem.find('.info-skill-detail .info-skill-score').html(Render.generateStar(element.cr_score))
            $constructorGridItem.find('.info-skill-value').text(element.cr_score.toFixed(1))
            $constructorGridItem.find('.info-ext-address .textarea').text(element.cr_address || '-')
            $constructorGridItem.appendTo($profileList)
          })
        })
        .catch(function (error) {
          swal({
            title: error.value,
            type: 'error'
          })
        })
    }
  }

  var loadComment = function (id, $element) {
    $element.find('.comment').data('channel', 'designer')
    $element.find('.comment').data('id', id)

    http.post('/api/comment/designer/' + id, {
      page: commentPage.get()
    })
      .then(function (data) {
        commentPage.set(data.page)

        $element.find('.comment-boxes').empty()
        if (data.data.length < 1) {
          var $commentBox = $commentBoxTemplate.clone()
          $commentBox.addClass('comment-box-empty center').text('리뷰가 없습니다.')
          $commentBox.appendTo($element.find('.comment-boxes'))
        } else {
          data.data.forEach(function (element, idx) {
            var $commentBox = $commentBoxTemplate.clone()
            $commentBox.find('.date').text(moment(element.ct_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'))
            $commentBox.find('.rate .score').text(element.ct_score)
            $commentBox.find('.rate .star').html(Render.generateStar(element.ct_score))
            $commentBox.find('.comment-description').html(element.ct_description.replace(/\n/g, '<br />'))
            $commentBox.appendTo($element.find('.comment-boxes'))
          })
        }

        if (user !== null) {
          var $commentInput = $commentBoxInputTemplate.clone()
          $commentInput.appendTo($element.find('.comment-boxes'))
          commentInputBind($commentInput)
        }

        var $commentPagination = $element.find('.pagination.pagination-comment')
        $commentPagination.html(commentPage.getHtml())
        commentPaginationBind($commentPagination, function () {
          loadComment(id, $element)
        })
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  var loadQna = function (id, $element) {
    $element.find('.comment').data('channel', 'designer')
    $element.find('.comment').data('id', id)

    http.post('/api/qna/designer/' + id, {
      page: qnaPage.get()
    })
      .then(function (data) {
        qnaPage.set(data.page)

        $element.find('.comment-boxes').empty()
        if (data.data.length < 1) {
          var $qnaBox = $qnaBoxTemplate.clone()
          $qnaBox.addClass('comment-box-empty center').text('질문/답변이 없습니다.')
          $qnaBox.appendTo($element.find('.comment-boxes'))
        } else {
          data.data.forEach(function (element, idx) {
            var $qnaBox = $qnaBoxTemplate.clone()
            $qnaBox.find('.label').text('질문')
            $qnaBox.find('.date').text(moment(element.qna_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'))
            $qnaBox.find('.comment-description').html(element.qna_description.replace(/\n/g, '<br />'))
            qnaItemBind(element.qna_pk, $qnaBox)
            $qnaBox.appendTo($element.find('.comment-boxes'))
          })
        }

        if (user !== null) {
          var $qnaBoxInput = $qnaBoxInputTemplate.clone()
          $qnaBoxInput.appendTo($element.find('.comment-boxes'))
          qnaInputBind($qnaBoxInput)
        }

        var $commentPagination = $element.find('.pagination.pagination-comment')
        $commentPagination.html(qnaPage.getHtml())
        qnaPaginationBind($commentPagination, function () {
          loadQna(id, $element)
        })
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }

  loadProfile()
})
