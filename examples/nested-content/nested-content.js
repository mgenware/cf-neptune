let playground = undefined;
let counter = 0;
let currentElement = undefined;

function checkEnv() {
  const cfn = window.cfn;
  if (!cfn) {
    alert('cf-neptune not found, please build the project and try again');
  }
}

function newAtomElement() {  
  const cfn = window.cfn;
  counter++;
  const textElement = new cfn.Text('level: ' + counter);
  const newContent = new cfn.Atom({ width: 300, height: 100 });
  newContent.appendChild(textElement);
  return newContent;
}

function pushClick() {
  checkEnv();

  const newElement = newAtomElement();
  currentElement.appendChild(newElement);
  currentElement = newElement;
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnv();
  
  const cfn = window.cfn;
  const root = document.getElementById('playground');
  const element = newAtomElement();
  playground = cfn.Playground.create(root, {width: 300, height: 100}, element);
  playground.layout();

  currentElement = element;
});
