import { NEPElement, SVGHelper, NEPSize, NEPPoint } from '../element';
import NEAtom from './atom';
import NEPAtom from './atom';

export default class NEPSequence extends NEAtom {
  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  get count(): number {
    return this.childrenCount;
  }

  constructor(
    public maxSize: NEPSize,
    public capacity: number,
    public orientation: 'h'|'v',
  ) {
    super(maxSize);
    this.disableScaling = true;
    this.padding = 0;

    if (orientation !== 'h' && orientation !== 'v') {
      throw new Error('orientation can only be "h" or "v"');
    }

    if (orientation === 'h') {
      this._slotWidth = maxSize.width / capacity;
      this._slotHeight = maxSize.height;
    } else {
      this._slotWidth = maxSize.width;
      this._slotHeight = maxSize.height / capacity;
    }

  }

  push(child: NEPElement) {
    console.log(this.childrenCount, this.capacity);
    if (this.childrenCount === this.capacity) {
      throw new Error('No more slot available');
    }
    const pt = this.pointFromIndex(this.childrenCount);
    console.log(pt);

    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);
    this.appendChild(wrappedElement);
  }

  private wrapElement(child: NEPElement): NEPAtom {
    const atom = new NEPAtom({ width: this._slotWidth, height: this._slotHeight });
    atom.appendChild(child);
    return atom;
  }

  private pointFromIndex(index: number): NEPPoint {
    if (this.orientation === 'h') {
      return { x: index * this._slotWidth, y: 0 };
    }
    return { x: 0, y: index * this._slotHeight };
  }
}
