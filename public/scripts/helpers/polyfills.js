$(function () {
  var browserInfo = browser()

  if (browserInfo.name === 'ie' && browserInfo.versionNumber <= 8) {
    var $logoImage = $('#header .logo img')
    $logoImage.attr('src', $logoImage.attr('src').replace(/svg/, 'png'))
    setTimeout(function () {
      var $compareImage = $('.compare-service .title .icon-compare.compare-02 img')
      $compareImage.attr('src', $compareImage.attr('src').replace(/svg/, 'png'))
    }, 1000)
  }
})
