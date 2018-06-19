import { NEPElement, SVGHelper, NEPAnimationOptions } from '../element';

export default class NEPText extends NEPElement {
  private raw: SVGTextElement;

  constructor(text?: string) {
    super();

    text = text || '';
    const raw = SVGHelper.createElement('text') as SVGTextElement;
    raw.style.dominantBaseline = 'text-before-edge';
    raw.style.fontSize = '16px';
    this.raw = raw;
    this.text = text as string|null;

    this.color = 'black';
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
    return this.raw.getAttribute('fill') || '';
  }
  set color(value: string) {
    this.checkValueNotEmpty(value, 'value');
    this.raw.setAttribute('fill', value);
  }

  async setColorAsync(value: string, opt?: NEPAnimationOptions) {
    this.checkValueNotEmpty(value, 'value');

    const raw = this.raw;
    await this.animate(raw, {
      fill: value,
    }, opt);
  }
}
