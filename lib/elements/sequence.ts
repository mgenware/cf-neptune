import { NEPElement, SVGHelper, NEPSize, NEPPoint, EmptyPadding, AnimationHelper, NEPAnimationOptions } from '../element';
import NEPAtom from './atom';
import configs from '../configs';
import Defs from 'defs';
import { coerceInputElement } from './helper';
import NEPDecoratedAtom from './decoratedAtom';
import NEPText from './text';

export default class NEPSequence extends NEPAtom {
  // Whether to disable scaling in child elements, useful when this sequence is used as a 2d-sequence.
  noElementScaling: boolean = false;

  addingChildCallback?: (sender: NEPSequence, child: NEPAtom) => void;
  removingChildCallback?: (sender: NEPSequence, child: NEPAtom) => void;

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
    this.background = configs.sequenceFillColor;

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

  async pushFrontAsync(value: any, opt?: NEPAnimationOptions) {
    await this.insertAsync(0, value, opt);
  }

  pushFront(value: any) {
    this.insert(0, value);
  }

  async pushBackAsync(value: any, opt?: NEPAnimationOptions) {
    await this.insertAsync(this.count, value, opt);
  }

  pushBack(value: any) {
    this.insert(this.count, value);
  }

  async insertAsync(index: number, value: any, opt?: NEPAnimationOptions) {
    const element = coerceInputElement(value);
    const duration = this.getDurationOption(opt);

    // Animation details:
    // (1) 0.2: shifting elements
    // (2) 0.8: showing the newly added element

    // #1 Shift elements behind the insert position
    const tasks: Array<Promise<void>> = [];
    for (let i = index; i < this.count; i++) {
      tasks.push(this.shiftElementAsync(i, i + 1, { duration: 0.2 * duration }));
    }
    await Promise.all(tasks);

    this.executeInsert(index, element);
    await this.showElementAsync(index, { duration: duration * 0.8 });
  }

  insert(index: number, value: any) {
    const element = coerceInputElement(value);

    for (let i = index; i < this.count; i++) {
      this.shiftElement(i, i + 1);
    }
    this.executeInsert(index, element);
    this.showElement(index);
  }

  async popFrontAsync(opt?: NEPAnimationOptions) {
    await this.removeAsync(0, opt);
  }

  popFront() {
    this.remove(0);
  }

  async popBackAsync(opt?: NEPAnimationOptions) {
    await this.removeAsync(this.count - 1, opt);
  }

  popBack() {
    this.remove(this.count - 1);
  }

  async removeAsync(index: number, opt?: NEPAnimationOptions) {
    this.validateRemove(index);
    const duration = this.getDurationOption(opt);

    // Animation details
    // (1) 0.8: hiding the element to be removed
    // (2) 0.2: shifting elements

    // #1 Hide the inserted element
    await this.hideElementAsync(index, { duration: duration * 0.8});

    // #2 Shift the remaining elements
    const tasks: Array<Promise<void>> = [];
    for (let i = index; i < this.count; i++) {
      tasks.push(this.shiftElementAsync(i, i - 1, { duration: 0.2 * duration }));
    }
    await Promise.all(tasks);

    this.executeRemove(index);
  }

  remove(index: number) {
    this.validateRemove(index);
    this.hideElement(index);
    for (let i = index; i < this.count; i++) {
      this.shiftElement(i, i - 1);
    }
    this.executeRemove(index);
  }

  async swapAsync(index1: number, index2: number, opt?: NEPAnimationOptions) {
    this.validateIndex(index1, 'index1');
    this.validateIndex(index2, 'index2');
    if (index1 === index2) {
      return;
    }

    const element1 = this.child(index1) as NEPAtom;
    const element2 = this.child(index2) as NEPAtom;
    const duration = this.getDurationOption(opt);

    const opt1 = { duration: 0.2 * duration };
    const originalTextColor1 = element1.textColor;
    const originalBackground1 = element1.background;
    const originalTextColor2 = element2.textColor;
    const originalBackground2 = element2.background;

    await Promise.all([
      element1.setColorsAsync(
        configs.swappingTextColor,
        configs.swappingFillColor,
        opt1,
      ),
      element2.setColorsAsync(
        configs.swappingTextColor,
        configs.swappingFillColor,
        opt1,
      ),
    ]);

    const opt2 = { duration: 0.7 * duration };
    await Promise.all([
      this.shiftElementAsync(index1, index2, opt2),
      this.shiftElementAsync(index2, index1, opt2),
    ]);

    const opt3 = { duration: duration * 0.1 };
    await Promise.all([
      element1.setColorsAsync(
        originalTextColor1,
        originalBackground1,
        opt3,
      ),
      element2.setColorsAsync(
        originalTextColor2,
        originalBackground2,
        opt3,
      ),
    ]);

    this.executeSwap(index1, index2);
  }

  child(index: number): NEPAtom|null {
    this.validateIndex(index);
    const atom = this._elements[index] as NEPAtom;
    return atom;
  }

  childContent(index: number): any {
    const child = this.child(index);
    if (child) {
      return child.content;
    }
    return undefined;
  }

  internalChild(index: number): NEPElement|null {
    const wrappedChild = this.child(index);
    if (wrappedChild === null) {
      return null;
    }
    return wrappedChild.firstElectron;
  }

  findByContent(content: any): number {
    for (let i = 0; i < this.count; i++) {
      const child = this.child(i) as NEPAtom;
      if (child.content === content) {
        return i;
      }
    }
    return -1;
  }

