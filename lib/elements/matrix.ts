import NEPSequence from './sequence';
import { NEPSize, SVGHelper, NEPPoint } from '../element';
import Defs from '../defs';
import MatrixPointerField from './internal/matrixPointerField';
import { NEPPointerField, NEPPointerFieldOptions } from './pointerField';
import NEPAtom from './atom';

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

    this.checkPositiveNumber(rows, 'rows');
    this.checkPositiveNumber(cols, 'cols');

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

  /**
   * Returns the row sequence by the specified index, or null if index out of range.
   *
   * @param {number} index
   * @returns {(NEPSequence|null)}
   * @memberof NEPMatrix
   */
  row(index: number): NEPSequence|null {
    const child = this.internalElement(index) as NEPSequence;
    if (!child) {
      return null;
    }
    return child;
  }

  /**
   * Return the cell atom by the specified row and col, or null if index out of range.
   *
   * @param {number} row
   * @param {number} col
   * @returns {(NEPAtom|null)}
   * @memberof NEPMatrix
   */
  cell(row: number, col: number): NEPAtom|null {
    const rowSequence = this.row(row);
    if (!rowSequence) {
      return null;
    }
    return rowSequence.element(col);
  }

  /**
   * Return the cell content by the specified row and col, or null if index out of range.
   *
   * @param {number} row
   * @param {number} col
   * @returns {*}
   * @memberof NEPMatrix
   */
  cellContent(row: number, col: number): any {
    const cell = this.cell(row, col);
    if (!cell) {
      return null;
    }
    return cell.content;
  }

  /**
   * Populates the matrix with the given valueFn.
   *
   * @param {(row: number, col: number) => any} valueFn
   * @memberof NEPMatrix
   */
  fill(valueFn: (row: number, col: number) => any) {
    this.checkValueNotEmpty(valueFn, 'valueFn');

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        (this.row(i) as NEPSequence).pushBack(valueFn(i, j));
      }
    }
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
