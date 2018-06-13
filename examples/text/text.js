let playground = undefined;
let textElement = undefined;

function longStringClick() {
  checkEnv();
  textElement.text = 'This is a looooooooooooooooong string 🦁🦁🦁';
}

function shortStringClick() {
  checkEnv();
  textElement.text = 'A';
}

document.addEventListener('DOMContentLoaded', () => {
  checkEnv();
  
  const cfn = window.cfn;
  // Create the text element
  textElement = new cfn.Text('cf-neptune');
  const root = document.getElementById('playground');

  // Mount the text element to playground
  playground = cfn.Playground.create(root, {width: 300, height: 100}, textElement);
  playground.layout();
});
