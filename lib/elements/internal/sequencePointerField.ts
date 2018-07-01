import { NEPPointerInfo, NEPPointerField } from '../pointerField';
import { NEPSize, NEPPoint } from 'element';

export default class SequencePointerField extends NEPPointerField {
  private _keyToInfoMap: {[name: string]: NEPPointerInfo} = {};
  private _positionToListMap: {[position: string]: NEPPointerInfo[]} = {};

  constructor(
    public slotSize: NEPSize,
    pointerSize: NEPSize,
  ) {
    super(pointerSize);
  }

  // # protected members
  protected pointerInfoBy(name: string): NEPPointerInfo|null {
    return this._keyToInfoMap[name];
  }

  protected setPointerInfoBy(name: string, info: NEPPointerInfo) {
    this._keyToInfoMap[name] = info;
  }

  protected pointerInfoListAt(position: string): NEPPointerInfo[]|null {
    return this._positionToListMap[position];
  }

  protected setPointerInfoListAt(position: string, value: NEPPointerInfo[]) {
    this._positionToListMap[position] = value;
  }

  protected positionToPoint(position: string): NEPPoint {
    const index = parseInt(position, 10);
    return {
      x: index * this.slotSize.width,
      y: 0,
    };
  }
}
