import { NEPElement, SVGHelper, NEPSize, NEPPadding, NewPadding, NewRectFromSize } from '../element';
import NEPText from './text';

const DefaultBorderWidth  = 1;
const DefaultRadius       = 0;
const DefaultPadding      = 5;
const DefaultBorderColor  = '#808080';
const DefaultBackground   = 'none';

export default class NEPAtom extends NEPElement {
  noScaling: boolean = false;
  loaded: boolean = false;

  // rawRoot is the outermost SVGElement of this element, therefor it contains all other child SVGElements.
  private rawRoot: SVGSVGElement;
  // rawContains is the element used to hold content elements, it defines the area inside this element's border and padding.
  private rawContainer: SVGSVGElement;
  // rawBorder is the SVGRectElement used to define borders of this element.
  private rawBorder: SVGRectElement;

  private _padding: NEPPadding = NewPadding(DefaultPadding, DefaultPadding, DefaultPadding, DefaultPadding);
  private _borderColor: string = DefaultBorderColor;
  private _borderWidth: number|string = DefaultBorderWidth;
  private _borderRadius: number = DefaultRadius;

  // _electrons contains the internal NEPElements that are added to the content(rawContainer) element.
  private _electrons: NEPElement[] = [];

  constructor(
    public size: NEPSize,
    content?: NEPElement,
  ) {
    super();
    this.checkValueNotEmpty(size, 'size');

    const rawRoot = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.setSize(rawRoot, size);
    // Root <svg>'s viewBox will always be the size passed in, container <svg>'s viewBox will be resolved in layout().
    SVGHelper.setViewBox(rawRoot, NewRectFromSize(0, 0, size));
    this.rawRoot = rawRoot;

    const rawBorder = SVGHelper.createElement('rect') as SVGRectElement;
    rawBorder.setAttribute('stroke', this.borderColor);
    rawBorder.setAttribute('rx', `${this.borderRadius}`);
    rawBorder.setAttribute('ry', `${this.borderRadius}`);
    rawBorder.setAttribute('stroke-width', `${this.borderWidth}`);
    rawRoot.appendChild(rawBorder);
    this.rawBorder = rawBorder;

    const rawContainer = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.labelElementInfo(rawContainer, 'atom-content');
    rawRoot.appendChild(rawContainer);
    this.rawContainer = rawContainer;

    // Auto-convert a string content to NEPText
    if (typeof content === 'string') {
      content = new NEPText(content);
    }
    if (content) {
      this.appendElectron(content);
    }

    this.background = DefaultBackground;
    SVGHelper.labelElementInfo(this.rawElement(), 'atom');
  }

  // padding property
  get padding(): NEPPadding {
    return this._padding;
  }
  set padding(value: NEPPadding) {
    this.checkValueNotEmpty(value);
    this._padding = value;
    this.layoutIfNeeded();
  }

  // border-color property
  get borderColor(): string {
    return this._borderColor;
  }
  set borderColor(value: string) {
    this.checkValueNotEmpty(value);
    this._borderColor = value;
    this.rawBorder.setAttribute('stroke', value);
  }

  // border-width
  get borderWidth(): number|string {
    return this._borderWidth;
  }
  set borderWidth(value: number|string) {
    this._borderWidth = value;
    this.rawBorder.setAttribute('stroke-width', `${value}`);
  }

  // border-radius
  get borderRadius(): number {
    return this._borderRadius;
  }
  set borderRadius(value: number) {
    this._borderRadius = value;
    this.rawBorder.setAttribute('stroke-radius', `${value}`);
  }

  get background(): string {
    return this.rawBorder.getAttribute('fill') || '';
  }
  set background(value: string) {
    this.rawBorder.setAttribute('fill', value);
  }

  // ------- Child-related props -------
  get firstElectron(): NEPElement|null {
    if (this._electrons.length) {
      return this._electrons[0];
    }
    return null;
  }

  get lastElectron(): NEPElement|null {
    if (this._electrons.length) {
      return this._electrons[this._electrons.length - 1];
    }
    return null;
  }

  get electrons(): NEPElement[] {
    return this._electrons;
  }

  electronAt(index: number): NEPElement|null {
    if (index < 0 || index >= this._electrons.length) {
      return null;
    }
    return this._electrons[index];
  }

  rawElement(): SVGGraphicsElement {
    return this.rawRoot;
  }

  layout(): SVGRect {
    this.loaded = true;

    const { rawContainer, size, padding, rawBorder } = this;
    const rootRect = {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };

    // Remove the 'viewBox' attribute to get consistent values from getBBox()
    rawContainer.removeAttribute('viewBox');

    // Border
    SVGHelper.setRect(rawBorder, SVGHelper.rectInset(rootRect, DefaultBorderWidth, DefaultBorderWidth));

    // Container
    SVGHelper.setRect(rawContainer, SVGHelper.rectInsetEx(rootRect, padding));

    // Layout children
    for (const child of this._electrons) {
      child.layout();
    }

    // Get the bounding box
    const contentLayoutRect = rawContainer.getBBox();

    // Set the viewBox
    SVGHelper.setViewBox(rawContainer, this.noScaling ? rootRect : contentLayoutRect);
    return rootRect;
  }

  // ------- Children manipulations -------
  get electronsCount(): number {
    return this._electrons.length;
  }

  appendElectron(child: NEPElement) {
    this.checkValueNotEmpty(child, 'child');
    this.checkIsElement(child, 'child');

    this._electrons.push(child);
    this.rawContainer.appendChild(child.rawElement());
    this.onChildAdded(child);
    this.layoutIfNeeded();
  }

  removeElectron(child: NEPElement): number {
    this.checkValueNotEmpty(child, 'child');
    this.checkIsElement(child, 'child');

    const index = this._electrons.indexOf(child);
    if (index !== -1) {
      this._electrons.splice(index, 1);
      this.rawContainer.removeChild(child.rawElement());
      this.onChildRemoved(child);
    }
    this.layoutIfNeeded();
    return index;
  }

  // ------- Animations -------
  async setBackgroundAsync(value: string, animated = true) {
    this.checkValueNotEmpty(value, 'value');

    const raw = this.rawBorder;
    if (animated) {
      await this.animate(raw, {
        fill: value,
      });
    } else {
      this.background = value;
    }
  }

  async setColorAsync(value: string, animated = true) {
    this.checkValueNotEmpty(value, 'value');

    const tasks: Array<Promise<void>> = [];
    for (let i = 0; i < this.electronsCount; i++) {
      const electron = this.electronAt(i);
      if (electron instanceof NEPText) {
        const text = electron as NEPText;
        tasks.push(text.setColorAsync(value, animated));
      }
    }
    return Promise.all(tasks);
  }

  // ------- Private methods -------
  protected layoutIfNeeded() {
    if (this.loaded) {
      this.layout();
    }
  }

  private onChildAdded(child: NEPElement) {
    child.sizeChanged = () => {
      this.layoutIfNeeded();
    };
  }

  private onChildRemoved(child: NEPElement) {
    child.sizeChanged = undefined;
  }
}
