$(function () {
    var requestID = $('#request_id').val() || '';

    var $inputRequestId = $('#request_id');
    var $inputRequestName = $('#request_name');
    var $inputRequestPhone = $('#request_phone');
    var $inputRequestFamily = $('#request_family');
    var $inputRequestSizeStr = $('#request_size_str');
    var $inputRequestBudgetStr = $('#request_budget_str');
    var $inputRequestAddress = $('#request_address');
    var $inputRequestMoveDate = $('#request_move_date');
    var $inputRequestStyleLikes = $('#request_style_likes');
    var $inputRequestStyleDislikes = $('#request_style_dislikes');
    var $inputRequestColorLikes = $('#request_color_likes');
    var $inputRequestColorDislikes = $('#request_color_dislikes');
    var $inputRequestDate = $('#request_date');
    var $inputRequestTime = $('#request_time');
    var $inputRequestPlace = $('#request_place');
    var $inputRequestRequest = $('#request_request');

    var styleTemplate = [
        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-01.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-02.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-03.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-04.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-05.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-06.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-07.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-08.jpeg");">\
            </div>\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image: url("/images/temporary/bg-style-09.jpeg");">\
            </div>\
        </div>',
    ]

    var loadRequest = function () {
        loading(true);
        http.post('/api/admin/request/' + requestID)
            ['finally'](function () {
            loading(false);
        })
            .then(function (data) {
                if (data.data === null) {
                    swal({
                        title: '디자이너가 존재하지 않습니다.',
                        text: '디자이너가 도중에 삭제된 것 같습니다.',
                        type: 'error',
                        confirmButtonText: '뒤로가기'
                    }, function () {
                        location.href = '/admin';
                    });
                }
                else {
                    var request = data.data;

                    $inputRequestId.text(request.rq_id || '없음');
                    $inputRequestName.text(request.rq_name || '없음');
                    $inputRequestPhone.text(request.rq_phone || '없음');
                    $inputRequestFamily.text(request.rq_family || '없음');
                    $inputRequestSizeStr.text(request.rq_size_str || '없음');
                    $inputRequestBudgetStr.text(request.rq_budget_str || '없음');
                    $inputRequestAddress.text(request.rq_address_brief && request.rq_address_detail ? request.rq_address_brief + ' '  + request.rq_address_detail : '없음' );
                    $inputRequestMoveDate.text(request.rq_move_date  === '0000-00-00 00:00:00' ? '없음' : moment(request.rq_move_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestStyleLikes.text(request.rq_style_likes || '없음');
                    $inputRequestStyleDislikes.text(request.rq_style_dislikes || '없음');
                    $inputRequestStyleDislikes.text(request.rq_style_dislikes || '없음');
                    $inputRequestColorLikes.text(request.rq_color_likes || '없음');
                    $inputRequestColorDislikes.text(request.rq_color_dislikes || '없음');
                    $inputRequestDate.text(request.rq_date  === '0000-00-00' ? '없음' : moment(request.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestTime.text(request.rq_time || '없음');
                    $inputRequestPlace.text(request.rq_place || '없음');
                    $inputRequestRequest.text(request.rq_request|| '없음');
                }
            })
            ['catch'](function (error) {

            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    loadRequest();
});