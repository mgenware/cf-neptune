import {
  NEPElement,
  NEPPoint,
  NEPAnimationOptions,
  NEPSize,
  SVGHelper,
  NewPadding,
} from '../element';
import NEPAtom from './atom';
import NEPText from './text';
import Defs from '../defs';
import configs from '../configs';

export interface NEPPointerFieldOptions extends NEPAnimationOptions {
  backgroundColor?: string;
  textColor?: string;
}

export class NEPPointerInfo {
  constructor(
    public key: string,
    public position: string,
    public instance: NEPAtom,
  ) {}
}

export class NEPPointerField extends NEPElement {
  private raw: SVGGElement;
  constructor(public pointerSize: NEPSize) {
    super();

    const raw = SVGHelper.createElement(Defs.g) as SVGGElement;
    SVGHelper.labelElementInfo(raw, 'pointer-field');
    this.raw = raw;
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  async setPointerAsync(
    position: string,
    key: string,
    text: string,
    opt: NEPPointerFieldOptions | undefined,
  ) {
    this.checkValueNotEmpty(key, 'key');
    this.checkValueNotEmpty(position, 'position');

    // Check whether it exists
    let info = this.pointerInfoBy(key);
    // Do nothing if the position is not changed
    if (info && info.position === position) {
      return;
    }

    let ptrAtom: NEPAtom;
    if (!info) {
      // Create a new element if it hasn't been added
      ptrAtom = this.createPointer(key);
      this.appendChild(ptrAtom);
      ptrAtom.layout();
    } else {
      ptrAtom = info.instance;

      // Remove the element from previous array
      const pointerInfoList = this.pointerInfoListAt(
        info.position,
      ) as NEPPointerInfo[];
      const pointerIndex = pointerInfoList.findIndex(item => item.key === key);
      pointerInfoList.splice(pointerIndex, 1);

      const startPt = this.positionToPoint(info.position);
      // Layout previous array if needed
      for (let i = pointerIndex; i < pointerInfoList.length; i++) {
        const childEndPt = {
          x: startPt.x + i * this.pointerSize.width,
          y: startPt.y,
        };

        const target = pointerInfoList[i];
        SVGHelper.setPosition(
          target.instance.rawElement(),
          childEndPt.x,
          childEndPt.y,
        );
      }
    }

    // Bring the pointer view to top
    SVGHelper.bringToTop(this.raw, ptrAtom.rawElement());

    // Calculate the end position
    const endPt = this.positionToPoint(position);
    let destArray = this.pointerInfoListAt(position);
    if (!destArray) {
      destArray = [];
      this.setPointerInfoListAt(position, destArray);
    }
    const destArrLength = destArray.length;
    endPt.x += destArrLength * this.pointerSize.width;

    // Apply pointer options
    if (opt) {
      if (opt.textColor) {
        ptrAtom.textColor = opt.textColor;
      }
      if (opt.backgroundColor) {
        ptrAtom.backgroundColor = opt.backgroundColor;
      }
    }

    // Start the animation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.animate(ptrAtom.rawElement(), endPt as any, opt);

    // Update pointer info
    info = new NEPPointerInfo(key, position, ptrAtom);

    // Update the content
    ptrAtom.content = text;
    // Update the pointerInfoList map
    destArray.push(info);
    // Update the pointerInfo map
    this.setPointerInfoBy(key, info);
  }

  protected pointerInfoBy(_name: string): NEPPointerInfo | null {
    throw new Error('Not implemented yet');
  }

  protected setPointerInfoBy(_name: string, _info: NEPPointerInfo) {
    throw new Error('Not implemented yet');
  }

  protected pointerInfoListAt(_position: string): NEPPointerInfo[] | null {
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
    atom.backgroundColor = configs.decoratorFillColor;
    atom.padding = NewPadding(configs.decoratorPadding);
    return atom;
  }

  private appendChild(child: NEPElement) {
    this.rawElement().appendChild(child.rawElement());
  }
}
