import { NEElement, SVGHelper } from '../element';

export default class NEText extends NEElement {
  private raw: SVGTextElement;

  constructor(text?: string) {
    super();

    const raw = SVGHelper.createElement('text') as SVGTextElement;
    // raw.style.textAnchor = 'middle';
    raw.style.dominantBaseline = 'text-before-edge';
    raw.style.fontSize = '16px';
    raw.style.color = 'black';
    this.raw = raw;
    this.text = text as string|null;
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  layout(): SVGRect {
    return super.layout();
  }

  get text(): string|null {
    return this.raw.textContent;
  }
  set text(value: string|null) {
    this.raw.textContent = value;
    this.onSizeChanged();
  }
}
