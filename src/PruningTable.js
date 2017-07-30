import { cartesian } from './tools';

class PruningTable {
  constructor(moveTables, moves = allMoves) {
    this.computePruningTable(moveTables, moves);
  }

  setPruningValue(index, value) {
     this.table[index >> 3] ^= (0xf ^ value) << ((index & 7) << 2);
  }

  getPruningValue(index) {
    return this.table[index >> 3] >> ((index & 7) << 2) & 0xf;
  }

  computePruningTable(moveTables, moves) {
    let size = moveTables.reduce((acc, obj) => acc * obj.size, 1);

    this.table = [];

    for (let i = 0; i < (size + 7) >> 3; i += 1) {
      this.table.push(-1);
    }

    let depth = 0, done = 0;

    const powers = [1];

    for (let i = 1; i < moveTables.length; i += 1) {
      powers.push(moveTables[i - 1].size * powers[i - 1]);
    }

    const permutations = cartesian(moveTables.map(data => data.solvedIndexes));

    for (let i = 0; i < permutations.length; i += 1) {
      let index = 0;

      for (let j = 0; j < permutations[i].length; j += 1) {
        index += powers[j] * permutations[i][j];
      }

      this.setPruningValue(index, 0);

      done += 1;
    }

    while (done !== size) {
      const inverse = done > size / 2;
      const find = inverse ? 0xf : depth;
      const check = inverse ? depth : 0xf;

      depth += 1;

      let value = 0;

      for (let index = 0; index < size; index += 1) {
        if (this.getPruningValue(index) !== find) {
          continue;
        }

        for (let moveIndex = 0; moveIndex < moves.length; moveIndex += 1) {
          const move = moves[moveIndex];

          let currentIndex = index, position = 0;

          for (let i = powers.length - 1; i >= 0; i -= 1) {
            position += powers[i] * moveTables[i].doMove(Math.floor(currentIndex / powers[i]), move);
            currentIndex = currentIndex % powers[i];
          }

          if (this.getPruningValue(position) !== check) {
            continue;
          }

          done += 1;

          if (inverse) {
            this.setPruningValue(index, depth);
            break;
          }

          this.setPruningValue(position, depth);
        }
      }
    }
  }
}

export default PruningTable;