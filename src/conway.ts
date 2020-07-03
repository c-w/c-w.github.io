(window as any).conway = (() => {
  type State = 'alive' | 'dead';

  interface ICell {
    element: any;
    state: State;
    nextState?: State;
  }

  interface IEntry<T> {
    x: number;
    y: number;
    value: T;
  }

  class WrappingArray<T> {
    private xMax: number;
    private yMax: number;
    private array: Array<Array<T | undefined>>;

    constructor(entries: Array<IEntry<T>>) {
      const xMax = Math.max(...entries.map(entry => entry.x)) + 1;
      const yMax = Math.max(...entries.map(entry => entry.y)) + 1;

      const array = new Array(xMax);
      for (let i = 0; i < xMax; i++) {
        array[i] = new Array(yMax);
      }

      for (const entry of entries) {
        array[entry.x][entry.y] = entry.value;
      }

      this.xMax = xMax;
      this.yMax = yMax;
      this.array = array;
    }

    public get(x: number, y: number): T | undefined {
      if (x < 0) {
        x = this.xMax - x;
      }

      if (y < 0) {
        y = this.yMax - y;
      }

      return this.array[x % this.xMax][y % this.yMax];
    }

    public forEach(callback: (item: IEntry<T>) => void) {
      for (let x = 0; x < this.xMax; x++) {
        for (let y = 0; y < this.yMax; y++) {
          const value = this.array[x][y];
          if (value != null) {
            callback({ value, x, y });
          }
        }
      }
    }
  }

  class Conway {
    public static build(rootElement: Document) {
      const rects = rootElement.getElementsByTagName('rect');

      const cells: Array<IEntry<ICell>> = [];

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        const isAlive = rect.getAttribute('data-score') !== '0';
        cells.push({
          value: {
            element: rect,
            state: isAlive ? 'alive' : 'dead',
          },
          x: (Number(rect.getAttribute('x')) - 14) / 13,
          y: (Number(rect.getAttribute('y')) - 14) / 13,
        });
      }

      return new Conway(new WrappingArray(cells));
    }

    private board: WrappingArray<ICell>;

    constructor(board: WrappingArray<ICell>) {
      this.board = board;
    }

    public run(epoch: number) {
      while (epoch--) {
        const converged = this.nextStep();
        if (converged) {
          return true;
        }
      }
      return false;
    }

    public show() {
      this.board.forEach(({ value }) =>
        value.element.setAttribute('data-conway-state', value.state)
      );
    }

    public reset() {
      this.board.forEach(({ value }) =>
        value.element.setAttribute('data-conway-state', '')
      );
    }

    private getNeighbors(x: number, y: number): Array<ICell | undefined> {
      return [
        this.board.get(x - 1, y - 1),
        this.board.get(x, y - 1),
        this.board.get(x + 1, y - 1),
        this.board.get(x - 1, y),
        this.board.get(x + 1, y),
        this.board.get(x - 1, y + 1),
        this.board.get(x, y + 1),
        this.board.get(x + 1, y + 1),
      ];
    }

    private getNextState(x: number, y: number) {
      const numLiveNeighbors = this.getNeighbors(x, y).filter(
        neighbor => neighbor != null && neighbor.state === 'alive'
      ).length;

      const isAlive =
        this.board.get(x, y).state === 'alive'
          ? numLiveNeighbors === 2 || numLiveNeighbors === 3
          : numLiveNeighbors === 3;

      return isAlive ? 'alive' : 'dead';
    }

    private nextStep() {
      this.board.forEach(
        ({ value, x, y }) => (value.nextState = this.getNextState(x, y))
      );

      let converged = true;
      this.board.forEach(({ value }) => {
        const previousState = value.state;
        value.state = value.nextState;
        value.nextState = null;

        if (previousState !== value.state) {
          converged = false;
        }
      });

      return converged;
    }
  }

  return {
    init: (rootElement: Document) => {
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

      document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'n') {
          nextStep();
        } else if (event.key === 'b') {
          previousStep();
        } else if (event.key === 'r') {
          reset();
        }
      });

      rootElement.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();

        if (event.which === 1) {
          nextStep();
        }

        return false;
      });

      rootElement.addEventListener('contextmenu', (event: MouseEvent) => {
        event.preventDefault();

        previousStep();

        return false;
      });
    },
  };
})();
