const MersenneTwister = require('mersenne-twister');
const pieces = require('./pieces');
const {copy} = require('./util');

class BasePieceGenerator {
  constructor(seed) {
    this._randGenerator = new MersenneTwister(seed);
  }

  nextPiece() {
    return copy(pieces[Math.floor(this._randGenerator.random() * pieces.length)]);
  }
}

module.exports = BasePieceGenerator;
