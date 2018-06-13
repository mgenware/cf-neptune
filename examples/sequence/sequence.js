let playground = undefined;
let sequenceElement = undefined;

function newAtomElement() {
  const nep = window.nep;
  const textElement = new nep.Text('🙈');
  const newContent = new nep.Atom({ width: 50, height: 50 });
  newContent.appendChild(textElement);
  return newContent;
}

function pushClick() {
  checkEnv();

  const newElement = newAtomElement();
  sequenceElement.push(newElement);
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = new nep.Sequence({ width: 400, height: 100 }, 4, 'h');
  playground = nep.Playground.create(root, {width: 400, height: 100}, element);
  playground.layout();

  sequenceElement = element;
});
