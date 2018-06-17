import { NEPElement, SVGHelper } from '../element';

export default class NEPText extends NEPElement {
  private raw: SVGTextElement;
  private _color: string = '';

  constructor(text?: string) {
    super();

    text = text || '';
    const raw = SVGHelper.createElement('text') as SVGTextElement;
    raw.style.dominantBaseline = 'text-before-edge';
    raw.style.fontSize = '16px';
    this.raw = raw;
    this.text = text as string|null;

    this.unsafeSetColor('black');
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  get text(): string|null {
    return this.raw.textContent;
  }
  set text(value: string|null) {
    this.raw.textContent = value;
    this.onSizeChanged();
  }

  get color(): string {
    return this._color;
  }

  unsafeSetColor(value: string) {
    this.validateValue(value);
    this.raw.setAttribute('fill', value);
    this._color = value;
  }

  async updateColor(value: string) {
    this.validateValue(value);
    const raw = this.raw;
    await this.animate(raw, {
      fill: [this.color, value],
    });
    this.unsafeSetColor(value);
  }
}
