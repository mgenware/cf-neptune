import { NEPElement } from '../element';
import NEPText from './text';

export function coerceInputElement(input: any): NEPElement {
  if (input instanceof NEPElement) {
    return input;
  }
  return new NEPText(input);
}
