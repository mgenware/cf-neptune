import { NEPElement, NEPPoint, NEPAnimationOptions, NEPSize, SVGHelper } from '../element';
import NEPAtom from './atom';
import NEPText from './text';
import Defs from '../defs';
import configs from '../configs';

export class NEPPointerInfo {
  constructor(
    public name: string,
    public position: string,
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
    let info = this.pointerInfoBy(pointerName);
    // Do nothing if the position is not changed
    if (info && info.position === position) {
      return;
    }

    let ptr: NEPAtom;
    if (!info) {
      // Create a new element if it hasn't been added
      ptr = this.createPointer(pointerName);
      this.appendChild(ptr);
      ptr.layout();
    } else {
      ptr = info.instance;

      // Remove the element from previous array
      const pointerInfoList = this.pointerInfoListAt(info.position) as NEPPointerInfo[];
      const pointerIndex = pointerInfoList.findIndex(item => item.name === pointerName);
      pointerInfoList.splice(pointerIndex, 1);

      const startPt = this.positionToPoint(info.position);
      // Layout previous array if needed
      for (let i = pointerIndex; i < pointerInfoList.length; i++) {
        const childEndPt = {
          x: startPt.x + i * this.pointerSize.width,
          y: startPt.y,
        };

        const target = pointerInfoList[i];
        SVGHelper.setPosition(target.instance.rawElement(), childEndPt.x, childEndPt.y);
      }
    }

    // Calculate the end position
    const endPt = this.positionToPoint(position);
    let destArray = this.pointerInfoListAt(position);
    if (!destArray) {
      destArray = [];
      this.setPointerInfoListAt(position, destArray);
    }
    const destArrLength = destArray.length;
    endPt.x += destArrLength * this.pointerSize.width;

    // Start the animation
    await this.animate(ptr.rawElement(), endPt, opt);

    // Update info
    info = new NEPPointerInfo(
      pointerName,
      position,
      ptr,
    );
    // Update pointerInfoList map
    destArray.push(info);
    // Update pointerInfo map
    this.setPointerInfoBy(pointerName, info);
  }

  protected pointerInfoBy(_name: string): NEPPointerInfo|null {
    throw new Error('Not implemented yet');
  }

  protected setPointerInfoBy(_name: string, _info: NEPPointerInfo) {
    throw new Error('Not implemented yet');
  }

  protected pointerInfoListAt(_position: string): NEPPointerInfo[]|null {
    throw new Error('Not implemented yet');
  }

  protected setPointerInfoListAt(_position: string, _value: NEPPointerInfo[]) {
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
