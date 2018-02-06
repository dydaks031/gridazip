$(function() {
  $('.not-yet').bind('click', function(event) {
    event.preventDefault();
    alert('이 부분은 아직 개발이 완성되지 않았습니다.\n' + moment().add(3, 'days').format('YYYY-MM-DD') + ' 안에 완성됩니다.');
  });
});