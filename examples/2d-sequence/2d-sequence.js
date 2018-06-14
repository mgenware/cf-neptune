let playground = undefined;
let sequenceElement = undefined;
let lastRowElement = undefined;
const SIZE = { width: 500, height: 500 };
const ROW_SIZE = { width: 500, height: 100 };
const CAP = 5;

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

  const element = newColumn(lastRowElement.count - 1);
  lastRowElement.push(element);
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Sequence(SIZE, CAP, 'v');
  playground = nep.Playground.create(root, SIZE, element);
  playground.layout();

  sequenceElement = element;
});
