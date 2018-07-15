let matrixElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROWS = 5;
const COLS = 5;

// Obstacle (-1) should be counted as 0 possible path.
function getCellValue(value) {
  if (value <= 0) {
    return 0;
  }
  return value;
}

document.addEventListener('DOMContentLoaded', async () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const matrix = new nep.Matrix(SIZE, ROWS + 1, COLS + 1);
  nep.newPlayground(root, matrix);

  matrix.fill(() => 0);

  // Set obstacles
  const obstacles = [
    [1, 2],
    [3, 2],
    [4, 3],
  ];
  for (const obstacle of obstacles) {
    const cell = matrix.cell(obstacle[0], obstacle[1]);
    cell.content = -1;
    cell.backgroundColor = 'pink';
  }

  // Set boundary rows color
  for (let i = 0; i <= ROWS; i++) {
    matrix.cell(i, COLS).backgroundColor = 'gray';
  }
  for (let i = 0; i <= COLS; i++) {
    matrix.cell(ROWS, i).backgroundColor = 'gray';
  }

  // Set destination to 1
  const destCell = matrix.cell(ROWS - 1, COLS - 1);
  destCell.content = 1;
  destCell.backgroundColor = 'red';

  matrix.cell(ROWS, COLS - 1).content = 1;
  for (let i = ROWS - 1; i >= 0; i--) {
    await matrix.set2DPointerAsync(i, 0, 'i');
    for (let j = COLS - 1; j >= 0; j--) {
      await matrix.set2DPointerAsync(i, j, 'j');

      const cell = matrix.cell(i, j);
      if (cell.content !== -1) {
        const value = getCellValue(matrix.cellContent(i, j + 1)) + getCellValue(matrix.cellContent(i + 1, j));
        cell.setContentAsync(value);
      }
    }
  }

  matrixElement = matrix;
});
