import {
  NEPElement,
  SVGHelper,
  NEPSize,
  NEPPadding,
  NewPadding,
  NewRectFromSize,
  NEPAnimationOptions,
  AnimationHelper,
  NEPRect,
} from '../element';
import NEPText from './text';
import Defs from 'defs';
import configs from '../configs';

export default class NEPAtom extends NEPElement {
  noScaling = false;
  loaded = false;

  // rawRoot is the outermost SVGElement of this element, therefor it contains all other child SVGElements.
  private rawRoot: SVGSVGElement;
  // rawContains is the element used to hold content elements, it defines the area inside this element's border and padding.
  private rawContainer: SVGSVGElement;
  // rawBorder is the SVGRectElement used to define borders of this element.
  private rawBorder: SVGRectElement;

  private _padding: NEPPadding = NewPadding(configs.normalContentPadding);
  private _borderColor: string = configs.normalBorderColor;
  private _borderWidth: number | string = configs.normalBorderWidth;
  private _borderRadius: number = configs.normalBorderRadius;

  // _electrons contains the internal NEPElements that are added to the content(rawContainer) element.
  private _electrons: NEPElement[] = [];

  constructor(public size: NEPSize, content?: NEPElement) {
    super();
    this.checkValueNotEmpty(size, 'size');

    const rawRoot = SVGHelper.createElement(Defs.svg) as SVGSVGElement;
    SVGHelper.setSize(rawRoot, size);
    // Root <svg>'s viewBox will always be the size passed in, container <svg>'s viewBox will be resolved in layout().
    SVGHelper.setViewBox(rawRoot, NewRectFromSize(0, 0, size));
    this.rawRoot = rawRoot;

    const rawBorder = SVGHelper.createElement(Defs.rect) as SVGRectElement;
    rawBorder.setAttribute(Defs.stroke, this.borderColor);
    rawBorder.setAttribute(Defs.rx, `${this.borderRadius}`);
    rawBorder.setAttribute(Defs.ry, `${this.borderRadius}`);
    rawBorder.setAttribute(Defs.strokeWidth, `${this.borderWidth}`);
    rawRoot.appendChild(rawBorder);
    this.rawBorder = rawBorder;

    const rawContainer = SVGHelper.createElement(Defs.svg) as SVGSVGElement;
    SVGHelper.labelElementInfo(rawContainer, 'atom-content');
    rawRoot.appendChild(rawContainer);
    this.rawContainer = rawContainer;

    // Auto-convert a string content to NEPText
    if (typeof content === 'string') {
      content = new NEPText(content);
    }
    if (content) {
      this.appendElectron(content);
    }

    this.backgroundColor = configs.normalFillColor;
    SVGHelper.labelElementInfo(this.rawElement(), 'atom');
  }

  // padding property
  get padding(): NEPPadding {
    return this._padding;
  }
  set padding(value: NEPPadding) {
    this.checkValueNotEmpty(value);
    this._padding = value;
    this.layoutIfNeeded();
  }

  // border-color property
  get borderColor(): string {
    return this._borderColor;
  }
  set borderColor(value: string) {
    this.checkValueNotEmpty(value);
    this._borderColor = value;
    this.rawBorder.setAttribute(Defs.stroke, value);
  }

  // border-width
  get borderWidth(): number | string {
    return this._borderWidth;
  }
  set borderWidth(value: number | string) {
    this._borderWidth = value;
    this.rawBorder.setAttribute('stroke-width', `${value}`);
  }

  // border-radius
  get borderRadius(): number {
    return this._borderRadius;
  }
  set borderRadius(value: number) {
    this._borderRadius = value;
    this.rawBorder.setAttribute('stroke-radius', `${value}`);
  }

  // background
  get backgroundColor(): string {
    return this.rawBorder.getAttribute(Defs.fill) || '';
  }
  set backgroundColor(value: string) {
    this.checkValueNotEmpty(value);
    this.rawBorder.setAttribute(Defs.fill, value);
  }

  // textColor
  get textColor(): string | null {
    const textContent = this.tryGetTextObject();
    if (textContent) {
      return textContent.color;
    }
    return null;
  }
  // Has no effect if either value is null or this object does not have a text content.
  set textColor(value: string | null) {
    const textContent = this.tryGetTextObject();
    if (textContent && value) {
      textContent.color = value;
    }
  }

  // content property
  get content(): unknown {
    const textContent = this.tryGetTextObject();
    if (textContent) {
      return textContent.value;
    }
    return null;
  }

  set content(value: unknown) {
    // Add a Text object if no children
    if (this.electronsCount === 0) {
      this.appendElectron(new NEPText(value));
      return;
    }

    const textContent = this.tryGetTextObject();
    if (textContent) {
      textContent.value = value;
    }
  }

  // ------- Child-related props -------
  get firstElectron(): NEPElement | null {
    if (this._electrons.length) {
      return this._electrons[0];
    }
    return null;
  }

