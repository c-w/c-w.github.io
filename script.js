(function() {
  var removeClass = function(node, classNameRegExp) {
    node.className = node.className.replace(classNameRegExp, '');
  };

  var forceImageLoad = function(img) {
    var imageSrc = img.src;
    img.src = '';
    img.src = imageSrc;
  };

  document.addEventListener('DOMContentLoaded', function() {
    var hidden = /\bhidden\b/;
    var chart = document.getElementById('chart');
    var body = document.body;

    chart.addEventListener('load', function() { removeClass(body, hidden); });
    chart.addEventListener('error', function() { removeClass(body, hidden); chart.remove(); });
    forceImageLoad(chart);
  });
}());
