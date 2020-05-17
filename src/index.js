/* eslint-env browser */

(function() {
  const removeClass = (node, classNameRegExp) =>
    (node.className = node.className.replace(classNameRegExp, ''));

  const forceImageLoad = img => {
    const imageSrc = img.src;
    img.src = '';
    img.src = imageSrc;
  };

  const getJson = (url, callback) => {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        callback(JSON.parse(request.responseText));
      }
    };
    request.open('GET', url, true);
    request.send(null);
  };

  const loadScript = (url, callback) => {
    const script = document.createElement('script');
    script.addEventListener('load', callback);
    script.src = url;
    document.body.appendChild(script);
  };

  const isMobileDevice = () =>
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const hasSpaceOnRight = (anchor, width) =>
    (window.innerWidth - anchor.offsetWidth) / 2 > width;

  document.addEventListener('DOMContentLoaded', () => {
    const hidden = /\bhidden\b/;
    const chart = document.getElementById('chart');
    const body = document.body;

    chart.addEventListener('load', () => {
      if (!window.conway) {
        loadScript('./conway.js', () => {
          window.conway.init(chart.contentDocument);
          removeClass(body, hidden);
        });
      }
    });
    chart.addEventListener('error', () => {
      removeClass(body, hidden);
      chart.remove();
    });
    forceImageLoad(chart);

    if (!isMobileDevice()) {
      loadScript('//unpkg.com/tippy.js@3/dist/tippy.all.min.js', () => {
        const tippy = window.tippy;
        if (!tippy) {
          return;
        }

        getJson('./previews.json', previews => {
          const previewNodes = document.getElementsByClassName('preview');
          for (let i = 0; i < previewNodes.length; i++) {
            const previewNode = previewNodes[i];
            const preview = previews[previewNode.getAttribute('href')];
            if (!preview) {
              return;
            }

            const tooltipAnchor = previewNode.closest('li');
            const tooltipWidth = 300;

            const previewImage = `<img src="${preview.image}" />`;
            const previewText = preview.description || preview.title;
            const previewDescription = `<div class="description">${previewText}</div>`;

            tippy.one(tooltipAnchor, {
              arrow: true,
              maxWidth: tooltipWidth,
              placement: hasSpaceOnRight(tooltipAnchor, tooltipWidth)
                ? 'right'
                : 'top',
              delay: [20, 40],
              content: `<div class="preview">${previewImage}${previewDescription}</div>`,
            });
          }
        });
      });
    }
  });
})();
