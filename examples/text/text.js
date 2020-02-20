let textElement = undefined;

function longStringClick() {
  window.checkEnv();
  textElement.content = 'This is a looooooooooooooooong string 🦁🦁🦁';
}

function shortStringClick() {
  window.checkEnv();
  textElement.content = 'A';
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();

  const nep = window.nep;
  // Create the text element
  textElement = new nep.Atom({ width: 300, height: 100 }, 'cf-neptune');
  const root = document.getElementById('playground');

  // Mount the text element to the playground
  nep.newPlayground(root, textElement);
});
