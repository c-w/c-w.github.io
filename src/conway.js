window.conway = (function() {
  const WrappingArray = function(entries) {
    let xMax = -1;
    let yMax = -1;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.x > xMax) xMax = entry.x;
      if (entry.y > yMax) yMax = entry.y;
    }

    xMax++;
    yMax++;

    const array = new Array(xMax);
    for (let i = 0; i < xMax; i++) {
      array[i] = new Array(yMax);
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      array[entry.x][entry.y] = entry.value;
    }

    return {
      get: (x, y) => {
        if (x < 0) {
          x = xMax - x;
        }

        if (y < 0) {
          y = yMax - y;
        }

        return array[x % xMax][y % yMax];
      },
      forEach: (callback) => {
        for (let i = 0; i < xMax; i++) {
          for (let j = 0; j < yMax; j++) {
            const entry = array[i][j];
            if (entry != null) {
              callback(entry, i, j);
            }
          }
        }
      },
    };
  };

  const Conway = (board) => {
    const nextStep = () => {
      board.forEach((value, x, y) => {
        const neighbors = [
          board.get(x - 1, y - 1),
          board.get(x    , y - 1),
          board.get(x + 1, y - 1),
          board.get(x - 1, y    ),
          board.get(x + 1, y    ),
          board.get(x - 1, y + 1),
          board.get(x    , y + 1),
          board.get(x + 1, y + 1),
        ];

        let numLiveNeighbors = 0;
        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = neighbors[i];
          if (neighbor != null && neighbor.state === 'alive') {
            numLiveNeighbors++;
          }
        }

        let isAlive = value.state === 'alive';

        if (isAlive) {
          isAlive = numLiveNeighbors === 2 || numLiveNeighbors === 3;
        } else {
          isAlive = numLiveNeighbors === 3;
        }

        value.nextState = isAlive ? 'alive' : 'dead';
      });

      let converged = true;
      board.forEach((value) => {
        const previousState = value.state;
        value.state = value.nextState;
        value.nextState = null;

        if (previousState != value.state) {
          converged = false;
        }
      });

      return converged;
    };

    return {
      run: (epoch) => {
        while (epoch--) {
          const converged = nextStep();
          if (converged) {
            return true;
          }
        }
        return false;
      },
      show: () => {
        board.forEach((value) => value.element.setAttribute('data-conway-state', value.state));
      },
      reset: () => {
        board.forEach((value) => value.element.setAttribute('data-conway-state', ''));
      },
    };
  };

  const buildConway = (rootElement) => {
    const rects = rootElement.getElementsByTagName('rect');

    const cells = [];
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const x = (rect.getAttribute('x') - 14) / 13;
      const y = (rect.getAttribute('y') - 14) / 13;
      const isAlive = rect.getAttribute('data-score') !== '0';
      cells.push({ x: x, y: y, value: { element: rect, state: isAlive ? 'alive' : 'dead' } });
    }

    return Conway(WrappingArray(cells));
  };

  const injectStyle = (rootElement) => {
    const link = rootElement.createElementNS('http://www.w3.org/1999/xhtml', 'link');
    link.setAttribute('href', './conway.css');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    const svg = rootElement.getElementsByTagName('svg')[0];
    svg.insertBefore(link, svg.firstChild);
  };

  return {
    init: (rootElement) => {
      injectStyle(rootElement);

      let epoch = 0;
      document.addEventListener('keydown', (event) => {
        if (event.key === 'n') {
          const conway = buildConway(rootElement);
          const converged = conway.run(epoch + 1);
          if (!converged) {
            epoch++;
          }
          conway.show();
        } else if (event.key === 'b' && epoch > 0) {
          const conway = buildConway(rootElement);
          epoch--;
          conway.run(epoch);
          conway.show();
        } else if (event.key === 'r') {
          const conway = buildConway(rootElement);
          epoch = 0;
          conway.reset();
        }
      });
    },
  };
}());
