let playground = undefined;
let counter = 0;
let currentElement = undefined;

function newAtomElement() {
  const nep = window.nep;
  counter++;
  const textElement = new nep.Text('level: ' + counter);
  const newContent = new nep.Atom({ width: 300, height: 100 }, textElement);
  return newContent;
}

function pushClick() {
  window.checkEnv();

  const newElement = newAtomElement();
  currentElement.appendElectron(newElement);
  currentElement = newElement;
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  const root = document.getElementById('playground');
  const element = newAtomElement();
  playground = nep.Playground.create(root, {width: 300, height: 100}, element);
  playground.layout();

  currentElement = element;
});
