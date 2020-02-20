import { NEPPointerInfo, NEPPointerField } from '../pointerField';
import { NEPSize, NEPPoint } from 'element';

export default class MatrixPointerField extends NEPPointerField {
  private _keyToInfoMap: { [name: string]: NEPPointerInfo } = {};
  private _positionToListMap: { [position: string]: NEPPointerInfo[] } = {};

  constructor(public slotSize: NEPSize, pointerSize: NEPSize) {
    super(pointerSize);
  }

  // # protected members
  protected pointerInfoBy(name: string): NEPPointerInfo | null {
    return this._keyToInfoMap[name];
  }

  protected setPointerInfoBy(name: string, info: NEPPointerInfo) {
    this._keyToInfoMap[name] = info;
  }

  protected pointerInfoListAt(position: string): NEPPointerInfo[] | null {
    return this._positionToListMap[position];
  }

  protected setPointerInfoListAt(position: string, value: NEPPointerInfo[]) {
    this._positionToListMap[position] = value;
  }

  protected positionToPoint(position: string): NEPPoint {
    const parts = position.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid 2D position "${position}"`);
    }
    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);

    return {
      x: col * this.slotSize.width,
      y: row * this.slotSize.height,
    };
  }
}
