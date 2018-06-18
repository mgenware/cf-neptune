let playground = undefined;
let sequenceElement = undefined;
const SIZE = { width: 500, height: 100 };
const CAP = 5;

function newSequenceElement(index) {
  const num = index + 1;
  return new window.nep.Text(num + ' ' + '🙈'.repeat(num));
}

function pushClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.push(newElement);
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Sequence(SIZE, CAP, 'h');
  playground = nep.Playground.create(root, SIZE, element);

  sequenceElement = element;
});
