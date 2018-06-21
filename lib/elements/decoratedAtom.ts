import NEPAtom from './atom';
import NEPSequence from './sequence';
import configs from '../configs';
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

    // Set decorators' style
    decorators.borderWidth = 0;
    decorators.addingChildCallback = (element) => {
      element.setTextColor(configs.decoratorTextColor);
      element.background = configs.decoratorFillColor;
    };

    this.rawElement().appendChild(decorators.rawElement());
    SVGHelper.labelElementInfo(this.rawElement(), 'decorated-atom');
  }

  layout(): SVGRect {
    SVGHelper.setPosition(this.decorators.rawElement(), 1, 1);
    const result = super.layout();

    // Because decorators are not added to the electron list, we need to manually call the layout method.
    this.decorators.layout();
    return result;
  }
}
