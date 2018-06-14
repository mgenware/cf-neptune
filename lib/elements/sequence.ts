import { NEPElement, SVGHelper, NEPSize, NEPPoint } from '../element';
import NEAtom from './atom';
import NEPAtom from './atom';

export default class NEPSequence extends NEAtom {
  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  private _elements: NEPElement[] = [];

  get count(): number {
    return this._elements.length;
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

    this.drawGrid();
  }

  push(child: NEPElement) {
    if (this.electronsCount === this.capacity) {
      throw new Error('No more slot available');
    }
    const pt = this.startPointFromIndex(this.electronsCount);

    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);

    this._elements.push(wrappedElement);
    this.appendElectron(wrappedElement);
  }

  childAt(index: number): NEPElement|null {
    if (index < 0 || index >= this.count) {
      return null;
    }
    // child is a wrapped element, need to unwrap the content
    const atom = this._elements[index] as NEAtom;
    return atom.firstElectron;
  }

  private wrapElement(child: NEPElement): NEPAtom {
    const atom = new NEPAtom({ width: this._slotWidth, height: this._slotHeight }, child);
    atom.borderRadius = 0;
    atom.borderWidth = 0;
    return atom;
  }

  private startPointFromIndex(index: number): NEPPoint {
    if (this.orientation === 'h') {
      return { x: index * this._slotWidth, y: 0 };
    }
    return { x: 0, y: index * this._slotHeight };
  }

  private drawGrid() {
    for (let i = 1; i < this.capacity; i++) {
      const rawLine = SVGHelper.createElement('line') as SVGLineElement;
      SVGHelper.setStroke(rawLine, '#808080', 1);

      const startPt = this.startPointFromIndex(i);
      const endPt: NEPPoint = { ...startPt };
      if (this.orientation === 'h') {
        endPt.y = this._slotHeight;
      } else {
        endPt.x = this._slotWidth;
      }
      SVGHelper.setLinePoz(rawLine, startPt, endPt);

      this.rawElement().appendChild(rawLine);
    }
  }
}
