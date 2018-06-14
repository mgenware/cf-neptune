let playground = undefined;
let sequenceElement = undefined;
const SIZE = { width: 500, height: 100 };
const CAP = 5;

function newSequenceElement(index) {
  return new window.nep.Text('🙈' + index);
}

function pushClick() {
  checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.push(newElement);
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Sequence(SIZE, CAP, 'h');
  playground = nep.Playground.create(root, SIZE, element);
  playground.layout();

  sequenceElement = element;
});
