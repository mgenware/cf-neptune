import NEPAtom from './atom';
import { SVGHelper } from 'element';

export default function newPlayground(element: HTMLElement, atom: NEPAtom) {
  if (!element) {
    throw new Error('The argument "element" cannot be empty');
  }
  if (!atom) {
    throw new Error('The argument "atom" cannot be empty');
  }

  const playground = new NEPAtom(atom.size, atom);
  playground.borderWidth = 0;
  SVGHelper.labelElementInfo(playground.rawElement(), 'playground');

  element.appendChild(playground.rawElement());
  playground.layout();
  return playground;
}
