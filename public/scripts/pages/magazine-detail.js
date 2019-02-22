$(function () {
  const magazineID = $('#magazine_id').val();
  const loadMagazine = function () {
    loading(true);
    http.post('/api/magazine/' + magazineID)
      .finally(function () {
        loading(false);
      })
      .then(function(response) {
        if (response.data === null) {
          swal({
            title: '매거진이 존재하지 않습니다.',
            text: '매거진이 도중에 삭제된 것 같습니다.',
            type: 'error',
            confirmButtonText: '뒤로가기'
          }, function () {
            location.href = '/magazine';
          });
        }
        else {
          const magazineData = response.data;
          $('#magazineSubject').html(magazineData.mg_subject);
          $('#magazineContent').html(magazineData.mg_content);
          $('.page-description').css({
            "background-image": 'url("' + magazineData.mg_thumbnail + '")',
            "background-size": 'cover'
          });
        }
      })
      .catch(function(error) {
        console.error(error);
        swal({
          title: error.value,
          type: 'error'
        });
      });
  };

    loadMagazine();
});