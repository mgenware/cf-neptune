import NEPAtom from './atom';
import NEPSequence from './sequence';
import { NEPElement, NEPSize, SVGHelper } from 'element';

export default class DecoratedAtom extends NEPAtom {
  constructor(
    public size: NEPSize,
    public decorators: NEPSequence,
    firstChild?: NEPElement,
  ) {
    super(size, firstChild);

    this.checkValueNotEmpty(decorators, 'decorators');
    if (decorators instanceof NEPSequence === false) {
      throw new Error('The decorators argument is not a NEPSequence');
    }

    // Set top padding to the height of decorator element
    this.padding.top = decorators.size.height;
    this.rawElement().appendChild(decorators.rawElement());
    SVGHelper.labelElementInfo(this.rawElement(), 'decorated-atom');
  }

  layout(): SVGRect {
    const result = super.layout();
    SVGHelper.setPosition(this.decorators.rawElement(), 1, 1);

    return result;
  }
}
