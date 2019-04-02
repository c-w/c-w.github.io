(function() {
  'use strict';

  var removeClass = function(node, classNameRegExp) {
    node.className = node.className.replace(classNameRegExp, '');
  };

  var forceImageLoad = function(img) {
    var imageSrc = img.src;
    img.src = '';
    img.src = imageSrc;
  };

  var getJson = function(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        callback(JSON.parse(request.responseText));
      }
    }
    request.open('GET', url, true);
    request.send(null);
  };

  var loadScript = function(url, callback) {
    var script = document.createElement('script');
    script.addEventListener('load', callback);
    script.src = url;
    document.body.appendChild(script);
  };

  var isMobileDevice = function() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  var hasSpaceOnRight = function(anchor, width) {
    return (window.innerWidth - anchor.offsetWidth) / 2 > width;
  }

  document.addEventListener('DOMContentLoaded', function() {
    var hidden = /\bhidden\b/;
    var chart = document.getElementById('chart');
    var body = document.body;

    chart.addEventListener('load', function() {
      removeClass(body, hidden);
      if (!window.conway) {
        loadScript('./conway.js', function() {
          window.conway.init(chart.contentDocument);
        });
      }
    });
    chart.addEventListener('error', function() { removeClass(body, hidden); chart.remove(); });
    forceImageLoad(chart);

    if (!isMobileDevice()) {
      loadScript('//unpkg.com/tippy.js@3/dist/tippy.all.min.js', function() {
        var tippy = window.tippy;
        if (!tippy) {
          return;
        }

        getJson('./previews.json', function(previews) {
          var previewNodes = document.getElementsByClassName('preview');
          for (var i = 0; i < previewNodes.length; i++) {
            var previewNode = previewNodes[i];
            var preview = previews[previewNode.getAttribute('href')];
            if (!preview) {
              return;
            }

            var tooltipAnchor = previewNode.closest('li');
            var tooltipWidth = 300;

            tippy.one(tooltipAnchor, {
              arrow: true,
              maxWidth: tooltipWidth,
              placement: hasSpaceOnRight(tooltipAnchor, tooltipWidth) ? 'right' : 'top',
              delay: [20, 40],
              content:
                '<div class="preview">' +
                ' <img src="' + preview.image + '" />' +
                ' <div class="description">' + (preview.description || preview.title) + '</div>' +
                '</div>'
            });
          }
        });
      });
    }
  });
}());
