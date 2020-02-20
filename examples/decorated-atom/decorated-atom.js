let element = undefined;
let decoratorCounter = 1;

async function pushFront() {
  await element.decorator.pushFrontAsync('🙉' + decoratorCounter++);
}
async function pushBack() {
  await element.decorator.pushBackAsync('🙉' + decoratorCounter++);
}
async function popFront() {
  await element.decorator.popFrontAsync();
}
async function popBack() {
  await element.decorator.popBackAsync();
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();

  const nep = window.nep;

  const size = { width: 300, height: 100 };
  const decoratorCount = 3;
  const decoratorSize = { width: 150, height: 50 };
  const decorator = new nep.Sequence(decoratorSize, decoratorCount, 'h', true);
  const atom = new nep.DecoratedAtom(size, decorator, 'Content');
  element = atom;

  const root = document.getElementById('playground');
  nep.newPlayground(root, atom);
});
