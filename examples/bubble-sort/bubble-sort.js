let sequenceElement = undefined;

document.addEventListener('DOMContentLoaded', async () => {
  window.checkEnv();

  const nep = window.nep;
  const root = document.getElementById('playground');

  const nums = [3, 4, 10, 2, 7, 1, 9];
  const element = new nep.Sequence(
    { width: 100 * nums.length, height: 100 },
    nums.length,
    'h',
  );
  nep.newPlayground(root, element);

  for (const num of nums) {
    element.pushBack(num);
  }

  const n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    await element.setPointerAsync(i, 'i');
    await element.setPointerAsync(n - 2, 'i\'', { backgroundColor: 'orange' });
    for (let j = 0; j < n - i - 1; j++) {
      await element.setPointerAsync(j, 'j');
      await element.setPointerAsync(n - i - 2, 'j\'', { backgroundColor: 'orange' });
      if (element.childContent(j) > element.childContent(j + 1)) {
        await element.swapAsync(j, j + 1);
      }
    }
  }

  sequenceElement = element;
});
