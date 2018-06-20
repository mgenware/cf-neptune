import { NEPElement, SVGHelper, NEPSize, NEPPoint, EmptyPadding, AnimationHelper, NEPAnimationOptions } from '../element';
import NEPAtom from './atom';
import NEPText from './text';
import configs from '../configs';
import Defs from 'defs';

export default class NEPSequence extends NEPAtom {
  // Whether to disable scaling in child elements, useful when this sequence is used as a 2d-sequence.
  noElementScaling: boolean = false;

  private _slotWidth: number = 0;
  private _slotHeight: number = 0;

  private _elements: NEPElement[] = [];
  private _gridGroup: SVGGElement|null = null;
  private _girdLines: SVGGraphicsElement[] = [];

  get count(): number {
    return this._elements.length;
  }

  get firstChild(): NEPAtom|null {
    return this.child(0);
  }

  get lastChild(): NEPAtom|null {
    return this.child(this.count - 1);
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

  async pushFrontAsync(child: NEPElement, opt?: NEPAnimationOptions) {
    await this.insertAsync(0, child, opt);
  }

  async pushBackAsync(child: NEPElement, opt?: NEPAnimationOptions) {
    await this.insertAsync(this.count, child, opt);
  }

  async insertAsync(index: number, child: NEPElement, _opt?: NEPAnimationOptions) {
    // Check capacity
    if (this.count === this.capacity) {
      throw new Error('No more slot available');
    }
    // Check the child argument
    this.checkValueNotEmpty(child, 'child');
    if (typeof child === 'string') {
      child = new NEPText(child);
    }
    // Check the index argument
    // Note that this is insert, so index can be the end of the array.
    if (index < 0 || index > this.count) {
      throw new Error('Index out of range');
    }

    const opt = _opt || {};
    const duration = opt.duration || this.animationDuration;

    // (1) 0.2: shifting elements
    // (2) 0.8: showing the newly added element

    // #1 Shift elements behind the insert position
    const tasks: Array<Promise<void>> = [];
    for (let i = index; i < this.count; i++) {
      const subOpt = { ...opt };
      subOpt.duration = 0.2 * duration;
      tasks.push(this.shiftElement(i, i + 1, subOpt));
    }
    await Promise.all(tasks);

    const pt = this.startPointFromIndex(index);
    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);

    this._elements.splice(index, 0, wrappedElement);
    this.appendElectron(wrappedElement);

    // Show the inserted element
    opt.duration = duration * 0.8;
    await this.showElement(index, opt);
  }

  async popFrontAsync(opt?: NEPAnimationOptions) {
    await this.removeAsync(0, opt);
  }

  async popBackAsync(opt?: NEPAnimationOptions) {
    await this.removeAsync(this.count - 1, opt);
  }

  async removeAsync(index: number, _opt?: NEPAnimationOptions) {
    // Check capacity
    if (this.count === 0) {
      throw new Error('Sequence already empty');
    }
    // Check the index argument
    if (index < 0 || index >= this.count) {
      throw new Error('Index out of range');
    }

    const opt = _opt || {};
    const duration = opt.duration || this.animationDuration;

    // (1) 0.8: hiding the element to be removed
    // (2) 0.2: shifting elements

    // #1 Hide the inserted element
    const hideOpt = { ...opt };
    hideOpt.duration = duration * 0.8;
    await this.hideElement(index, hideOpt);

    // #2 Shift the remaining elements
    const tasks: Array<Promise<void>> = [];
    for (let i = index; i < this.count; i++) {
      const subOpt = { ...opt };
      subOpt.duration = 0.2 * duration;
      tasks.push(this.shiftElement(i, i - 1, subOpt));
    }
    await Promise.all(tasks);

    const wrappedAtom = this.child(index) as NEPAtom;
    this._elements.splice(index, 1);
    this.removeElectron(wrappedAtom);
  }

  child(index: number): NEPAtom|null {
    if (index < 0 || index >= this.count) {
      return null;
    }
    const atom = this._elements[index] as NEPAtom;
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
    const rootRaw = SVGHelper.createElement(Defs.g) as SVGGElement;
    SVGHelper.labelElementInfo(rootRaw, 'sequence-grid');
    this.rawElement().appendChild(rootRaw);
    this._gridGroup = rootRaw;

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
      this._gridGroup.appendChild(rawLine);
    }
  }

  // # Animations
  private async shiftElement(startIndex: number, endIndex: number, opt?: NEPAnimationOptions) {
    if (startIndex === endIndex) {
      return;
    }
    const endPoz = this.startPointFromIndex(endIndex);

    const element = this.child(startIndex) as NEPAtom;
    const rawElement = element.rawElement();

    const prop = this.orientation === 'h' ? 'x' : 'y';
    const props: {[_: string]: string} = {};
    props[prop] = endPoz[prop].toString();
    await this.animate(rawElement, props, opt);
  }

  private async showElement(index: number, _opt?: NEPAnimationOptions) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    const opt = _opt || {};
    if (opt.disabled) {
      rawElement.setAttribute(Defs.opacity, '1');
    } else {
      const duration = opt.duration || this.animationDuration;
      // (1) 0.2: opacity -> 1, bgColor -> highlighted
      // (2) 0.7: do nothing
      // (3) 0.1: bgColor restore

      // # 1
      const opacityTask = this.animate(
        rawElement,
        { opacity: 1.0 },
        { duration: duration * 0.2 },
      );
      const colorTask = element.setBackgroundAsync(
        configs.color.added,
        { duration: duration * 0.2 },
      );
      await Promise.all([opacityTask, colorTask]);

      // # 2
      await AnimationHelper.delay(0.7 * duration);

      // # 3
      await element.setBackgroundAsync(
        configs.color.normal,
        { duration: duration * 0.1 },
      );
    }
  }

  private async hideElement(index: number, _opt?: NEPAnimationOptions) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    const opt = _opt || {};
    if (opt.disabled) {
      rawElement.setAttribute(Defs.opacity, '0');
    } else {
      const duration = opt.duration || this.animationDuration;
      // (1) 0.2: bgColor -> highlighted
      // (2) 0.7: do nothing
      // (3) 0.1: bgColor restore, opacity -> 0

      // # 1
      await element.setBackgroundAsync(
        configs.color.removing,
        { duration: duration * 0.2 },
      );

      // # 2
      await AnimationHelper.delay(0.7 * duration);

      // # 3
      const opacityTask = this.animate(
        rawElement,
        { opacity: 0 },
        { duration: duration * 0.1 },
      );
      const colorTask = element.setBackgroundAsync(
        configs.color.normal,
        { duration: duration * 0.1 },
      );
      await Promise.all([opacityTask, colorTask]);
    }
  }
}
