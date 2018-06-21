let playground = undefined;
let element = undefined;
let decoratorCounter = 1;

async function pushFront() {
  await element.decorators.pushFrontAsync('🙉' + decoratorCounter++);
}
async function pushBack() {
  await element.decorators.pushBackAsync('🙉' + decoratorCounter++);
}
async function popFront() {
  await element.decorators.popFrontAsync();
}
async function popBack() {
  await element.decorators.popBackAsync();
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;

  const size = { width: 300, height: 100 };
  const decoratorsCount = 3;
  const decoratorsSize = { width: 150, height: 50 };
  const decorators = new nep.Sequence(decoratorsSize, decoratorsCount, 'h', true);
  const atom = new nep.DecoratedAtom(size, decorators, 'Content');
  element = atom;

  const root = document.getElementById('playground');
  playground = nep.Playground.create(root, size, atom);
});
