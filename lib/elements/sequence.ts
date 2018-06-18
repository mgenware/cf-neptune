import { NEPElement, SVGHelper, NEPSize, NEPPoint, EmptyPadding } from '../element';
import NEAtom from './atom';
import NEPAtom from './atom';
import NEPText from './text';

export default class NEPSequence extends NEAtom {
  // Whether to disable scaling in child elements, useful when this sequence is used as a 2d-sequence.
  noElementScaling: boolean = false;

  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  private _elements: NEPElement[] = [];
  private _girdLines: SVGGraphicsElement[] = [];

  get count(): number {
    return this._elements.length;
  }

  constructor(
    public maxSize: NEPSize,
    public capacity: number,
    public orientation: 'h'|'v',
    public noGrid?: boolean,
  ) {
    super(maxSize);

    // Disable auto-scaling of Atom element
    this.noScaling = true;
    this.padding = EmptyPadding;

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

    if (!this.noGrid) {
      this.drawGrid();
    }
    SVGHelper.labelElementInfo(this.rawElement(), 'sequence');
  }

  push(child: NEPElement) {
    if (!child) {
      throw new Error('The child argument cannot be null');
    }
    if (this.electronsCount === this.capacity) {
      throw new Error('No more slot available');
    }
    if (typeof child === 'string') {
      child = new NEPText(child);
    }

    const pt = this.startPointFromIndex(this.electronsCount);

    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);

    this._elements.push(wrappedElement);
    this.appendElectron(wrappedElement);
  }

  child(index: number): NEAtom|null {
    if (index < 0 || index >= this.count) {
      return null;
    }
    const atom = this._elements[index] as NEAtom;
    return atom;
  }

  internalChild(index: number): NEPElement|null {
    const wrappedChild = this.child(index);
    if (wrappedChild === null) {
      return null;
    }
    return wrappedChild.firstElectron;
  }

  private wrapElement(child: NEPElement): NEPAtom {
    const atom = new NEPAtom({ width: this._slotWidth, height: this._slotHeight }, child);
    atom.noScaling = this.noElementScaling;
    if (atom.noScaling) {
      // if scaling is disabled, padding will be cleared
      atom.padding = EmptyPadding;
    }
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

      this._girdLines.push(rawLine);
      this.rawElement().appendChild(rawLine);
    }
  }
}
