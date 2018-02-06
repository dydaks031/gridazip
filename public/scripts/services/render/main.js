function Render() {
}

Render.generateStar = function(number) {
  number = number || 0;

  if (number > 5) {
    throw new Error('Star count must less than 6.');
  }

  var html = '';

  for (var index = 1; index <= 5; index++) {
    if (index <= number) {
      html += '<i class="fa fa-star active"></i>';
    }
    else {
      html += '<i class="fa fa-star"></i>';
    }
  }

  return html;
}