let sequenceElement = undefined;
const SIZE = { width: 500, height: 100 };
const CAP = 5;

function newSequenceElement(index) {
  const num = index + 1;
  return new window.nep.Text(num + ' ' + '🙈'.repeat(num));
}

async function pushBackClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  await sequenceElement.pushBackAsync(newElement);
}

async function pushFrontClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  await sequenceElement.pushFrontAsync(newElement);
}

async function popBackClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  await sequenceElement.popBackAsync(newElement);
}

async function popFrontClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  await sequenceElement.popFrontAsync(newElement);
}

function pushBackSyncClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.pushBack(newElement);
}

function pushFrontSyncClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.pushFront(newElement);
}

function popBackSyncClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.popBack(newElement);
}

function popFrontSyncClick() {
  window.checkEnv();

  const newElement = newSequenceElement(sequenceElement.count);
  sequenceElement.popFront(newElement);
}

async function updateClick() {
  window.checkEnv();

  if (sequenceElement.count) {
    const randString = '⏰' + Date.now();
    await sequenceElement.lastElement.setContentAsync(randString);
  }
}

async function swapClick() {
  window.checkEnv();

  if (sequenceElement.count > 1) {
    await sequenceElement.swapAsync(0, sequenceElement.count - 1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Sequence(SIZE, CAP, 'h');
  nep.newPlayground(root, element);

  sequenceElement = element;
});