  // # Protected members
  protected createDecorator(): NEPSequence {
    const decorator = new NEPSequence(
      { width: this._slotWidth, height: this._slotWidth / 4},
      4,
      'h',
      true,
    );
    return decorator;
  }

  protected createPointer(name: string): NEPAtom {
    const pointer = new NEPAtom(
      { width: this._slotWidth, height: this._slotWidth / 4},
      new NEPText(name),
    );
    return pointer;
  }

  // # Private members
  private wrapElement(child: NEPElement): NEPAtom {
    const decorator = this.createDecorator();
    const atom = new NEPDecoratedAtom(
      { width: this._slotWidth, height: this._slotHeight },
      decorator,
      child,
    );
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
      const rawLine = SVGHelper.createElement(Defs.line) as SVGLineElement;
      SVGHelper.setStroke(rawLine, configs.normalBorderColor, 1);

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
  private shiftElement(startIndex: number, endIndex: number) {
    if (startIndex === endIndex) {
      return;
    }
    const endPoz = this.startPointFromIndex(endIndex);
    const element = this.child(startIndex) as NEPAtom;
    this.shiftRawElement(element.rawElement(), endPoz);
  }

  private shiftRawElement(element: SVGGraphicsElement, poz: NEPPoint) {
    const prop = this.orientation === 'h' ? 'x' : 'y';
    element.setAttribute(prop, poz[prop].toString());
  }

  private async shiftElementAsync(startIndex: number, endIndex: number, opt?: NEPAnimationOptions) {
    if (startIndex === endIndex) {
      return;
    }
    const endPoz = this.startPointFromIndex(endIndex);

    const element = this.child(startIndex) as NEPAtom;
    await this.shiftRawElementAsync(element.rawElement(), endPoz, opt);
  }

  private async shiftRawElementAsync(element: SVGGraphicsElement, poz: NEPPoint, opt: NEPAnimationOptions|undefined) {
    const prop = this.orientation === 'h' ? 'x' : 'y';
    const props: {[_: string]: string} = {};
    props[prop] = poz[prop].toString();
    await this.animate(element, props, opt);
  }

  private showElement(index: number) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    rawElement.setAttribute(Defs.opacity, '1');
  }

  private async showElementAsync(index: number, opt?: NEPAnimationOptions) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    const duration = this.getDurationOption(opt);
    // (1) 0.2: opacity -> 1, bgColor -> highlighted
    // (2) 0.7: do nothing
    // (3) 0.1: bgColor restore

    // # 1
    const opt1 = { duration: duration * 0.2 };
    const originalBackground = element.background;
    const originalTextColor = element.textColor;

    await Promise.all([
      this.animate(
        rawElement,
        { opacity: 1.0 }, opt1,
      ),
      element.setColorsAsync(
        configs.addedTextColor,
        configs.addedFillColor,
        opt1,
      ),
    ]);

    // # 2
    await AnimationHelper.delay(0.7 * duration);

    // # 3
    await element.setColorsAsync(
      originalTextColor,
      originalBackground,
      { duration: duration * 0.1 },
    );
  }

  private async hideElement(index: number) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    rawElement.setAttribute(Defs.opacity, '0');
  }

  private async hideElementAsync(index: number, opt?: NEPAnimationOptions) {
    const element = this.child(index) as NEPAtom;
    const rawElement = element.rawElement();

    const duration = this.getDurationOption(opt);
    // (1) 0.2: bgColor -> highlighted
    // (2) 0.7: do nothing
    // (3) 0.1: opacity -> 0

    // # 1
    await element.setColorsAsync(
      configs.removingTextColor,
      configs.removingFillColor,
      { duration: duration * 0.2 },
    );

    // # 2
    await AnimationHelper.delay(0.7 * duration);

    // # 3
    await this.animate(
      rawElement,
      { opacity: 0 },
      { duration: duration * 0.1 },
    );
  }

  // # Action helper
  private onAddingChild(child: NEPAtom) {
    if (this.addingChildCallback) {
      this.addingChildCallback(this, child);
    }
  }

  private onRemovingChild(child: NEPAtom) {
    if (this.removingChildCallback) {
      this.removingChildCallback(this, child);
    }
  }

  private executeInsert(index: number, child: NEPElement) {
    const pt = this.startPointFromIndex(index);
    const wrappedElement = this.wrapElement(child);
    const rawWrappedElement = wrappedElement.rawElement();
    SVGHelper.setPosition(rawWrappedElement, pt.x, pt.y);

    this.onAddingChild(wrappedElement);
    this._elements.splice(index, 0, wrappedElement);
    this.appendElectron(wrappedElement);
  }

  private validateRemove(index: number) {
    // Check capacity
    if (this.count === 0) {
      throw new Error('Sequence already empty');
    }
    // Check the index argument
    this.validateIndex(index);
  }

  private validateIndex(index: number, name = 'index') {
    if (index < 0 || index >= this.count) {
      throw new Error(`"The argument ${name}"(${index}) is out of range`);
    }
  }

  private executeRemove(index: number) {
    const wrappedAtom = this.child(index) as NEPAtom;
    this.onRemovingChild(wrappedAtom);
    this._elements.splice(index, 1);
    this.removeElectron(wrappedAtom);
  }

  private executeSwap(index1: number, index2: number) {
    const elements = this._elements;
    const t = elements[index1];
    elements[index1] = elements[index2];
    elements[index2] = t;
  }
}
