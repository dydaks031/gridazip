$(function () {
    var portfolioID = $('#portfolio_id').val();
    var loadPortfolio = function () {
        loading(true);
        http.post('/api/portfolio/' + portfolioID)
            .finally(function () {
                loading(false);
            })
            .then(function (data) {
                console.log(data);
                if (data.data === null) {
                    swal({
                        title: '포트폴리오가 존재하지 않습니다.',
                        text: '포트폴리오가 도중에 삭제된 것 같습니다.',
                        type: 'error',
                        confirmButtonText: '뒤로가기'
                    }, function () {
                        location.href = '/portfolio';
                    });
                }
                else {

                    var portfolioData = data.data;
                    var imageList = data.images;

                    var mainImage = _.find(imageList, function(item) {
                        return item.pi_is_primary === 'Y'
                    });

                    var imageListTemplate = $('#imageTemplate').html();
                    var $imageListView = $('#imageList');
                    var imageListHtml = '';

                    $('.page-description').css({
                        "background-image": 'url("' + mainImage.pi_after + '")',
                        "background-size": 'cover'
                    });

                    $('#portfolioSizeAndPrice').text(
                        portfolioData.pf_size + ' 평' + ' / ' + portfolioData.pf_price + ' 만원'
                    );

                    $("#portfolioTitle").text(portfolioData.pf_title);
                    $('#portfolioMainTitle').text(portfolioData.pf_title);
                    $("#portfolioDescription").html(portfolioData.pf_description.replace(/\n/, '<br />'));

                    _.forEach(imageList, function (item, index) {
                        imageListHtml += imageListTemplate.replace(/{{PI_AFTER}}/gi, item.pi_after);
                    })

                    imageListHtml = $(imageListHtml);

                    $imageListView.html(imageListHtml);

                    imageListHtml.find('img').lazyload({effect : 'fadeIn'});
                }
            })
            .catch(function (error) {
            console.error(error);
            swal({
                title: error.value,
                type: 'error'
            });
        });
    };

    loadPortfolio();
});