import { NEElement, SVGHelper, NESize, NEPoint } from '../element';
import NEAtom from './atom';

export default class NESequence extends NEAtom {
  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  constructor(
    public maxSize: NESize,
    public capacity: number,
    public orientation: 'h'|'v',
  ) {
    super(maxSize);

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

  push(child: NEElement) {
    if (this.childrenCount === this.capacity) {
      throw new Error('No more slot available');
    }
    const pt = this.pointFromIndex(this.childrenCount);
    this.appendChild(child);
    SVGHelper.setPosition(child.rawElement(), pt.x, pt.y);
  }

  private pointFromIndex(index: number): NEPoint {
    if (this.orientation === 'h') {
      return { x: index * this._slotWidth, y: 0 };
    }
    return { x: 0, y: index * this._slotHeight };
  }
}
