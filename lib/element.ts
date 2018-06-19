import defaults from './defaults';
import { TweenConfig, TweenLite } from 'gsap';

export interface NEPSize {
  width: number;
  height: number;
}

export interface NEPPoint {
  x: number;
  y: number;
}

export interface NEPPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const EmptyRect: SVGRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const EmptySize: NEPSize = {
  width: 0,
  height: 0,
};

export const EmptyPadding: NEPPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export function NewPadding(top: number, right: number, bottom: number, left: number): NEPPadding {
  return {
    top, right, bottom, left,
  };
}

export function NewRectFromSize(x: number, y: number, size: NEPSize): SVGRect {
  return {
    x,
    y,
    width: size.width,
    height: size.height,
  };
}

export class NEPElement {
  sizeChanged: ((sender: NEPElement) => void)|undefined;

  _animationDuration: number|undefined;
  get animationDuration(): number {
    if (this._animationDuration) {
      return this._animationDuration;
    }
    return defaults.animationDuration;
  }
  set animationDuration(value: number) {
    this._animationDuration = value;
  }

  rawElement(): SVGGraphicsElement {
    throw new Error('not implemented yet');
  }

  layout(): SVGRect {
    return this.rawElement().getBBox();
  }

  onSizeChanged() {
    if (this.sizeChanged) {
      this.sizeChanged(this);
    }
  }

  animate(element: SVGGraphicsElement, effect: {}): Promise<void> {
    this.checkValueNotEmpty(element, 'element');

    return new Promise<void>((resolve) => {
      const config: TweenConfig = { attr: { ...effect } };
      config.onComplete = resolve;
      TweenLite.to(element, this.animationDuration / 1000, config);
    });
  }

  // tslint:disable-next-line no-any
  checkValueNotEmpty(value: any, name: string) {
    if (!value) {
      throw new Error(`The "${name}" argument cannot be empty`);
    }
  }

  checkIsElement(value: NEPElement, name: string) {
    if (value instanceof NEPElement === false) {
      throw new Error(`The "${name}" argument is not a NEPElement`);
    }
  }
}

export class SVGHelper {
  static get svgNS(): string {
    return 'http://www.w3.org/2000/svg';
  }

  static setSize(element: SVGElement, size: NEPSize) {
    element.setAttribute('width', `${size.width}`);
    element.setAttribute('height', `${size.height}`);
  }

  static setViewBox(svg: SVGSVGElement, rect: SVGRect) {
    svg.setAttribute('viewBox', `${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
  }

  static setPosition(element: SVGGraphicsElement, x: number, y: number) {
    element.setAttribute('x', `${x}`);
    element.setAttribute('y', `${y}`);
  }

  static setRect(element: SVGGraphicsElement, rect: SVGRect) {
    this.setPosition(element, rect.x, rect.y);
    this.setSize(element, rect);
  }

  static setLinePoz(line: SVGLineElement, p1: NEPPoint, p2: NEPPoint) {
    line.setAttribute('x1', p1.x.toString());
    line.setAttribute('y1', p1.y.toString());
    line.setAttribute('x2', p2.x.toString());
    line.setAttribute('y2', p2.y.toString());
  }

  static setStroke(element: SVGGraphicsElement, color: string, width: number) {
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', `${width}`);
  }

  static rectInset(rect: SVGRect, x: number, y: number): DOMRect {
    return this.rectInsetEx(rect, { left: x, right: x, top: y, bottom: y});
  }

  static rectInsetEx(rect: SVGRect, padding: NEPPadding): DOMRect {
    return new DOMRect(rect.x + padding.left, rect.y + padding.top, rect.width - padding.left - padding.right, rect.height - padding.top - padding.bottom);
  }

  static createElement(tagName: string): SVGGraphicsElement {
    return document.createElementNS(this.svgNS, tagName) as any;
  }

  static labelElementInfo(element: SVGGraphicsElement, label: string) {
    element.setAttribute('data-nep-type', label);
  }
}
