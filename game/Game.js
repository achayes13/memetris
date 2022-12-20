const BagGenerator = require('./PieceGenerator');
const pieces = require('./pieces');
const {copy} = require('./util');

const ROWS = 20;
const COLS = 10;
const START_INTERVAL_MS = 900;
const INTERVAL_CHANGE = 0.9;
const LINES_PER_LEVEL = 8;
const LINES_TO_POINTS = [0, 40, 100, 300, 1200];
const MAX_LEADERBOARD_SIZE = 3;

const rotate = piece =>
  piece.map((row, i) => row.map((_, j) => piece[j][piece.length - i - 1]));

function tryPlace(grid, piece) {
  return place(copy(grid), piece);
}

function place(grid, piece) {
  const { row, col, ori } = piece;

  let { shape } = piece;
  for (let i = 0; i < ori; ++i) {
    shape = rotate(shape);
  }

  for (let i = 0; i < shape.length; ++i) {
    for (let j = 0; j < shape[i].length; ++j) {
      if (shape[i][j] !== 0) {
        if (
          row + i < 0 ||
          col + j < 0 ||
          row + i >= ROWS ||
          col + j >= COLS ||
          grid[row + i][col + j] !== 0
        ) {
          return false;
        }
        grid[row + i][col + j] = shape[i][j];
      }
    }
  }

  return true;
}

class Game {
  constructor(seed) {
    this._leaderboard = [];
    this._pieceGenerator = new BagGenerator(seed);
    this._newGame();
  }

  //
  // API
  //

  setListener(onChange) {
    this._onChange = onChange;
  }

  setNewGameListener(onNewGame) {
    this._onNewGame = onNewGame;
  }

  setGarbageListener(onGarbage) {
    this._onGarbage = onGarbage;
  }

  state() {
    const grid = copy(this._grid);
    place(grid, this._piece);

    return {
      ...this._gameState,
      grid,
      leaderboard: this._leaderboard,
    };
  }

  restart(seed) {
    this._restart(seed);
  }

  garbage(c) {
    this._gameState = {
      ...this._gameState,
      pendingGarbage: this._gameState.pendingGarbage + c,
    };
  }

  //
  // Controls
  //

  left() {
    this._move({
      ...this._piece,
      col: this._piece.col - 1,
    });
    this._onChange?.();
  }

  right() {
    this._move({
      ...this._piece,
      col: this._piece.col + 1,
    });
    this._onChange?.();
  }

  a() {
    this._move({
      ...this._piece,
      ori: (this._piece.ori + 1) % 4,
    });
    this._onChange?.();
  }

  up() {
    while (this._downOne()) {}
    this._onChange?.();
  }

  down() {
    this._downOne();
    this._onChange?.();
  }

  //
  // Movement helpers
  //

  _downOne() {
    const moved = this._move({
      ...this._piece,
      row: this._piece.row + 1,
    });
    if (!moved) {
      this._landPiece();
    }
    return moved;
  }

  _move(newPiece) {
    const canPlace = tryPlace(this._grid, newPiece);
    if (canPlace) {
      this._piece = newPiece;
    }

    return canPlace;
  }

  //
  // Game state management helpers
  //

  _restart(seed) {
    this._resetSeed(seed);
    this._newGame();
  }

  _newGame() {
    const prevScore = this._gameState?.score;
    if (prevScore > 0) {
      this._leaderboard = this._leaderboard
        .concat([prevScore])
        .sort((a, b) => b - a)
        .slice(0, MAX_LEADERBOARD_SIZE);
    }

    if (this._piece) {
      this._cleanupPiece();
    }

    this._grid = Array(ROWS)
      .fill(0)
      .map(_ => Array(COLS).fill(0));
    this._gameState = {
      currentIntervalMs: START_INTERVAL_MS,
      level: 1,
      lines: 0,
      score: 0,
      pendingGarbage: 0,
    };

    this._spawnPiece();
  }

  _spawnPiece() {
    const shape = this._pieceGenerator.nextPiece();
    const row = -1 * shape.findIndex(row => Math.max(...row) > 0);
    const col = Math.floor((COLS - shape[0].length) / 2);

    const piece = {
      shape,
      row,
      col,
      ori: 0,
    };

    if (!tryPlace(this._grid, piece)) {
      const newSeed = Math.random();
      this._restart(newSeed);
      this._onNewGame?.(newSeed);
      return;
    }

    this._piece = {
      ...piece,
      interval: setInterval(
        () => this.down(),
        this._gameState.currentIntervalMs
      ),
    };
    this._onChange?.();
  }

  _landPiece() {
    place(this._grid, this._piece);
    this._cleanupPiece();

    this._clearLines();
    this._addGarbage();
    this._spawnPiece();
  }

  _cleanupPiece() {
    clearInterval(this._piece.interval);
    this._piece = null;
  }

  _clearLines() {
    this._grid = this._grid.filter(row => Math.min(...row) === 0);
    const clearedLines = ROWS - this._grid.length;

    const newLines = this._gameState.lines + clearedLines;
    const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
    this._gameState = {
      currentIntervalMs:
        START_INTERVAL_MS * Math.pow(INTERVAL_CHANGE, newLevel - 1),
      level: newLevel,
      lines: newLines,
      score: this._gameState.score + LINES_TO_POINTS[clearedLines],
      pendingGarbage: this._gameState.pendingGarbage,
    };
    this._onGarbage?.(Math.max(clearedLines - 1, 0));

    this._grid = Array(clearedLines)
      .fill(0)
      .map(_ => Array(COLS).fill(0))
      .concat(this._grid);
  }

  _addGarbage() {
    const garbageLines = Array(this._gameState.pendingGarbage)
      .fill(0)
      .map(_ => {
        const hole = Math.floor(Math.random() * COLS);
        const line = Array(COLS)
          .fill(0)
          .map(_ => Math.floor(Math.random() * pieces.length) + 1);
        line[hole] = 0;
        return line;
      });

    this._grid = this._grid
      .slice(this._gameState.pendingGarbage)
      .concat(garbageLines);
    this._gameState = {
      ...this._gameState,
      pendingGarbage: 0,
    };
  }

  _resetSeed(seed) {
    this._pieceGenerator.reset(seed);
  }
}

module.exports = Game;
