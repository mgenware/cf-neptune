import NEAtom from './atom';
import { SVGHelper, NEPSize, NEPElement } from '../element';

export default class NEPPlayground extends NEAtom {
  static create(domElement: HTMLElement, size: NEPSize, element: NEPElement): NEPPlayground {
    if (!domElement) {
      throw new Error('The domElement argument is required');
    }
    if (!element) {
      throw new Error('The element argument is required');
    }

    const p = new NEPPlayground(size, element);
    domElement.appendChild(p.rawElement());
    p.layout();
    return p;
  }

  private constructor(
    public size: NEPSize,
    firstChild?: NEPElement,
  ) {
    super(size, firstChild);

    SVGHelper.setSize(this.rawElement(), size);
    this.borderWidth = 0;
  }
}
