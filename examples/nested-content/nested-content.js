let playground = undefined;
let counter = 0;
let currentElement = undefined;

function checkEnv() {
  const cfn = window.cfn;
  if (!cfn) {
    alert('cf-neptune not found, please build the project and try again');
  }
}

function newContentElement() {  
  const cfn = window.cfn;
  counter++;
  const textElement = new cfn.Text('level: ' + counter);
  const newContent = new cfn.Content({ width: 200, height: 100 });
  newContent.content = textElement;
  return newContent;
}

function pushClick() {
  checkEnv();

  currentElement.content = newContentElement();
  currentElement = currentElement.content;
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnv();
  
  const cfn = window.cfn;
  const root = document.getElementById('playground');
  const element = newContentElement();
  playground = cfn.Playground.create(root, {width: 300, height: 100}, element);
  playground.layout();

  currentElement = element;
});
