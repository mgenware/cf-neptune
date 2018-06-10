export interface NESize {
  width: number;
  height: number;
}

export const EmptyRect: SVGRect = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const EmptySize: NESize = {
  width: 0,
  height: 0,
};

export class NEElement {
  sizeChanged: ((sender: NEElement) => void)|undefined;

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
}

export class SVGHelper {
  static get svgNS(): string {
    return 'http://www.w3.org/2000/svg';
  }

  static setSize(element: SVGElement, size: NESize) {
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

  static rectInflate(rect: SVGRect, x: number, y: number): DOMRect {
    return new DOMRect(rect.x + x, rect.y + y, rect.width + x * 2, rect.height + y * 2);
  }

  static createElement(tagName: string): SVGGraphicsElement {
    return document.createElementNS(this.svgNS, tagName) as any;
  }
}
