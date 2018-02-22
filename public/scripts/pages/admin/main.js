$(function () {
  var page = new Pagination()
  var filter = new Filter({
    sort: null,
    style: null,
    size: null,
    price: null
  })

  var $portfolio = $('.table-portfolio')
  page.setLimit(20)

  var loadPromise
  var loadPortfolio = function () {
    $portfolio.find('tbody').empty().append('<tr><td colspan="7" class="loading"></td></tr>')

    try {
      if (typeof loadPromise !== 'undefined') {
        loadPromise.cancel()
      }
    } catch (e) {
      ;
    }

    loadPromise = http.post('/api/portfolio', {
      page: page.get(),
      filter: filter.get()
    })

    loadPromise
      .finally(function () {
        $portfolio.find('.loading').closest('tr').remove()
      })
      .then(function (data) {
        page.set(data.page)

        if (data.data.length > 0) {
          data.data.forEach(function (element, idx) {
            var $row = $(
              '<tr data-idx="' + element.pf_pk + '">' +
              '    <td class="center">' + element.pf_pk + '</td>' +
              '    <td class="center"><a href="' + element.pi_after + '" class="block no-font magnific">' +
              '    <img src="' + element.pi_after + '" ' + element.pi_after + '/></a></td>' +
              '    <td class="left">' + element.pf_address + '</td>' +
              '    <td class="center">' + element.pf_size + ' 평</td>' +
              '    <td class="center">' + element.pf_price.format() + ' 만원</td>' +
              '    <td class="center">' + moment(element.pf_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') + '</td>' +
              '    <td class="center"><a href="#" class="btn btn-yellow btn-sm btn-delete">삭제</a></td>' +
              '</tr>'
            )

            $row.bind('click', function (event) {
              event.preventDefault()
              var $this = $(this)
              var index = $this.data('idx')
              location.href = '/admin/portfolio/' + index
            })

            $row.find('.magnific').bind('click', function (event) {
              event.preventDefault()
              event.stopPropagation()
            }).magnificPopup({
              items: {
                src: element.pi_after
              },
              type: 'image',
              mainClass: 'mfp-with-zoom',
              zoom: {
                enabled: true,
                duration: 300,
                easing: 'ease-in-out',
                opener: function (opener) {
                  return $row.find('.magnific img')
                }
              }
            })

            $row.find('.btn-delete').bind('click', function (event) {
              event.preventDefault()
              event.stopPropagation()
              if (confirm('정말로 삭제하시겠습니까?')) {
                http.post('/api/admin/portfolio/delete/' + element.pf_pk)
                  .then(function (data) {
                    page.reset()
                    page.setLimit(20)
                    loadPortfolio()
                  })
                  .catch(function (error) {
                    swal({
                      title: error.value,
                      type: 'warning'
                    })
                  })
              }
            })

            $row.appendTo($portfolio.find('tbody'))
          })
        } else {
          var $emptySection = $(
            '<tr>' +
            '    <td colspan="7" class="empty-section">' +
            '        <i class="pe-7s-attention"></i>' +
            '        <span>조회된 항목이 없습니다.</span>' +
            '    </td>' +
            '</tr>'
          )
          $emptySection.appendTo($portfolio)
        }

        var $pagination = $('.pagination')
        $pagination.html(page.getHtml())
        $pagination.find('a').bind('click', function (event) {
          event.preventDefault()
          var $this = $(this)
          var index = $this.data('index')
          page.setIndex(index)
          loadPortfolio()
        })
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }
  loadPortfolio()
})
