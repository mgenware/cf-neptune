import { NEPElement, SVGHelper, NEPSize } from '../element';
import NEPText from './text';

const DefaultBorderWidth  = 1;
const DefaultRadius       = 0;
const DefaultPadding      = 5;
const DefaultBorderColor  = '#808080';
const DefaultBackground   = 'white';

export default class NEPAtom extends NEPElement {
  noScaling: boolean = false;
  private rawRoot: SVGSVGElement;
  private rawContainer: SVGSVGElement;
  private rawBorder: SVGRectElement;

  private _padding: number = DefaultPadding;
  private _borderColor: string = DefaultBorderColor;
  private _borderWidth: number|string = DefaultBorderWidth;
  private _borderRadius: number = DefaultRadius;
  private _background: string = '';

  private _electrons: NEPElement[] = [];

  constructor(
    public size: NEPSize,
    firstChild?: NEPElement,
  ) {
    super();

    if (!size) {
      throw new Error('The size argument cannot be empty');
    }

    const rawRoot = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.setSize(rawRoot, this.size);
    this.rawRoot = rawRoot;

    const rawBorder = SVGHelper.createElement('rect') as SVGRectElement;
    rawBorder.setAttribute('stroke', this.borderColor);
    rawBorder.setAttribute('rx', `${this.borderRadius}`);
    rawBorder.setAttribute('ry', `${this.borderRadius}`);
    rawBorder.setAttribute('stroke-width', `${this.borderWidth}`);
    rawRoot.appendChild(rawBorder);
    this.rawBorder = rawBorder;

    const rawContainer = SVGHelper.createElement('svg') as SVGSVGElement;
    rawRoot.appendChild(rawContainer);
    this.rawContainer = rawContainer;

    if (firstChild) {
      this.appendElectron(firstChild);
    }

    this.unsafeSetBackground(DefaultBackground);
  }

  // padding property
  get padding(): number {
    return this._padding;
  }
  set padding(value: number) {
    this._padding = value;
    this.layout();
  }

  // border-color property
  get borderColor(): string {
    return this._borderColor;
  }
  set borderColor(value: string) {
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

  // background
  get background(): string {
    return this._background;
  }

  unsafeSetBackground(value: string) {
    this.checkValueNotEmpty(value, 'value');
    this._background = value;
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
    const { rawContainer, size, padding, rawBorder } = this;
    const rootRect = {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };

    // Remove the 'viewBox' attribute to get consistent values from getBBox()
    rawContainer.removeAttribute('viewBox');
    const contentLayoutRect = rawContainer.getBBox();

    // Border
    SVGHelper.setRect(rawBorder, SVGHelper.rectInflate(rootRect, -DefaultBorderWidth, -DefaultBorderWidth));

    // Container
    SVGHelper.setRect(rawContainer, SVGHelper.rectInflate(rootRect, -padding, -padding));

    // Layout children
    for (const child of this._electrons) {
      child.layout();
    }

    // Set the viewBox
    if (!this.noScaling) {
      SVGHelper.setViewBox(rawContainer, contentLayoutRect);
    }
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
    this.layout();
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
    this.layout();
    return index;
  }

  // ------- Animations -------
  async updateBackground(value: string) {
    this.checkValueNotEmpty(value, 'value');

    const raw = this.rawBorder;
    await this.animate(raw, {
      fill: [this.background, value],
    });
    this.unsafeSetBackground(value);
  }

  async updateForeground(value: string) {
    this.checkValueNotEmpty(value, 'value');

    const texts: Array<Promise<void>> = [];
    for (let i = 0; i < this.electronsCount; i++) {
      const electron = this.electronAt(i);
      if (electron instanceof NEPText) {
        const text = electron as NEPText;
        texts.push(text.updateColor(value));
      }
    }
    return Promise.all(texts);
  }

  // ------- Private members -------
  private onChildAdded(child: NEPElement) {
    child.sizeChanged = () => {
      this.layout();
    };
  }

  private onChildRemoved(child: NEPElement) {
    child.sizeChanged = undefined;
  }
}
