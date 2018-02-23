$(function () {
  var $visual = $('.main-visual')
  var $geoSection = $('.section.section-geo')

  /*
    $window.bind('scroll.geo', function (event) {
        var scrollTop = $window.scrollTop();
        var scrollBottom = scrollTop + $window.outerHeight();
        var targetTop = $geoSection.offset().top;
        var targetBottom = targetTop + $geoSection.outerHeight();

        if (
            (scrollTop > targetTop && scrollTop < targetBottom) ||
            (scrollBottom > targetTop && scrollBottom < targetBottom)
        ) {
            $geoWrapper.addClass('active');
            $geoPointer.addClass('active');
        }
    }).triggerHandler('scroll.geo');
    */

  $visual.find('h1').addClass('active')
  setTimeout(function () {
    $visual.find('h2').addClass('active')
    setTimeout(function () {
      $visual.find('.btn').addClass('active')
    }, 800)
  }, 800)

  // eslint-disable-next-line new-cap
  var mainModal1 = new tingle.modal({
    footer: false,
    closeLabel: '닫기',
    closeMethods: ['overlay', 'button', 'escape'],
    cssClass: ['modal-report', 'modal-report-01']
  })

  // eslint-disable-next-line new-cap
  var mainModal2 = new tingle.modal({
    footer: false,
    closeLabel: '닫기',
    closeMethods: ['overlay', 'button', 'escape'],
    cssClass: ['modal-report', 'modal-report-02']
  })

  // eslint-disable-next-line new-cap
  var mainModal3 = new tingle.modal({
    footer: false,
    closeLabel: '닫기',
    closeMethods: ['overlay', 'button', 'escape'],
    cssClass: ['modal-report', 'modal-report-03']
  })

  var mainModalContent1 = '<h1>내 집 상태 보고서</h1>' +
    '<div class="modal-content">' +
    '  <div class="tab-container">' +
    '    <div class="tab-header">' +
    '      <a href="#" class="active">방음정도</a>' +
    '      <a href="#">단열정도</a>' +
    '      <a href="#">친환경정도</a>' +
    '    </div>' +
    '    <div class="tab-content">' +
    '      <div class="tab-item active">' +
    '        <div class="status-report">' +
    '          <div class="picture report-01"></div>' +
    '          <h2>' +
    '            <span>보수 필요 구역</span>' +
    '          </h2>' +
    '          <div class="detail">' +
    '            <div class="col-group">' +
    '              <div class="col-4 item-01">' +
    '                <div class="detail-picture" style="background-image: url(\"/images/temporary/bg-status-report-detail-01.jpg\");"></div>' +
  '                <h3>1. 주방</h3>' +
  '                <div class="detail-description">' +
  '                  주방 벽 부분에 틈이 있어서<br />' +
  '                  벌어진 부분이 확인되었습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-02">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-02.jpg\");"></div>' +
  '                <h3>2. 말발굽</h3>' +
  '                <div class="detail-description">' +
  '                  말발굽이 낡아<br />' +
  '                  현관문이 제대로 고정되지 않습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-03">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-03.jpg\");"></div>' +
  '                <h3>3. 수건걸이</h3>' +
  '                <div class="detail-description">' +
  '                  수건걸이 고정마감이<br />' +
  '                  제대로 되지 않아<br />' +
  '                  타일 안으로 빈 틈이 보입니다.' +
  '                </div>' +
  '              </div>' +
  '            </div>' +
  '          </div>' +
  '        </div>' +
  '        <div class="description">' +
  '          <ul>' +
  '            <li>내 집 상태 보고서’를 통해 고객님께서는 공사 하기 전 단열, 방음, 친환경, 마감 상태를 평균치와 비교분석 해 공사가 필요한 부분을 확인하실 수 있습니다.</li>' +
  '            <li>뿐만 아니라 공사가 끝난 뒤에도 다시 한 번 상태를 점검해 실제로 얼마나 집 상태가 나아지셨는지 수치를 통해 확인하실 수 있습니다.</li>' +
  '          </ul>' +
  '        </div>' +
  '      </div>' +
  '      <div class="tab-item">' +
  '        <div class="status-report">' +
  '          <div class="picture report-02"></div>' +
  '          <h2>' +
  '            <span>보수 필요 구역</span>' +
  '          </h2>' +
  '          <div class="detail">' +
  '            <div class="col-group">' +
  '              <div class="col-4 item-01">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-01.jpg\");"></div>' +
  '                <h3>1. 주방</h3>' +
  '                <div class="detail-description">' +
  '                  주방 벽 부분에 틈이 있어서<br />' +
  '                  벌어진 부분이 확인되었습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-02">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-02.jpg\");"></div>' +
  '                <h3>2. 말발굽</h3>' +
  '                <div class="detail-description">' +
  '                  말발굽이 낡아<br />' +
  '                  현관문이 제대로 고정되지 않습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-03">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-03.jpg\");"></div>' +
  '                <h3>3. 수건걸이</h3>' +
  '                <div class="detail-description">' +
  '                  수건걸이 고정마감이<br />' +
  '                  제대로 되지 않아<br />' +
  '                  타일 안으로 빈 틈이 보입니다.' +
  '                </div>' +
  '              </div>' +
  '            </div>' +
  '          </div>' +
  '        </div>' +
  '        <div class="description">' +
  '          <ul>' +
  '            <li>내 집 상태 보고서’를 통해 고객님께서는 공사 하기 전 단열, 방음, 친환경, 마감 상태를 평균치와 비교분석 해 공사가 필요한 부분을 확인하실 수 있습니다.</li>' +
  '            <li>뿐만 아니라 공사가 끝난 뒤에도 다시 한 번 상태를 점검해 실제로 얼마나 집 상태가 나아지셨는지 수치를 통해 확인하실 수 있습니다.</li>' +
  '          </ul>' +
  '        </div>' +
  '      </div>' +
  '      <div class="tab-item">' +
  '        <div class="status-report">' +
  '          <div class="picture report-03"></div>' +
  '          <h2>' +
  '            <span>보수 필요 구역</span>' +
  '          </h2>' +
  '          <div class="detail">' +
  '            <div class="col-group">' +
  '              <div class="col-4 item-01">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-01.jpg\");"></div>' +
  '                <h3>1. 주방</h3>' +
  '                <div class="detail-description">' +
  '                  주방 벽 부분에 틈이 있어서<br />' +
  '                  벌어진 부분이 확인되었습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-02">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-02.jpg\");"></div>' +
  '                <h3>2. 말발굽</h3>' +
  '                <div class="detail-description">' +
  '                  말발굽이 낡아<br />' +
  '                  현관문이 제대로 고정되지 않습니다.' +
  '                </div>' +
  '              </div>' +
  '              <div class="col-4 item-03">' +
  '                <div class="detail-picture" style="background-image: url(\"images/temporary/bg-status-report-detail-03.jpg\");"></div>' +
  '                <h3>3. 수건걸이</h3>' +
  '                <div class="detail-description">' +
  '                  수건걸이 고정마감이<br />' +
  '                  제대로 되지 않아<br />' +
  '                  타일 안으로 빈 틈이 보입니다.' +
  '                </div>' +
  '              </div>' +
  '            </div>' +
  '          </div>' +
  '        </div>' +
  '        <div class="description">' +
  '          <ul>' +
  '            <li>내 집 상태 보고서’를 통해 고객님께서는 공사 하기 전 단열, 방음, 친환경, 마감 상태를 평균치와 비교분석 해 공사가 필요한 부분을 확인하실 수 있습니다.</li>' +
  '            <li>뿐만 아니라 공사가 끝난 뒤에도 다시 한 번 상태를 점검해 실제로 얼마나 집 상태가 나아지셨는지 수치를 통해 확인하실 수 있습니다.</li>' +
  '          </ul>' +
  '        </div>' +
  '      </div>' +
  '    </div>' +
  '  </div>' +
  '</div>'

  var mainModalContent2 =
    '<h1>자동 견적 시스템</h1>' +
    '<div class="modal-content">' +
    '  <div class="request-form">' +
    '    <div class="col-group">' +
    '      <div class="col-4">' +
    '        <div class="title">구역선택</div>' +
    '        <div class="category">' +
    '          <a href="#">거실</a>' +
    '          <a href="#">부엌</a>' +
    '          <a href="#" class="active">아이방</a>' +
    '          <a href="#">베란다</a>' +
    '          <a href="#">안방</a>' +
    '          <a href="#">욕실</a>' +
    '          <a href="#">드레스룸</a>' +
    '          <a href="#">창고</a>' +
    '        </div>' +
    '      </div>' +
    '      <div class="col-8">' +
    '        <div class="structure-design"></div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="request-group">' +
    '      <div class="col-group">' +
    '        <div class="col-4">' +
    '          <div class="title">공사선택</div>' +
    '        </div>' +
    '        <div class="col-8">' +
    '          <div class="sub-title">' +
    '            <span>공간변형을 선택하셨습니다.</span>' +
    '            <span class="progress-wrapper">' +
    '              <span class="progress">' +
    '                <span class="progress-inner" style="width: 20%;"></span>' +
    '              </span>' +
    '              <span class="label">20%</span>' +
    '            </span>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '      <div class="choices">' +
    '        <div class="choice-item">' +
    '          <a href="#" class="active">공간변형</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">벽</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">바닥</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">창호</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">천장</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">가구</a>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="request-group">' +
    '      <div class="col-group">' +
    '        <div class="col-4">' +
    '          <div class="title">공간변형</div>' +
    '        </div>' +
    '        <div class="col-8">' +
    '          <div class="sub-title">' +
    '            <span>확장을 선택하셨습니다.</span>' +
    '            <span class="progress-wrapper">' +
    '              <span class="progress">' +
    '                <span class="progress-inner" style="width: 40%;"></span>' +
    '              </span>' +
    '              <span class="label">40%</span>' +
    '            </span>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '      <div class="choices">' +
    '        <div class="choice-item">' +
    '          <a href="#" class="active">확장</a>' +
    '        </div>' +
    '        <div class="choice-item">' +
    '          <a href="#">가벽설치</a>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="description">' +
    '    <ul>' +
    '      <li>자동견적시스템은 견적을 사람이 내지 않고 그리다집 가격정책에 따라 디자인에 맞는 견적이 자동으로 나오는 서비스입니다.</li>' +
    '      <li>고객님은 이 시스템을 통해 거품끼지 않은 정찰제의 가격을 통해 인테리어를 진행하실 수 있습니다.</li>' +
    '      <li>그 뿐만 아니라 인테리어에 사용되는 모든 자재의 단가와 수량을 확인하실 수 있습니다.</li>' +
    '    </ul>' +
    '  </div>' +
    '</div>'

  var mainModalContent3 =
    '<h1>3D 디자인</h1>' +
    '<div class="modal-content">' +
    '  <div class="report-3d">' +
    '    <div class="picture" style="background-image: url(\"/images/temporary/bg-main-modal-layer-3d-report.png\");"></div>' +
    '  </div>' +
    '  <div class="description">' +
    '    <ul>' +
    '      <li>인테리어 전문 디자이너가 고객님의 집을 2주~3주간의 상담을 통해 디자인 제안서를 작성해드립니다.</li>' +
    '      <li>색체, 조명, 형태, 공간활용 등 고객님께서 고민하시는 부분을 시각적으로 확인하실 수 있습니다.</li>' +
    '    </ul>' +
    '  </div>' +
    '</div>'

  var tabInit = function ($container) {
    var $tabContainer = $container.find('.tab-container')

    $tabContainer.find('.tab-header a').bind('click', function (event) {
      event.preventDefault()
      var $this = $(this)
      var index = $this.index()
      $this.addClass('active').siblings('.active').removeClass('active')
      $tabContainer.find('.tab-content .tab-item').eq(index).addClass('active').siblings('.active').removeClass('active')
    })
  }

  mainModal1.setContent(mainModalContent1)
  mainModal2.setContent(mainModalContent2)
  mainModal3.setContent(mainModalContent3)

  var mainModal1Open = function () {
    $(mainModal1.modalBoxContent).find('a').bind('click', function (event) {
      event.preventDefault()
    })
    var mainModalClass = '.modal-report-01'
    mainModal1.open()
    var $container = $(mainModalClass)
    tabInit($container)
  }

  var mainModal2Open = function () {
    $(mainModal2.modalBoxContent).find('a').bind('click', function (event) {
      event.preventDefault()
    })
    mainModal2.open()
  }

  var mainModal3Open = function () {
    $(mainModal3.modalBoxContent).find('a').bind('click', function (event) {
      event.preventDefault()
    })
    mainModal3.open()
  }

  $('.btn-status-report-01').bind('click', function (event) {
    mainModal1Open()
  })

  $('.btn-status-report-02').bind('click', function (event) {
    mainModal2Open()
  })

  $('.btn-status-report-03').bind('click', function (event) {
    mainModal3Open()
  })

  var portfolioItemBind = function ($element) {
    $element.bind('click', function (event) {
      location.href = $(this).data('link')
    })
  }

  var $portfolio = $('.portfolio')

  var $colGroupTemplate = $('<div class="col-group"></div>')

  var portfolioPage = new Pagination()
  portfolioPage.setLimit(4)
  var loadPortfolio = function () {
    $portfolio.addClass('loader-section').empty()

    http.post('/api/portfolio', {
      page: portfolioPage.get()
    })
      .finally(function () {
        $portfolio.removeClass('loader-section')
      })
      .then(function (data) {
        portfolioPage.set(data.page)

        var $colGroup1
        var $colGroup2

        if (data.data.length > 0) {
          var $portfolioItem

          data.data.forEach(function (element, index) {
            switch (Number(index) + 1) {
              case 1:
              case 4:
                $colGroup1 = $colGroupTemplate.clone()
                $portfolioItem = $(
                  '<div class="col-12" data-link="/portfolio/' + element.pf_pk + '">' +
                  '  <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\"' + element.pi_after + '\");"></a>' +
                  '  <div class="info">' +
                  '  <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0).format() + '만원</span>' +
                  '  <span class="pull-right">' + element.pf_address + '</span>' +
                  '  </div>' +
                  '</div>'
                )
                portfolioItemBind($portfolioItem)
                $portfolioItem.appendTo($colGroup1)
                $colGroup1.appendTo($portfolio)
                break
              case 2:
              case 3:
                if (typeof $colGroup2 === 'undefined') {
                  $colGroup2 = $colGroupTemplate.clone()
                  $colGroup2.appendTo($portfolio)
                }
            }

            if (index === 1) {
              $portfolioItem = $(
                '<div class="col-8" data-link="/portfolio/' + element.pf_pk + '">' +
                '    <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\"' + element.pi_after + '\");"></a>' +
                '    <div class="info">' +
                '    <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0) + '만원</span>' +
                '    <span class="pull-right">' + element.pf_address + '</span>' +
                '    </div>' +
                '</div>'
              )
              portfolioItemBind($portfolioItem)
              $portfolioItem.appendTo($colGroup2)
            } else if (index === 2) {
              $portfolioItem = $(
                '<div class="col-4" data-link="/portfolio/' + element.pf_pk + '">' +
                '    <a href="/portfolio/' + element.pf_pk + '" class="picture" style="background-image: url(\"' + element.pi_after + '\");"></a>' +
                '    <div class="info">' +
                '    <span class="pull-left">' + element.pf_size + '평 | ' + (element.pf_price || 0).format() + '만원</span>' +
                '    <span class="pull-right">' + element.pf_address + '</span>' +
                '    </div>' +
                '</div>')
              portfolioItemBind($portfolioItem)
              $portfolioItem.appendTo($colGroup2)
            }
          })
        } else {
          var $emptySection = $(
            '<div class="empty-section">' +
            '    <i class="pe-7s-attention"></i>' +
            '    <span>조회된 항목이 없습니다.</span>' +
            '</div>'
          )
          $emptySection.appendTo($portfolio)
        }
      })
      .catch(function (error) {
        console.log(error)
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }
  loadPortfolio()
})
