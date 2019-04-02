window.conway = (function() {
  'use strict';

  var WrappingArray = function(entries) {
    var xMax = -1;
    var yMax = -1;
    var i, entry;

    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      if (entry.x > xMax) xMax = entry.x;
      if (entry.y > yMax) yMax = entry.y;
    }

    xMax++;
    yMax++;

    var array = new Array(xMax);
    for (i = 0; i < xMax; i++) {
      array[i] = new Array(yMax);
    }

    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      array[entry.x][entry.y] = entry.value;
    }

    return {
      get: function(x, y) {
        if (x < 0) {
          x = xMax - x;
        }

        if (y < 0) {
          y = yMax - y;
        }

        return array[x % xMax][y % yMax];
      },
      forEach: function(callback) {
        for (var i = 0; i < xMax; i++) {
          for (var j = 0; j < yMax; j++) {
            entry = array[i][j];
            if (entry != null) {
              callback(entry, i, j);
            }
          }
        }
      },
    };
  };

  var Conway = function(board) {
    var nextStep = function() {
      board.forEach(function(value, x, y) {
        var neighbors = [
          board.get(x - 1, y - 1),
          board.get(x    , y - 1),
          board.get(x + 1, y - 1),
          board.get(x - 1, y    ),
          board.get(x + 1, y    ),
          board.get(x - 1, y + 1),
          board.get(x    , y + 1),
          board.get(x + 1, y + 1),
        ];

        var numLiveNeighbors = 0;
        for (var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          if (neighbor != null && neighbor.state === 'alive') {
            numLiveNeighbors++;
          }
        }

        var isAlive = value.state === 'alive';

        if (isAlive) {
          isAlive = numLiveNeighbors === 2 || numLiveNeighbors === 3;
        } else {
          isAlive = numLiveNeighbors === 3;
        }

        value.nextState = isAlive ? 'alive' : 'dead';
      });

      var converged = true;
      board.forEach(function(value) {
        var previousState = value.state;
        value.state = value.nextState;
        value.nextState = null;

        if (previousState != value.state) {
          converged = false;
        }
      });

      return converged;
    };

    return {
      run: function(epoch) {
        while (epoch--) {
          var converged = nextStep();
          if (converged) {
            return true;
          }
        }
        return false;
      },
      show: function() {
        board.forEach(function(value) {
          value.element.setAttribute('data-conway-state', value.state);
        });
      },
      reset: function() {
        board.forEach(function(value) {
          value.element.setAttribute('data-conway-state', '');
        });
      },
    };
  };

  var buildConway = function(rootElement) {
    var rects = rootElement.getElementsByTagName('rect');

    var cells = [];
    for (var i = 0; i < rects.length; i++) {
      var rect = rects[i];
      var x = (rect.getAttribute('x') - 14) / 13;
      var y = (rect.getAttribute('y') - 14) / 13;
      var isAlive = rect.getAttribute('data-score') !== '0';
      cells.push({ x: x, y: y, value: { element: rect, state: isAlive ? 'alive' : 'dead' } });
    }

    return Conway(WrappingArray(cells));
  };

  var injectStyle = function(rootElement) {
    var link = rootElement.createElementNS('http://www.w3.org/1999/xhtml', 'link');
    link.setAttribute('href', './conway.css');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    var svg = rootElement.getElementsByTagName('svg')[0];
    svg.insertBefore(link, svg.firstChild);
  };

  return {
    init: function(rootElement) {
      injectStyle(rootElement);

      var epoch = 0;
      var conway;
      document.addEventListener('keydown', function(event) {
        if (event.key === 'n') {
          conway = buildConway(rootElement);
          var converged = conway.run(epoch + 1);
          if (!converged) {
            epoch++;
          }
          conway.show();
        } else if (event.key === 'b' && epoch > 0) {
          conway = buildConway(rootElement);
          epoch--;
          conway.run(epoch);
          conway.show();
        } else if (event.key === 'r') {
          conway = buildConway(rootElement);
          epoch = 0;
          conway.reset();
        }
      });
    },
  };
}());
