import NEAtom from './atom';
import { SVGHelper, NEPSize, NEPElement } from '../element';

export default class NEPPlayground extends NEAtom {
  static create(domElement: HTMLElement, size: NEPSize, element: NEPElement): NEPPlayground {
    if (!domElement) {
      throw new Error('The domElement is required');
    }
    if (!element) {
      throw new Error('The element is required');
    }

    const p = new NEPPlayground(size);
    p.appendChild(element);
    domElement.appendChild(p.rawElement());
    p.layout();
    return p;
  }

  private constructor(
    public size: NEPSize,
  ) {
    super(size);

    SVGHelper.setSize(this.rawElement(), size);
  }
}
