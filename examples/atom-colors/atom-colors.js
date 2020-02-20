let atomElement = undefined;

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

async function update() {
  window.checkEnv();
  await atomElement.setColorsAsync(getRandomColor(), getRandomColor());
}

document.addEventListener('DOMContentLoaded', () => {
  window.checkEnv();

  const nep = window.nep;
  const size = { width: 300, height: 100 };
  atomElement = new nep.Atom(size, 'Neptune');
  const root = document.getElementById('playground');

  nep.newPlayground(root, atomElement);
});
