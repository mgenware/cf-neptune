import { NEPElement, SVGHelper } from '../element';

export default class NEPText extends NEPElement {
  private raw: SVGTextElement;

  constructor(text?: string) {
    super();

    const raw = SVGHelper.createElement('text') as SVGTextElement;
    raw.style.dominantBaseline = 'text-before-edge';
    raw.style.fontSize = '16px';
    raw.style.color = 'black';
    this.raw = raw;
    this.text = text as string|null;
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
}
