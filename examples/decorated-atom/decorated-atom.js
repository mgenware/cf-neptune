let playground = undefined;
let element = undefined;
let decoratorCounter = 1;

async function pushDecorator() {
  await element.decorators.pushBackAsync('🙉' + decoratorCounter++);
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
