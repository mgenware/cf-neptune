let matrixElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROWS = 5;
const COLS = 5;

document.addEventListener('DOMContentLoaded', async () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const matrix = new nep.Matrix(SIZE, ROWS, COLS);
  nep.newPlayground(root, matrix);

  await matrix.set2DPointerAsync(1, 4, 'i');

  matrixElement = matrix;
});
