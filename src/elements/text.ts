import { NEPElement, SVGHelper, NEPAnimationOptions } from '../element';
import Defs from '../defs';
import configs from '../configs';

export default class NEPText extends NEPElement {
  private raw: SVGTextElement;
  private _value: unknown;

  constructor(value: unknown) {
    super();

    const raw = SVGHelper.createElement(Defs.text) as SVGTextElement;
    raw.style.dominantBaseline = 'text-before-edge';
    raw.style.fontSize = '16px';
    this.raw = raw;
    this.value = value;

    this.color = configs.normalTextColor;
  }

  rawElement(): SVGGraphicsElement {
    return this.raw;
  }

  get value(): unknown {
    return this._value;
  }
  set value(value: unknown) {
    this._value = value;
    this.raw.textContent = `${value}`;
    this.onSizeChanged();
  }

  get color(): string {
    return this.raw.getAttribute(Defs.fill) || '';
  }
  set color(value: string) {
    this.checkValueNotEmpty(value, 'value');
    this.raw.setAttribute(Defs.fill, value);
  }

  async setColorAsync(value: string, opt?: NEPAnimationOptions) {
    this.checkValueNotEmpty(value, 'value');

    const raw = this.raw;
    await this.animate(
      raw,
      {
        fill: value,
      },
      opt,
    );
  }
}
