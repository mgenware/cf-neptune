import { NEPElement, SVGHelper, NEPSize } from '../element';

const DefaultBorderWidth  = 1;
const DefaultRadius       = 4;
const DefaultPadding      = 5;

export default class NEPAtom extends NEPElement {
  private rawRoot: SVGSVGElement;
  private rawContainer: SVGSVGElement;
  private rawBorder: SVGRectElement;

  private _padding: number = DefaultPadding;
  private _children: NEPElement[] = [];

  constructor(
    public size: NEPSize,
  ) {
    super();

    if (!size) {
      throw new Error('The size argument cannot be empty');
    }

    const rawRoot = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.setSize(rawRoot, this.size);
    this.rawRoot = rawRoot;

    const rawBorder = SVGHelper.createElement('rect') as SVGRectElement;
    rawBorder.setAttribute('fill', 'none');
    rawBorder.setAttribute('stroke', '#808080');
    rawBorder.setAttribute('rx', `${DefaultRadius}`);
    rawBorder.setAttribute('ry', `${DefaultRadius}`);
    rawBorder.setAttribute('stroke-width', `${DefaultBorderWidth}`);
    rawRoot.appendChild(rawBorder);
    this.rawBorder = rawBorder;

    const rawContainer = SVGHelper.createElement('svg') as SVGSVGElement;
    rawRoot.appendChild(rawContainer);
    this.rawContainer = rawContainer;
  }

  // padding property
  get padding(): number {
    return this._padding;
  }
  set padding(value: number) {
    if (value !== this.padding) {
      this._padding = value;
      this.layout();
    }
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
    for (const child of this._children) {
      child.layout();
    }

    // Set the viewBox
    SVGHelper.setViewBox(rawContainer, contentLayoutRect);
    return rootRect;
  }

  // ------- Children manipulations -------
  get childrenCount(): number {
    return this._children.length;
  }

  appendChild(child: NEPElement) {
    this._children.push(child);
    this.rawContainer.appendChild(child.rawElement());
    this.onChildAdded(child);
    this.layout();
  }

  removeChild(child: NEPElement): number {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
      this.rawContainer.removeChild(child.rawElement());
      this.onChildRemoved(child);
    }
    this.layout();
    return index;
  }

  private onChildAdded(child: NEPElement) {
    child.sizeChanged = () => {
      this.layout();
    };
  }

  private onChildRemoved(child: NEPElement) {
    child.sizeChanged = undefined;
  }
}
