$(function () {
  var $requestIsValuableSort = $('#request_is_valuable')
  var $requestIsContractedSort = $('#request_is_contracted')

  var page = new Pagination()
  var filter = new Filter({
    isValuable: null
  })

  var $request = $('.table-request')
  page.setLimit(20)

  $requestIsValuableSort.bind('change', function (event) {
    event.preventDefault()
    var $this = $(this)

    var value = $this.val()
    filter.setFilter('isValuable', value === '' ? null : value.toString())
    page.reset()
    page.setLimit(20)
    loadRequest()
  })

  $requestIsContractedSort.bind('change', function (event) {
    event.preventDefault()
    var $this = $(this)

    var value = $this.val()
    filter.setFilter('isContracted', value === '' ? null : value.toString())
    page.reset()
    page.setLimit(20)
    loadRequest()
  })

  var loadPromise
  var loadRequest = function () {
    $request.find('tbody').empty().append('<tr><td colspan="9" class="loading"></td></tr>')

    try {
      if (typeof loadPromise !== 'undefined') {
        loadPromise.cancel()
      }
    } catch (e) {
      ;
    }

    loadPromise = http.post('/api/admin/request/list', {
      page: page.get(),
      filter: filter.get()
    })

    loadPromise
      .finally(function () {
        $request.find('.loading').closest('tr').remove()
      })
      .then(function (data) {
        page.set(data.page)
        if (data.data.length > 0) {
          data.data.forEach(function (element, idx) {
            var $row = $(
              '<tr data-idx="' + element.rq_pk + '">' +
              '    <td class="center">' + element.rq_name + '</td>' +
              '    <td class="center">' + element.rq_size_str + '</td>' +
              '    <td class="center">' + element.rq_budget_str + '</td>' +
              '    <td class="center">' + element.rq_phone + '</td>' +
              '    <td class="center">' + (element.rq_date === '0000-00-00' ? '' : moment(element.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')) + '</td>' +
              '    <td class="center">' + element.rq_time + '</td>' +
              '    <td class="center">' + (element.rq_reg_dt === '0000-00-00' ? '' : moment(element.rq_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')) + '</td>' +
              '    <td class="center rq-is-valuable-wrap">' +
              '        <label for="rq_is_valuable_' + idx + '"><input type="radio" id="rq_is_valuable_' + idx + '" value="1" name="request_is_valuable_' + idx + '" />X</label>' +
              '        <label for="rq_is_not_valuable_' + idx + '"><input type="radio" id="rq_is_not_valuable_' + idx + '" value="3" name="request_is_valuable_' + idx + '" />&#9651;</label>' +
              '        <label for="rq_is_not_used_' + idx + '"><input type="radio" id="rq_is_not_used_' + idx + '" value="2" name="request_is_valuable_' + idx + '" />O</label>' +
              '    </td>' +
              '    <td class="center rq-is-contracted-wrap">' +
              '       <label for="rq_is_contracted_' + idx + '"><input type="radio" id="rq_is_contracted_' + idx + '" value="1" name="request_is_contracted_' + idx + '" />X</label>' +
              '       <label for="rq_is_not_contracted_' + idx + '"><input type="radio" id="rq_is_not_contracted_' + idx + '" value="2" name="request_is_contracted_' + idx + '" />O</label>' +
              '   </td>' +
              '</tr>'
            )

            if (element.rq_is_valuable) {
              console.debug('rq_name : ' + element.rq_name)
              console.debug('rq_is_valuable : ' + element.rq_is_valuable)

              $row.find('input[name=request_is_valuable_' + idx + ']').filter('[value=' + element.rq_is_valuable + ']').prop('checked', true)
            }

            if (element.rq_is_contracted) {
              $row.find('input[name=request_is_contracted_' + idx + ']').filter('[value=' + element.rq_is_contracted + ']').prop('checked', true)
            }

            $row.bind('click', function (event) {
              event.preventDefault()
              var $this = $(this)
              var index = $this.data('idx')
              location.href = '/admin/request/' + index
            })

            $row.find('.rq-is-valuable-wrap, .rq-is-contracted-wrap').bind('click', function (event) {
              event.stopPropagation()
            })

            $row.find('input[name=request_is_valuable_' + idx + ']').bind('click', function (event) {
              // event.preventDefault();
              event.stopPropagation()

              var $this = $(this)
              var index = $this.parents('tr').data('idx')
              var isValuable = $this.val()

              updateRowStatus(index, {
                request_is_valuable: isValuable
              })
            })

            $row.find('input[name=request_is_contracted_' + idx + ']').bind('click', function (event) {
              // event.preventDefault();
              event.stopPropagation()

              var $this = $(this)
              var index = $this.parents('tr').data('idx')
              var isValuable = $this.val()

              updateRowStatus(index, {
                request_is_contracted: isValuable
              })
            })

            // $row.find('.switch-btn input[type=checkbox]').bind('change', function() {
            //
            // });

            $row.find('.magnific').bind('click', function (event) {
              event.preventDefault()
              event.stopPropagation()
            }).magnificPopup({
              items: {
                src: element.ds_image
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

            $row.appendTo($request.find('tbody'))
          })
        } else {
          var $emptySection = $(
            '<tr>' +
            '    <td colspan="9" class="empty-section">' +
            '        <i class="pe-7s-attention"></i>' +
            '        <span>조회된 항목이 없습니다.</span>' +
            '    </td>' +
            '</tr>'
          )
          $emptySection.appendTo($request)
          page.reset()
        }

        var $pagination = $('.pagination')
        $pagination.html(page.getHtml())
        $pagination.find('a').bind('click', function (event) {
          event.preventDefault()
          var $this = $(this)
          var index = $this.data('index')
          page.setIndex(index)
          loadRequest()
        })
      })
      .catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }
  loadRequest()

  function updateRowStatus (index, data) {
    http.post('/api/admin/request/save/' + index, data)
      .then(function (data) {
        ;
      }).catch(function (error) {
        swal({
          title: error.value,
          type: 'error'
        })
      })
  }
})
