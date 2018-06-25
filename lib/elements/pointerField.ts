import { NEPElement, NEPPoint, NEPAnimationOptions, NEPSize, SVGHelper } from '../element';
import NEPAtom from './atom';
import NEPText from './text';
import Defs from '../defs';
import configs from '../configs';

export class NEPPointerInfo {
  constructor(
    public name: string,
    public position: string,
    public arrayIndex: number,
    public instance: NEPAtom,
  ) { }
}

export class NEPPointerField extends NEPElement {
  private raw: SVGGElement;
  constructor(
    public pointerSize: NEPSize,
  ) {
    super();

    const raw = SVGHelper.createElement(Defs.g) as SVGGElement;
    SVGHelper.labelElementInfo(raw, 'pointer-field');
    this.raw = raw;
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  async setPointerAsync(pointerName: string, position: string, opt: NEPAnimationOptions|undefined) {
    this.checkValueNotEmpty(pointerName, 'pointer');
    this.checkValueNotEmpty(position, 'position');

    // Check whether it exists
    let info = this.pointerInfo(pointerName);
    // Do nothing if the position is not changed
    if (info && info.position === position) {
      return;
    }

    let ptr: NEPAtom;
    if (!info) {
      // Create a new element if it hasn't been added
      ptr = this.createPointer(pointerName);
      this.appendChild(ptr);
    } else {
      ptr = info.instance;

      // Remove the element from previous array
      const arr = this.pointerInfoList(pointerName) as NEPPointerInfo[];
      arr.splice(info.arrayIndex);

      const startPt = this.positionToPoint(info.position);
      // Layout previous array if needed
      for (let i = info.arrayIndex; i < arr.length; i++) {
        const childEndPt = {
          x: startPt.x + i * this.pointerSize.width,
          y: startPt.y,
        };

        const target = arr[i];
        SVGHelper.setPosition(target.instance.rawElement(), childEndPt.x, childEndPt.y);

        // Update the pointerInfo
        target.arrayIndex = i;
      }
    }

    // Calculate the end position
    const endPt = this.positionToPoint(position);
    let destArray = this.pointerInfoList(position);
    if (!destArray) {
      destArray = [];
      this.setPointerInfoList(position, destArray);
    }
    const destArrLength = destArray.length;
    endPt.x += destArrLength * this.pointerSize.width;

    // Start the animation
    await this.animate(ptr.rawElement(), endPt, opt);

    // Update info
    info = new NEPPointerInfo(
      name,
      position,
      destArrLength,
      ptr,
    );
    // Update pointerInfoList map
    destArray.push(info);
    // Update pointerInfo map
    this.setPointerInfo(name, info);
  }

  protected pointerInfo(_name: string): NEPPointerInfo|null {
    throw new Error('Not implemented yet');
  }

  protected setPointerInfo(_name: string, _info: NEPPointerInfo) {
    throw new Error('Not implemented yet');
  }

  protected pointerInfoList(_name: string): NEPPointerInfo[]|null {
    throw new Error('Not implemented yet');
  }

  protected setPointerInfoList(_name: string, _value: NEPPointerInfo[]) {
    throw new Error('Not implemented yet');
  }

  protected positionToPoint(_: string): NEPPoint {
    throw new Error('Not implemented yet');
  }

  protected createPointer(name: string): NEPAtom {
    const atom = new NEPAtom(this.pointerSize, new NEPText(name));
    atom.textColor = configs.decoratorTextColor;
    atom.background = configs.decoratorFillColor;
    return atom;
  }

  private appendChild(child: NEPElement) {
    this.rawElement().appendChild(child.rawElement());
  }
}