  get lastElectron(): NEPElement | null {
    if (this._electrons.length) {
      return this._electrons[this._electrons.length - 1];
    }
    return null;
  }

  get electrons(): NEPElement[] {
    return this._electrons;
  }

  get electronsCount(): number {
    return this._electrons.length;
  }

  electronAt(index: number): NEPElement | null {
    if (index < 0 || index >= this._electrons.length) {
      return null;
    }
    return this._electrons[index];
  }

  rawElement(): SVGGraphicsElement {
    return this.rawRoot;
  }

  layout(): NEPRect {
    this.loaded = true;

    const { rawContainer, size, padding, rawBorder } = this;
    const rootRect = {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };

    // Remove the 'viewBox' attribute to get consistent values from getBBox()
    rawContainer.removeAttribute(Defs.viewBox);

    // Border
    SVGHelper.setRect(
      rawBorder,
      SVGHelper.rectInset(
        rootRect,
        configs.normalBorderWidth,
        configs.normalBorderWidth,
      ),
    );

    // Container
    SVGHelper.setRect(rawContainer, SVGHelper.rectInsetEx(rootRect, padding));

    // Layout children
    for (const child of this._electrons) {
      child.layout();
    }

    // Get the bounding box
    const contentLayoutRect = rawContainer.getBBox();

    // Set the viewBox
    SVGHelper.setViewBox(
      rawContainer,
      this.noScaling ? rootRect : contentLayoutRect,
    );
    return rootRect;
  }

  // ------- Children manipulations -------
  appendElectron(child: NEPElement) {
    this.checkValueNotEmpty(child, 'child');
    this.checkIsElement(child, 'child');

    this._electrons.push(child);
    this.rawContainer.appendChild(child.rawElement());
    this.onChildAdded(child);
    this.layoutIfNeeded();
  }

  removeElectron(child: NEPElement): number {
    this.checkValueNotEmpty(child, 'child');
    this.checkIsElement(child, 'child');

    const index = this._electrons.indexOf(child);
    if (index >= 0) {
      this._electrons.splice(index, 1);
      this.rawContainer.removeChild(child.rawElement());
      this.onChildRemoved(child);
      this.layoutIfNeeded();
    }
    return index;
  }

  replaceElectron(oldChild: NEPElement, newChild: NEPElement): number {
    this.checkIsElement(oldChild, 'oldChild');
    this.checkIsElement(newChild, 'newChild');

    const index = this._electrons.indexOf(oldChild);
    if (index >= 0) {
      this._electrons[index] = newChild;
      this.rawContainer.replaceChild(
        newChild.rawElement(),
        oldChild.rawElement(),
      );
      this.onChildRemoved(oldChild);
      this.onChildAdded(newChild);
      this.layoutIfNeeded();
    }
    return index;
  }

  // ------- Animations -------
  async setBackgroundAsync(value: string, opt?: NEPAnimationOptions) {
    this.checkValueNotEmpty(value, 'value');

    const raw = this.rawBorder;
    await this.animate(
      raw,
      {
        fill: value,
      },
      opt,
    );
  }

  // Has no effect if either value is null or this object does not have a text content.
  async setTextColorAsync(value: string | null, opt?: NEPAnimationOptions) {
    const textContent = this.tryGetTextObject();
    if (textContent && value) {
      await textContent.setColorAsync(value, opt);
    }
  }

  // Has no effect if this atom has no child (electron).
  async setContentAsync(value: unknown, opt?: NEPAnimationOptions) {
    const child = this.firstElectron;
    if (child) {
      this.content = value;

      // Animation details
      // #1 Highlight the background (0.2)
      // #2 Do nothing
      // #3 Restore the background (0.1)

      // # 1
      const duration = this.getDurationOption(opt);

      const originalBackgroundColor = this.backgroundColor;
      const originalTextColor = this.textColor;

      await this.setColorsAsync(
        configs.changedTextColor,
        configs.changedFillColor,
        { duration: duration * 0.2 },
      );

      // # 2
      await AnimationHelper.delay(0.7 * duration);

      // # 3
      await this.setColorsAsync(originalTextColor, originalBackgroundColor, {
        duration: duration * 0.1,
      });
    }
  }

  async setColorsAsync(
    textColor: string | null,
    backgroundColor: string,
    opt?: NEPAnimationOptions,
  ) {
    await Promise.all([
      this.setTextColorAsync(textColor, opt),
      this.setBackgroundAsync(backgroundColor, opt),
    ]);
  }

  // # protected methods
  protected layoutIfNeeded() {
    if (this.loaded) {
      this.layout();
    }
  }

  // # private methods
  private onChildAdded(child: NEPElement) {
    child.sizeChanged = () => {
      this.layoutIfNeeded();
    };
  }

  private onChildRemoved(child: NEPElement) {
    child.sizeChanged = undefined;
  }

  private tryGetTextObject(): NEPText | null {
    if (this.electronsCount > 0 && this.electronAt(0) instanceof NEPText) {
      return this.electronAt(0) as NEPText;
    }
    return null;
  }
}
