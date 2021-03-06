import NEPAtom from './atom';
import NEPSequence from './sequence';
import configs from '../configs';
import { NEPElement, NEPSize, SVGHelper, NEPRect } from 'element';
import Defs from '../defs';

export default class NEPDecoratedAtom extends NEPAtom {
  constructor(
    public size: NEPSize,
    public decorator: NEPSequence,
    firstChild?: NEPElement,
  ) {
    super(size, firstChild);

    this.checkValueNotEmpty(decorator, 'decorators');
    if (decorator instanceof NEPSequence === false) {
      throw new Error('The argument "decorators" is not a NEPSequence');
    }

    // Set decorator style
    decorator.borderWidth = 0;
    decorator.backgroundColor = Defs.none;
    decorator.addingElementCallback = (_, child) => {
      child.textColor = configs.decoratorTextColor;
      child.backgroundColor = configs.decoratorFillColor;
    };

    this.rawElement().appendChild(decorator.rawElement());
    SVGHelper.labelElementInfo(this.rawElement(), 'decorated-atom');
  }

  layout(): NEPRect {
    SVGHelper.setPosition(this.decorator.rawElement(), 1, 1);
    const result = super.layout();

    // Because decorators are not added to the electron list, we need to manually call the layout method.
    this.decorator.layout();
    return result;
  }
}
