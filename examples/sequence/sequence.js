let playground = undefined;
let sequenceElement = undefined;

function newAtomElement() {
  const cfn = window.cfn;
  const textElement = new cfn.Text('🙈');
  const newContent = new cfn.Atom({ width: 50, height: 50 });
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
  
  const cfn = window.cfn;
  const root = document.getElementById('playground');
  const element = new cfn.Sequence({ width: 400, height: 100 }, 4, 'h');
  playground = cfn.Playground.create(root, {width: 400, height: 100}, element);
  playground.layout();

  sequenceElement = element;
});
