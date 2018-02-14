$(function () {
    var requestID = $('#request_id').val() || '';

    var $inputRequestId = $('#request_id');

    var $inputRequestIsValuable = $('#rq_valuable input[type=radio]');
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
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-01.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-02.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-03.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-04.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-05.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-06.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-07.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-08.jpeg\');" />\
        </div>',

        '<div class="form-col">\
            <div class="picture" style="background-image:url(\'\/images\/temporary\/bg-style-09.jpeg\');" />\
        </div>',
    ]

    var colorTemplate = [
        '<div class="form-col">\
            <div class="picture" style="background-color: #f9f2f1;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #0A0200;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #92C4E0;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #D4C1D3;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #F0E842;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #BDC3C7;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #16A085;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #B37618;">\
            </div>\
        </div>',
        '<div class="form-col">\
            <div class="picture" style="background-color: #2DE3C3;">\
            </div>\
        </div>',
    ];

    $inputRequestIsValuable.click(function() {
        var $this = $(this);
        var isValuable = $this.val();

        updateIsValueable(requestID, isValuable);
    });


    function updateIsValueable(index, isValuable) {
        var updatePromise = http.post('/api/admin/request/save/' + index, {
            request_is_valuable: isValuable,
        }).then(function(data) {
            console.log(data);
        })
    }

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

                    $inputRequestIsValuable.filter('[value=' + request.rq_is_valuable + ']').prop("checked", true);

                    $inputRequestId.text(request.rq_id || '없음');
                    $inputRequestName.text(request.rq_name || '없음');
                    $inputRequestPhone.text(request.rq_phone || '없음');
                    $inputRequestFamily.text(request.rq_family || '없음');
                    $inputRequestSizeStr.text(request.rq_size_str || '없음');
                    $inputRequestBudgetStr.text(request.rq_budget_str || '없음');
                    $inputRequestAddress.text(request.rq_address_brief && request.rq_address_detail ? request.rq_address_brief + ' '  + request.rq_address_detail : '없음' );
                    $inputRequestMoveDate.text(request.rq_move_date  === '0000-00-00 00:00:00' ? '없음' : moment(request.rq_move_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestDate.text(request.rq_date  === '0000-00-00' ? '없음' : moment(request.rq_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD'));
                    $inputRequestTime.text(request.rq_time || '없음');
                    $inputRequestPlace.text(request.rq_place || '없음');
                    $inputRequestRequest.text(request.rq_request|| '없음');

                    var styleLikesList = request.rq_style_likes === "" ? [] : request.rq_style_likes.split(',');
                    var styleDislikesList = request.rq_style_dislikes === "" ? [] : request.rq_style_dislikes.split(',');
                    var colorLikesList = request.rq_color_likes === "" ? [] : request.rq_color_likes.split(',');
                    var colorDislikesList = request.rq_color_dislikes === "" ? [] : request.rq_color_dislikes.split(',');

                    var styleLikesListHtml = '';
                    var styleDislikesListHtml = '';

                    for ( var i = 0; i < styleLikesList.length; i ++ ) {
                        styleLikesListHtml += styleTemplate[(parseInt(styleLikesList[i], 10) - 1)];
                    }

                    for ( var i = 0; i < styleDislikesList.length; i ++ ) {
                        styleDislikesListHtml += styleTemplate[(parseInt(styleDislikesList[i], 10) - 1)];
                    }

                    $inputRequestStyleLikes.html(styleLikesListHtml || '없음');
                    $inputRequestStyleDislikes.html(styleDislikesListHtml || '없음');

                    if (!styleLikesListHtml) {
                        $inputRequestStyleLikes.removeClass('form-grid')
                    }

                    if (!styleDislikesListHtml) {
                        $inputRequestStyleDislikes.removeClass('form-grid')
                    }


                    var colorLikesListHtml = '';
                    var colorDislikesListHtml = '';

                    for ( var i = 0; i < colorLikesList.length; i ++ ) {
                        colorLikesListHtml += colorTemplate[(parseInt(colorLikesList[i], 10) - 1)];
                    }

                    for ( var i = 0; i < colorDislikesList.length; i ++ ) {
                        colorDislikesListHtml += colorTemplate[(parseInt(colorDislikesList[i], 10) - 1)];
                    }

                    $inputRequestColorLikes.html(colorLikesListHtml || '없음');
                    $inputRequestColorDislikes.html(colorDislikesListHtml || '없음');

                    if (!colorLikesListHtml) {
                        $inputRequestColorLikes.removeClass('form-grid')
                    }

                    if (!colorDislikesListHtml) {
                        $inputRequestColorDislikes.removeClass('form-grid')
                    }

                }
            })
            ['catch'](function (error) {
                console.log(error);
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    loadRequest();
});