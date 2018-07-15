let matrixElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROWS = 5;
const COLS = 5;

document.addEventListener('DOMContentLoaded', async () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const matrix = new nep.Matrix(SIZE, ROWS + 1, COLS + 1);
  nep.newPlayground(root, matrix);

  matrix.fill(() => 0);

  const obstacles = [
    [2, 2],
    [3, 2],
    [4, 3],
  ];

  for (const obstacle of obstacles) {
    const cell = matrix.row(obstacle[0]).child(obstacle[1]);
    cell.content = -1;
    cell.backgroundColor = 'pink';
  }

  matrixElement = matrix;
});
