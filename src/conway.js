window.conway = (function() {
  class WrappingArray {
    constructor(entries) {
      const xMax = Math.max(...entries.map(entry => entry.x)) + 1;
      const yMax = Math.max(...entries.map(entry => entry.y)) + 1;

      const array = new Array(xMax);
      for (let i = 0; i < xMax; i++) {
        array[i] = new Array(yMax);
      }

      for (const entry of entries) {
        array[entry.x][entry.y] = entry.value;
      }

      this._xMax = xMax;
      this._yMax = yMax;
      this._array = array;
    }

    get(x, y) {
      if (x < 0) {
        x = this._xMax - x;
      }

      if (y < 0) {
        y = this._yMax - y;
      }

      return this._array[x % this._xMax][y % this._yMax];
    }

    forEach(callback) {
      for (let x = 0; x < this._xMax; x++) {
        for (let y = 0; y < this._yMax; y++) {
          const value = this._array[x][y];
          if (value != null) {
            callback({ value, x, y });
          }
        }
      }
    }
  }

  class Conway {
    constructor(board) {
      this._board = board;
    }

    _getNeighbors(x, y) {
      return [
        this._board.get(x - 1, y - 1),
        this._board.get(x    , y - 1),
        this._board.get(x + 1, y - 1),
        this._board.get(x - 1, y    ),
        this._board.get(x + 1, y    ),
        this._board.get(x - 1, y + 1),
        this._board.get(x    , y + 1),
        this._board.get(x + 1, y + 1),
      ];
    }

    _getNextState(x, y) {
      const numLiveNeighbors = this._getNeighbors(x, y)
        .filter(neighbor => neighbor != null && neighbor.state === 'alive')
        .length;

      const isAlive = this._board.get(x, y).state === 'alive'
        ? numLiveNeighbors === 2 || numLiveNeighbors === 3
        : numLiveNeighbors === 3;

      return isAlive ? 'alive' : 'dead';
    }

    _nextStep() {
      this._board.forEach(({ value, x, y }) => value.nextState = this._getNextState(x, y));

      let converged = true;
      this._board.forEach(({ value }) => {
        const previousState = value.state;
        value.state = value.nextState;
        value.nextState = null;

        if (previousState != value.state) {
          converged = false;
        }
      });

      return converged;
    }

    run(epoch) {
      while (epoch--) {
        const converged = this._nextStep();
        if (converged) {
          return true;
        }
      }
      return false;
    }

    show() {
      this._board.forEach(({ value }) => value.element.setAttribute('data-conway-state', value.state));
    }

    reset() {
      this._board.forEach(({ value }) => value.element.setAttribute('data-conway-state', ''));
    }

    static build(rootElement) {
      const rects = rootElement.getElementsByTagName('rect');

      const cells = [];
      for (const rect of rects) {
        const isAlive = rect.getAttribute('data-score') !== '0';
        cells.push({
          x: (rect.getAttribute('x') - 14) / 13,
          y: (rect.getAttribute('y') - 14) / 13,
          value: {
            element: rect,
            state: isAlive ? 'alive' : 'dead',
          }
        });
      }

      return new Conway(new WrappingArray(cells));
    }

    static injectStyle(rootElement) {
      const link = rootElement.createElementNS('http://www.w3.org/1999/xhtml', 'link');
      link.setAttribute('href', './conway.css');
      link.setAttribute('type', 'text/css');
      link.setAttribute('rel', 'stylesheet');
      const svg = rootElement.getElementsByTagName('svg')[0];
      svg.insertBefore(link, svg.firstChild);
    }
  }

  return {
    init: (rootElement) => {
      Conway.injectStyle(rootElement);

      let epoch = 0;

      const nextStep = () => {
        const conway = Conway.build(rootElement);
        const converged = conway.run(epoch + 1);
        if (!converged) {
          epoch++;
        }
        conway.show();
      };

      const previousStep = () => {
        if (epoch <= 0) {
          return;
        }

        const conway = Conway.build(rootElement);
        epoch--;
        conway.run(epoch);
        conway.show();
      };

      const reset = () => {
        const conway = Conway.build(rootElement);
        epoch = 0;
        conway.reset();
      };

      document.addEventListener('keydown', (event) => {
        event.preventDefault();

        if (event.key === 'n') {
          nextStep();
        } else if (event.key === 'b') {
          previousStep();
        } else if (event.key === 'r') {
          reset();
        }

        return false;
      });

      rootElement.addEventListener('click', (event) => {
        event.preventDefault();

        if (event.which === 1) {
          nextStep();
        }

        return false;
      });

      rootElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        previousStep();

        return false;
      });
    },
  };
}());
