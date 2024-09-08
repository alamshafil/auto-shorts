import { TEXT_GRADIENT } from "../const";
import { hex2string } from "../utils";

const defaultStyle = {
  align: "left",
  breakWords: false,
  dropShadow: false,
  dropShadowAlpha: 1,
  dropShadowAngle: Math.PI / 6,
  dropShadowBlur: 0,
  dropShadowColor: "black",
  dropShadowDistance: 5,
  fill: "black",
  fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
  fillGradientStops: [],
  fontFamily: ["Helvetica", "Arial", "sans-serif"], //
  fontSize: 26,
  fontStyle: "normal",
  fontVariant: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 0,
  lineJoin: "miter",
  miterLimit: 10,
  padding: 0,
  stroke: "black",
  strokeThickness: 0,
  textBaseline: "alphabetic",
  trim: false,
  whiteSpace: "pre",
  wordWrap: false,
  wordWrapWidth: 100,
  leading: 0
};

const genericFontFamilies = [
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui"
];

export default class TextStyle {
  constructor(style) {
    this.styleID = 0;
    this.reset();
    deepCopyProperties(this, style, style);
  }

  clone() {
    const clonedProperties = {};
    deepCopyProperties(clonedProperties, this, defaultStyle);
    return new TextStyle(clonedProperties);
  }

  reset() {
    deepCopyProperties(this, defaultStyle, defaultStyle);
  }

  get align() {
    return this._align;
  }

  set align(align) {
    if (this._align !== align) {
      this._align = align;
      this.styleID++;
    }
  }

  get breakWords() {
    return this._breakWords;
  }

  set breakWords(breakWords) {
    if (this._breakWords !== breakWords) {
      this._breakWords = breakWords;
      this.styleID++;
    }
  }

  get dropShadow() {
    return this._dropShadow;
  }
  set dropShadow(dropShadow) {
    if (this._dropShadow !== dropShadow) {
      this._dropShadow = dropShadow;
      this.styleID++;
    }
  }

  get dropShadowAlpha() {
    return this._dropShadowAlpha;
  }

  set dropShadowAlpha(dropShadowAlpha) {
    if (this._dropShadowAlpha !== dropShadowAlpha) {
      this._dropShadowAlpha = dropShadowAlpha;
      this.styleID++;
    }
  }

  get dropShadowAngle() {
    return this._dropShadowAngle;
  }
  set dropShadowAngle(dropShadowAngle) {
    if (this._dropShadowAngle !== dropShadowAngle) {
      this._dropShadowAngle = dropShadowAngle;
      this.styleID++;
    }
  }

  get dropShadowBlur() {
    return this._dropShadowBlur;
  }
  set dropShadowBlur(dropShadowBlur) {
    if (this._dropShadowBlur !== dropShadowBlur) {
      this._dropShadowBlur = dropShadowBlur;
      this.styleID++;
    }
  }

  get dropShadowColor() {
    return this._dropShadowColor;
  }
  set dropShadowColor(dropShadowColor) {
    const outputColor = getColor(dropShadowColor);
    if (this._dropShadowColor !== outputColor) {
      this._dropShadowColor = outputColor;
      this.styleID++;
    }
  }

  get dropShadowDistance() {
    return this._dropShadowDistance;
  }
  set dropShadowDistance(dropShadowDistance) {
    if (this._dropShadowDistance !== dropShadowDistance) {
      this._dropShadowDistance = dropShadowDistance;
      this.styleID++;
    }
  }

  get fill() {
    return this._fill;
  }
  set fill(fill) {
    const outputColor = getColor(fill);
    if (this._fill !== outputColor) {
      this._fill = outputColor;
      this.styleID++;
    }
  }

  get fillGradientType() {
    return this._fillGradientType;
  }
  set fillGradientType(fillGradientType) {
    if (this._fillGradientType !== fillGradientType) {
      this._fillGradientType = fillGradientType;
      this.styleID++;
    }
  }

