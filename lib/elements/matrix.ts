import NEPSequence from './sequence';
import { NEPSize, SVGHelper, NEPPoint } from '../element';
import Defs from '../defs';
import MatrixPointerField from './internal/matrixPointerField';
import { NEPPointerField, NEPPointerFieldOptions } from './pointerField';

const DefaultGridColor = '#808080';

export default class NEPMatrix extends NEPSequence {
  private _gridWidth: number;
  private _gridHeight: number;

  constructor(
    public matrixSize: NEPSize,
    public rows: number,
    public cols: number,
    public noGrid?: boolean,
   ) {
    super(matrixSize, rows, 'v', true);

    this.noGrid = true;
    this.noElementScaling = true;
    this._gridWidth = matrixSize.width / cols;
    this._gridHeight = matrixSize.height / rows;
    const rowSize = { width: matrixSize.width, height: matrixSize.height / rows };

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

  async set2DPointerAsync(row: number, col: number, name: string, opt?: NEPPointerFieldOptions) {
    this.validateIndices(row, col);
    const ptrField = this.validatePointerField();
    const position = `${row}:${col}`;

    await ptrField.setPointerAsync(position, name, name, opt);
  }

  protected createPointerField(): NEPPointerField {
    const field = new MatrixPointerField({
      width: this._gridWidth,
      height: this._gridHeight,
    }, {
      width: this._gridWidth * 0.25,
      height: this._gridHeight * 0.25,
    });
    return field;
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

  private validateIndices(row: number, col: number) {
    if (row < 0 || row >= this.rows) {
      throw new Error(`The argument "row" ${row} out of range`);
    }
    if (col < 0 || col >= this.cols) {
      throw new Error(`The argument "col" ${col} out of range`);
    }
  }
}
