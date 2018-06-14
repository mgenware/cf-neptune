let playground = undefined;
let sequenceElement = undefined;
let lastRowElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROWS = 5;
const COLS = 5;

function newColumn(index) {
  const num = index + 1;
  return new window.nep.Text(num + ' ' + '🙈'.repeat(num));
}

function newRow() {
  const seq = new window.nep.Sequence(ROW_SIZE, CAP, 'h');
  seq.push(newColumn(0));
  return seq;
}

function pushRowClick() {
  window.checkEnv();

  const newElement = newRow(sequenceElement.count);
  sequenceElement.push(newElement);
  lastRowElement = newElement;
}

function pushColClick() {
  window.checkEnv();

  const element = newColumn(lastRowElement.count);
  lastRowElement.push(element);
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Matrix(SIZE, ROWS, COLS);
  playground = nep.Playground.create(root, SIZE, element);
  playground.layout();

  sequenceElement = element;
});
