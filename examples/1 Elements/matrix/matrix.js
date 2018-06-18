let playground = undefined;
let matrixElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROWS = 5;
const COLS = 5;

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const matrix = new nep.Matrix(SIZE, ROWS, COLS);
  playground = nep.Playground.create(root, SIZE, matrix);

  // populate the matrix
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      // push a random string
      matrix.row(i).push('🙈'.repeat(j + 1) + i + j);
    }
  }

  matrixElement = matrix;
});
