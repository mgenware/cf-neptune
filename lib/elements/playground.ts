import NEAtom from './atom';
import { SVGHelper, NESize, NEElement } from '../element';

export default class NEPlayground extends NEAtom {
  static create(domElement: HTMLElement, size: NESize, element: NEElement): NEPlayground {
    if (!domElement) {
      throw new Error('The domElement is required');
    }
    if (!element) {
      throw new Error('The element is required');
    }

    const p = new NEPlayground(size);
    p.appendChild(element);
    domElement.appendChild(p.rawElement());
    p.layout();
    return p;
  }

  private constructor(
    public size: NESize,
  ) {
    super(size);

    SVGHelper.setSize(this.rawElement(), size);
  }
}
