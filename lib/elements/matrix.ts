import NEPSequence from './sequence';
import { NEPSize, SVGHelper, NEPPoint } from '../element';
import Defs from '../defs';

const DefaultGridColor = '#808080';

export default class NEPMatrix extends NEPSequence {
  private _gridWidth: number;
  private _gridHeight: number;

  constructor(
    public size: NEPSize,
    public rows: number,
    public cols: number,
    public noGrid?: boolean,
   ) {
    super(size, rows, 'v', true);
    this.noGrid = true;
    this.noElementScaling = true;
    this._gridWidth = size.width / cols;
    this._gridHeight = size.height / rows;
    const rowSize = { width: size.width, height: size.height / rows };

    if (!noGrid) {
      this.drawMatrixGrid();
    }
    SVGHelper.labelElementInfo(this.rawElement(), 'matrix');

    for (let i = 0; i < rows; i++) {
      const row = new NEPSequence(rowSize, cols, 'h', true);
      row.borderWidth = 0;
      this.pushBack(row);
    }
  }

  row(index: number): NEPSequence|null {
    const child = this.internalChild(index) as NEPSequence;
    if (!child) {
      return null;
    }
    return child;
  }

  private drawMatrixGrid() {
    const { width, height } = this.size;
    for (let i = 1; i < this.rows; i++) {
      const rawLine = SVGHelper.createElement(Defs.line) as SVGLineElement;
      SVGHelper.setStroke(rawLine, DefaultGridColor, 1);

      const startPt = { x: 0, y: i * this._gridHeight };
      const endPt: NEPPoint = { x: width, y: startPt.y };
      SVGHelper.setLinePoz(rawLine, startPt, endPt);

      this.rawElement().appendChild(rawLine);
    }

    for (let i = 1; i < this.cols; i++) {
      const rawLine = SVGHelper.createElement('line') as SVGLineElement;
      SVGHelper.setStroke(rawLine, DefaultGridColor, 1);

      const startPt = { x: i * this._gridWidth, y: 0 };
      const endPt: NEPPoint = { x: startPt.x, y: height };
      SVGHelper.setLinePoz(rawLine, startPt, endPt);

      this.rawElement().appendChild(rawLine);
    }
  }
}
