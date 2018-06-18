import defaults from 'defaults';

export interface NEPSize {
  width: number;
  height: number;
}

export interface NEPPoint {
  x: number;
  y: number;
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

  animate(element: Element, effect: AnimationKeyFrame | AnimationKeyFrame[]): Promise<Animation> {
    if (!element) {
      throw new Error('The element argument cannot be null');
    }
    const animation = element.animate(effect, {
      duration: this.animationDuration,
      fill: 'forwards',
    });
    return animation.finished;
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

  static rectInflate(rect: SVGRect, x: number, y: number): DOMRect {
    return new DOMRect(rect.x - x, rect.y - y, rect.width + x * 2, rect.height + y * 2);
  }

  static createElement(tagName: string): SVGGraphicsElement {
    return document.createElementNS(this.svgNS, tagName) as any;
  }
}
