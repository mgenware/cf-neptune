import { NEPElement, SVGHelper, NEPSize, NEPPoint } from '../element';
import NEAtom from './atom';
import NEPAtom from './atom';

export default class NEPSequence extends NEAtom {
  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  get count(): number {
    return this.electronsCount;
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
    if (this.electronsCount === this.capacity) {
      throw new Error('No more slot available');
    }
    const pt = this.pointFromIndex(this.electronsCount);

    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);
    this.appendElectron(wrappedElement);
  }

  childAt(index: number): NEPElement|null {
    const child = this.electronAt(index);
    if (child === null) {
      return null;
    }
    // child is a wrapped element, need to unwrap the content
    const atom = child as NEPAtom;
    return atom.firstElectron;
  }

  private wrapElement(child: NEPElement): NEPAtom {
    const atom = new NEPAtom({ width: this._slotWidth, height: this._slotHeight }, child);
    atom.borderRadius = 0;
    return atom;
  }

  private pointFromIndex(index: number): NEPPoint {
    if (this.orientation === 'h') {
      return { x: index * this._slotWidth, y: 0 };
    }
    return { x: 0, y: index * this._slotHeight };
  }
}
