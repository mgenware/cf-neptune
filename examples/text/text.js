let playground = undefined;
let textElement = undefined;

function longStringClick() {
  window.checkEnv();
  textElement.text = 'This is a looooooooooooooooong string 🦁🦁🦁';
}

function shortStringClick() {
  window.checkEnv();
  textElement.text = 'A';
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();
  
  const nep = window.nep;
  // Create the text element
  textElement = new nep.Text('cf-neptune');
  const root = document.getElementById('playground');

  // Mount the text element to playground
  playground = nep.Playground.create(root, {width: 300, height: 100}, textElement);
  playground.borderWidth = '1px';
  playground.layout();
});
