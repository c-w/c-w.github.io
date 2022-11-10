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
    script.addEventListener('error', callback);
    script.src = url;
    document.body.appendChild(script);
  };

  const isMobileDevice = () =>
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const hasSpaceOnRight = (anchor, width) =>
    (window.innerWidth - anchor.offsetWidth) / 2 > width;

  const injectChartStyle = rootElement => {
    const link = rootElement.createElementNS(
      'http://www.w3.org/1999/xhtml',
      'link'
    );
    link.setAttribute('href', './conway.css');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    const svg = rootElement.getElementsByTagName('svg')[0];

    const rects = svg.getElementsByTagName('rect');

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const score = Number(rect.getAttribute('data-score'));

      let category;
      if (score === 0) {
        category = '0';
      } else if (score <= 10) {
        category = '10';
      } else if (score <= 20) {
        category = '20';
      } else if (score <= 30) {
        category = '30';
      } else {
        category = '40';
      }
      rect.setAttribute('data-category', category);
    }

    svg.insertBefore(link, svg.firstChild);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const hidden = /\bhidden\b/;
    const chart = document.getElementById('chart');
    const body = document.body;

    chart.addEventListener('load', () => {
      if (!window.conway) {
        const chartBody = chart.contentDocument;
        injectChartStyle(chartBody);
        loadScript('./conway.js', () => {
          if (window.conway) {
            window.conway.init(chartBody);
          }
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
              continue;
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