  get fillGradientStops() {
    return this._fillGradientStops;
  }
  set fillGradientStops(fillGradientStops) {
    if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
      this._fillGradientStops = fillGradientStops;
      this.styleID++;
    }
  }

  get fontFamily() {
    return this._fontFamily;
  }
  set fontFamily(fontFamily) {
    if (this.fontFamily !== fontFamily) {
      this._fontFamily = fontFamily;
      this.styleID++;
    }
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize) {
    if (this._fontSize !== fontSize) {
      this._fontSize = fontSize;
      this.styleID++;
    }
  }

  get fontStyle() {
    return this._fontStyle;
  }
  set fontStyle(fontStyle) {
    if (this._fontStyle !== fontStyle) {
      this._fontStyle = fontStyle;
      this.styleID++;
    }
  }

  get fontVariant() {
    return this._fontVariant;
  }
  set fontVariant(fontVariant) {
    if (this._fontVariant !== fontVariant) {
      this._fontVariant = fontVariant;
      this.styleID++;
    }
  }

  get fontWeight() {
    return this._fontWeight;
  }
  set fontWeight(fontWeight) {
    if (this._fontWeight !== fontWeight) {
      this._fontWeight = fontWeight;
      this.styleID++;
    }
  }

  get letterSpacing() {
    return this._letterSpacing;
  }
  set letterSpacing(letterSpacing) {
    if (this._letterSpacing !== letterSpacing) {
      this._letterSpacing = letterSpacing;
      this.styleID++;
    }
  }

  get lineHeight() {
    return this._lineHeight;
  }
  set lineHeight(lineHeight) {
    if (this._lineHeight !== lineHeight) {
      this._lineHeight = lineHeight;
      this.styleID++;
    }
  }

  get leading() {
    return this._leading;
  }
  set leading(leading) {
    if (this._leading !== leading) {
      this._leading = leading;
      this.styleID++;
    }
  }

  get lineJoin() {
    return this._lineJoin;
  }
  set lineJoin(lineJoin) {
    if (this._lineJoin !== lineJoin) {
      this._lineJoin = lineJoin;
      this.styleID++;
    }
  }

  get miterLimit() {
    return this._miterLimit;
  }
  set miterLimit(miterLimit) {
    if (this._miterLimit !== miterLimit) {
      this._miterLimit = miterLimit;
      this.styleID++;
    }
  }

  get padding() {
    return this._padding;
  }
  set padding(padding) {
    if (this._padding !== padding) {
      this._padding = padding;
      this.styleID++;
    }
  }

  get stroke() {
    return this._stroke;
  }
  set stroke(stroke) {
    const outputColor = getColor(stroke);
    if (this._stroke !== outputColor) {
      this._stroke = outputColor;
      this.styleID++;
    }
  }

  get strokeThickness() {
    return this._strokeThickness;
  }
  set strokeThickness(strokeThickness) {
    if (this._strokeThickness !== strokeThickness) {
      this._strokeThickness = strokeThickness;
      this.styleID++;
    }
  }

  get textBaseline() {
    return this._textBaseline;
  }
  set textBaseline(textBaseline) {
    if (this._textBaseline !== textBaseline) {
      this._textBaseline = textBaseline;
      this.styleID++;
    }
  }

  get trim() {
    return this._trim;
  }
  set trim(trim) {
    if (this._trim !== trim) {
      this._trim = trim;
      this.styleID++;
    }
  }

  get whiteSpace() {
    return this._whiteSpace;
  }
  set whiteSpace(whiteSpace) {
    if (this._whiteSpace !== whiteSpace) {
      this._whiteSpace = whiteSpace;
      this.styleID++;
    }
  }

  get wordWrap() {
    return this._wordWrap;
  }
  set wordWrap(wordWrap) {
    if (this._wordWrap !== wordWrap) {
      this._wordWrap = wordWrap;
      this.styleID++;
    }
  }

  get wordWrapWidth() {
    return this._wordWrapWidth;
  }
  set wordWrapWidth(wordWrapWidth) {
    if (this._wordWrapWidth !== wordWrapWidth) {
      this._wordWrapWidth = wordWrapWidth;
      this.styleID++;
    }
  }

  toFontString() {
    // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
    const fontSizeString =
      typeof this.fontSize === "number" ? `${this.fontSize}px` : this.fontSize;

    let fontFamilies = this.fontFamily;
    if (!Array.isArray(this.fontFamily)) {
      fontFamilies = this.fontFamily.split(",");
    }

    for (let i = fontFamilies.length - 1; i >= 0; i--) {
      let fontFamily = fontFamilies[i].trim();

      if (
        !/([\"\'])[^\'\"]+\1/.test(fontFamily) &&
        genericFontFamilies.indexOf(fontFamily) < 0
      ) {
        fontFamily = `"${fontFamily}"`;
      }

      fontFamilies[i] = fontFamily;
    }

    return `${this.fontStyle} ${this.fontVariant} ${
      this.fontWeight
    } ${fontSizeString} ${fontFamilies.join(",")}`;
  }
}

function getSingleColor(color) {
  if (typeof color === "number") {
    return hex2string(color);
  } else if (typeof color === "string") {
    if (color.indexOf("0x") === 0) {
      color = color.replace("0x", "#");
    }
  }

  return color;
}

function getColor(color) {
  if (!Array.isArray(color)) return getSingleColor(color);

  for (let i = 0; i < color.length; ++i) {
    color[i] = getSingleColor(color[i]);
  }
  return color;
}

function areArraysEqual(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    return false;
  }

  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

function deepCopyProperties(target, source, propertyObj) {
  for (const prop in propertyObj) {
    if (Array.isArray(source[prop])) {
      target[prop] = source[prop].slice();
    } else {
      target[prop] = source[prop];
    }
  }
}
