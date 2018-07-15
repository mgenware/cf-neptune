import configs from './configs';
import { TweenConfig, TweenLite } from 'gsap';
import Defs from 'defs';

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

export function NewPadding(top: number, right?: number, bottom?: number, left?: number): NEPPadding {
  if (right === undefined) {
    return {
      top,
      right: top,
      bottom: top,
      left: top,
    };
  }
  return {
    top,
    right: right as number,
    bottom: bottom as number,
    left: left as number,
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

  protected animate(element: SVGGraphicsElement, props: {[key: string]: any}, opt: NEPAnimationOptions|undefined): Promise<void> {
    this.checkValueNotEmpty(element, 'element');
    this.checkValueNotEmpty(props, 'props');

    return new Promise<void>((resolve) => {
      const params: TweenConfig = { attr: { ...props } };
      params.onComplete = resolve;

      const duration = this.getDurationOption(opt);
      TweenLite.to(element, duration / 1000, params);
    });
  }

  protected getDurationOption(opt: AnimationOptions|undefined): number {
    if (opt && opt.duration) {
      return opt.duration;
    }
    return configs.animationDuration;
  }

  protected checkValueNotEmpty(value: any, name = 'value') {
    if (!value) {
      throw new Error(`The argument "${name}" cannot be empty`);
    }
  }

  protected checkIsElement(value: NEPElement, name: string) {
    if (value instanceof NEPElement === false) {
      throw new Error(`The argument "${name}" is not a NEPElement`);
    }
  }

  protected checkPositiveNumber(value: number, name: string) {
    if (value < 0) {
      throw new Error(`The argument "${name}" could not be negative`);
    }
  }
}

export class SVGHelper {
  static get svgNS(): string {
    return 'http://www.w3.org/2000/svg';
  }

  static setSize(element: SVGElement, size: NEPSize) {
    element.setAttribute(Defs.width, `${size.width}`);
    element.setAttribute(Defs.height, `${size.height}`);
  }

  static setViewBox(svg: SVGSVGElement, rect: SVGRect) {
    svg.setAttribute('viewBox', `${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
  }

  static setPosition(element: SVGGraphicsElement, x: number, y: number) {
    element.setAttribute(Defs.x, `${x}`);
    element.setAttribute(Defs.y, `${y}`);
  }

  static setRect(element: SVGGraphicsElement, rect: SVGRect) {
    this.setPosition(element, rect.x, rect.y);
    this.setSize(element, rect);
  }

  static setLinePoz(line: SVGLineElement, p1: NEPPoint, p2: NEPPoint) {
    line.setAttribute(Defs.x1, p1.x.toString());
    line.setAttribute(Defs.y1, p1.y.toString());
    line.setAttribute(Defs.x2, p2.x.toString());
    line.setAttribute(Defs.y2, p2.y.toString());
  }

  static setStroke(element: SVGGraphicsElement, color: string, width: number) {
    element.setAttribute(Defs.stroke, color);
    element.setAttribute(Defs.strokeWidth, `${width}`);
  }

  static rectInset(rect: SVGRect, x: number, y: number): DOMRect {
    return this.rectInsetEx(rect, { left: x, right: x, top: y, bottom: y});
  }

  static rectInsetEx(rect: SVGRect, padding: NEPPadding): DOMRect {
    return new DOMRect(rect.x + padding.left, rect.y + padding.top, rect.width - padding.left - padding.right, rect.height - padding.top - padding.bottom);
  }

  static sizeScale(size: NEPSize, multiplier: number): NEPSize {
    return {
      width: size.width * multiplier,
      height: size.height * multiplier,
    };
  }

  static createElement(tagName: string): SVGGraphicsElement {
    return document.createElementNS(this.svgNS, tagName) as any;
  }

  static labelElementInfo(element: SVGGraphicsElement, label: string) {
    element.setAttribute('data-nep-type', label);
  }

  static bringToTop(parent: SVGGraphicsElement, child: SVGGraphicsElement) {
    parent.removeChild(child);
    parent.appendChild(child);
  }
}

export class AnimationHelper {
  static async delay(ts: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ts);
    });
  }
}

export interface NEPAnimationOptions {
  duration?: number;
}
