import { NEElement, SVGHelper, EmptyRect, NESize } from '../element';

export default class NPTContent extends NEElement {
  private raw: SVGSVGElement;
  private _padding: number = 20;
  private _content: NEElement|undefined;

  constructor(
    public size: NESize,
  ) {
    super();

    const raw = SVGHelper.createElement('svg') as SVGSVGElement;
    SVGHelper.setSize(raw, this.size);
    raw.classList.add('npt-content');

    this.raw = raw;
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
      this.raw.removeChild(this._content.rawElement());
    }

    if (content) {
      this.raw.appendChild(content.rawElement());
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
    const { content } = this;
    if (!content) {
      return EmptyRect;
    }

    const { size, padding } = this;
    const contentRect = content.layout();
    SVGHelper.setViewBox(this.raw, {
      x: -padding,
      y: -padding,
      width: contentRect.width + padding * 2,
      height: contentRect.height + padding * 2,
    });
    return {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };
  }
}
