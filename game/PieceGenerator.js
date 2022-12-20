const MersenneTwister = require('mersenne-twister');
const pieces = require('./pieces');
const { copy } = require('./util');

// Picks pieces completely randomly
class BasePieceGenerator {
  constructor(seed) {
    this._randGenerator = new MersenneTwister(seed);
  }

  reset(seed) {
    this._randGenerator = new MersenneTwister(seed);
  }

  nextPiece() {
    return copy(pieces[this._randInt(0, pieces.length)]);
  }

  // generates a random int in the range [min, max) based on the
  // seeded random generator
  _randInt(min, max) {
    const range = max - min;
    return min + Math.floor(this._randGenerator.random() * range);
  }
}

/*
 * Shuffles the 7 pieces in a "bag" and doles them out one by one
 * until the bag is empty, then starts over. Prevents droughts.
 */
class BagGenerator extends BasePieceGenerator {
  constructor(seed) {
    super(seed);
    this._bag = [];
    this._fillBag();
  }

  reset(seed) {
    super.reset(seed);
    this._bag = [];
    this._fillBag();
  }

  _fillBag() {
    this._bag = [];
    for (let i = 0; i < pieces.length; i++) {
      this._bag.push(copy(pieces[i]));
    }
    this._shuffleBag();
  }

  // Use fisher-yates shuffle algorithm:
  // https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
  _shuffleBag() {
    for (let i = this._bag.length - 1; i >= 0; i--) {
      const j = this._randInt(0, i + 1);
      const temp = this._bag[j];
      this._bag[j] = this._bag[i];
      this._bag[i] = temp;
    }
  }

  nextPiece() {
    if (this._bag.length == 0) {
      this._fillBag();
    }
    return this._bag.pop();
  }
}

module.exports = BagGenerator;
