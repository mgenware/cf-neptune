import { NEElement, SVGHelper, NESize } from '../element';

export default class NPTContent extends NEElement {
  private raw: SVGSVGElement;
  private rawContainer: SVGSVGElement;
  private rawBorder: SVGRectElement;

  private _padding: number = 5;
  private _content: NEElement|undefined;

  constructor(
    public size: NESize,
  ) {
    super();

    if (!size) {
      throw new Error('The size argument cannot be empty');
    }

    const raw = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.setSize(raw, this.size);
    this.raw = raw;

    const rawBorder = SVGHelper.createElement('rect') as SVGRectElement;
    rawBorder.setAttribute('fill', 'none');
    rawBorder.setAttribute('stroke', '#808080');
    rawBorder.setAttribute('rx', '4');
    rawBorder.setAttribute('ry', '4');
    rawBorder.setAttribute('stroke-width', '1');
    raw.appendChild(rawBorder);
    this.rawBorder = rawBorder;

    const rawContainer = SVGHelper.createElement('svg') as SVGSVGElement;
    raw.appendChild(rawContainer);
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

  // content property
  get content(): NEElement|undefined {
    return this._content;
  }

  set content(content: NEElement|undefined) {
    if (this._content === content) {
      return;
    }

    if (this._content) {
      this.rawContainer.removeChild(this._content.rawElement());
    }

    if (content) {
      this.rawContainer.appendChild(content.rawElement());
      content.sizeChanged = () => {
        this.layout();
      };
    }
    this._content = content;
    this.layout();
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  layout(): SVGRect {
    const { content, rawContainer, size, padding, rawBorder } = this;
    const rootRect = {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };

    // Border
    SVGHelper.setRect(rawBorder, SVGHelper.rectInflate(rootRect, -1, -1));

    // Container
    SVGHelper.setRect(rawContainer, SVGHelper.rectInflate(rootRect, -padding, -padding));

    // Content
    if (!content) {
      return rootRect;
    }

    const contentLayoutRect = content.layout();
    SVGHelper.setViewBox(rawContainer, contentLayoutRect);
    return rootRect;
  }
}
