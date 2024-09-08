import Sprite from "../sprites/Sprite";
import Texture from "../textures/Texture";
import { sign } from "../utils";
import { Rectangle } from "../math";
import { TEXT_GRADIENT } from "../const";
import settings from "../settings";
import TextStyle from "./TextStyle";
import TextMetrics from "./TextMetrics";
import trimCanvas from "../utils/trimCanvas";
import Doc from "../polyfill/Doc";
import { addToTextureCache } from "../utils/cache";

const defaultDestroyOptions = {
  texture: true,
  children: false,
  baseTexture: true
};

export default class Text extends Sprite {
  constructor(text, style, canvas) {
    canvas = canvas || Doc.createElement("canvas");
    canvas.width = 3;
    canvas.height = 3;

    const texture = Texture.fromCanvas(canvas, settings.SCALE_MODE, "text");
    texture.orig = new Rectangle();
    texture.trim = new Rectangle();

    super(texture);
    addToTextureCache(
      this._texture,
      this._texture.baseTexture.textureCacheIds[0]
    );

    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.resolution = settings.RESOLUTION;
    this._text = null;
    this._style = null;
    this._styleListener = null;
    this._font = "";
    this.text = text;
    this.style = style;
    this.localStyleID = -1;
  }

  updateText(respectDirty) {
    const style = this._style;

    if (this.localStyleID !== style.styleID) {
      this.dirty = true;
      this.localStyleID = style.styleID;
    }

    if (!this.dirty && respectDirty) {
      return;
    }

    this._font = this._style.toFontString();

    const context = this.context;
    const measured = TextMetrics.measureText(
      this._text,
      this._style,
      this._style.wordWrap,
      this.canvas
    );
    const width = measured.width;
    const height = measured.height;
    const lines = measured.lines;
    const lineHeight = measured.lineHeight;
    const lineWidths = measured.lineWidths;
    const maxLineWidth = measured.maxLineWidth;
    const fontProperties = measured.fontProperties;

    this.canvas.width = Math.ceil(
      (Math.max(1, width) + style.padding * 2) * this.resolution
    );
    this.canvas.height = Math.ceil(
      (Math.max(1, height) + style.padding * 2) * this.resolution
    );

    context.scale(this.resolution, this.resolution);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground(style);

    context.font = this._font;
    context.strokeStyle = style.stroke;
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;

    let linePositionX;
    let linePositionY;

    if (style.dropShadow) {
      context.fillStyle = style.dropShadowColor;
      context.globalAlpha = style.dropShadowAlpha;
      context.shadowBlur = style.dropShadowBlur;

      if (style.dropShadowBlur > 0) {
        context.shadowColor = style.dropShadowColor;
      }

      const xShadowOffset =
        Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
      const yShadowOffset =
        Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

      for (let i = 0; i < lines.length; i++) {
        linePositionX = style.strokeThickness / 2;
        linePositionY =
          style.strokeThickness / 2 + i * lineHeight + fontProperties.ascent;

        if (style.align === "right") {
          linePositionX += maxLineWidth - lineWidths[i];
        } else if (style.align === "center") {
          linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (style.fill) {
          this.drawLetterSpacing(
            lines[i],
            linePositionX + xShadowOffset + style.padding,
            linePositionY + yShadowOffset + style.padding
          );

          if (style.stroke && style.strokeThickness) {
            context.strokeStyle = style.dropShadowColor;
            this.drawLetterSpacing(
              lines[i],
              linePositionX + xShadowOffset + style.padding,
              linePositionY + yShadowOffset + style.padding,
              true
            );
            context.strokeStyle = style.stroke;
          }
        }
      }
    }

    context.shadowBlur = 0;
    context.globalAlpha = 1;
    context.fillStyle = this._generateFillStyle(style, lines);

    // draw lines line by line
    for (let i = 0; i < lines.length; i++) {
      linePositionX = style.strokeThickness / 2;
      linePositionY =
        style.strokeThickness / 2 + i * lineHeight + fontProperties.ascent;

      if (style.align === "right") {
        linePositionX += maxLineWidth - lineWidths[i];
      } else if (style.align === "center") {
        linePositionX += (maxLineWidth - lineWidths[i]) / 2;
      }

      if (style.stroke && style.strokeThickness) {
        this.drawLetterSpacing(
          lines[i],
          linePositionX + style.padding,
          linePositionY + style.padding,
          true
        );
      }

      if (style.fill) {
        this.drawLetterSpacing(
          lines[i],
          linePositionX + style.padding,
          linePositionY + style.padding
        );
      }
    }

    this.updateTexture();
  }

  drawBackground(style) {
    const background = style.background || style.backgroundColor;
    if (!background) return;

    const { context, canvas, text } = this;
    const ftext = String(text).trim();
    if (ftext) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawLetterSpacing(text, x, y, isStroke = false) {
    const style = this._style;

    // letterSpacing of 0 means normal
    const letterSpacing = style.letterSpacing;

    if (letterSpacing === 0) {
      if (isStroke) {
        this.context.strokeText(text, x, y);
      } else {
        this.context.fillText(text, x, y);
      }

      return;
    }

    const characters = String.prototype.split.call(text, "");
    let currentPosition = x;
    let index = 0;
    let current = "";
    let previousWidth = this.context.measureText(text).width;
    let currentWidth = 0;

    while (index < text.length) {
      current = characters[index++];
      if (isStroke) {
        this.context.strokeText(current, currentPosition, y);
      } else {
        this.context.fillText(current, currentPosition, y);
      }

      currentWidth = this.context.measureText(text.substring(index)).width;
      currentPosition += previousWidth - currentWidth + letterSpacing;
      previousWidth = currentWidth;
    }
  }

  updateStyle(style) {
    for (let key in style) {
      let newKey = this.camelCase(key);
      if (newKey === "color") newKey = "fill";

      this.style[newKey] = style[key];
    }
  }

  camelCase(name) {
    const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;

    return name
      .replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      })
      .replace(MOZ_HACK_REGEXP, "Moz$1");
  }

  updateTexture() {
    const canvas = this.canvas;

    if (this._style.trim) {
      const trimmed = trimCanvas(canvas);

      if (trimmed.data) {
        canvas.width = trimmed.width;
        canvas.height = trimmed.height;
        this.context.putImageData(trimmed.data, 0, 0);
      }
    }

    const texture = this._texture;
    const style = this._style;
    const padding = style.trim ? 0 : style.padding;
    const baseTexture = texture.baseTexture;

    baseTexture.hasLoaded = true;
    baseTexture.resolution = this.resolution;

    baseTexture.realWidth = canvas.width;
    baseTexture.realHeight = canvas.height;
    baseTexture.width = canvas.width / this.resolution;
    baseTexture.height = canvas.height / this.resolution;

    texture.trim.width = texture._frame.width = canvas.width / this.resolution;
    texture.trim.height = texture._frame.height =
      canvas.height / this.resolution;
    texture.trim.x = -padding;
    texture.trim.y = -padding;

    texture.orig.width = texture._frame.width - padding * 2;
    texture.orig.height = texture._frame.height - padding * 2;

    // call sprite onTextureUpdate to update scale if _width or _height were set
    this._onTextureUpdate();
    baseTexture.emit("update", baseTexture);
    this.dirty = false;
  }

  renderWebGL(renderer) {
    if (this.resolution !== renderer.resolution) {
      this.resolution = renderer.resolution;
      this.dirty = true;
    }

    this.updateText(true);
    super.renderWebGL(renderer);
  }

  _renderCanvas(renderer) {
    if (this.resolution !== renderer.resolution) {
      this.resolution = renderer.resolution;
      this.dirty = true;
    }

    this.updateText(true);
    super._renderCanvas(renderer);
  }

  getLocalBounds(rect) {
    this.updateText(true);
    return super.getLocalBounds.call(this, rect);
  }

  _calculateBounds() {
    this.updateText(true);
    this.calculateVertices();
    // if we have already done this on THIS frame.
    this._bounds.addQuad(this.vertexData);
  }

  _onStyleChange() {
    this.dirty = true;
  }

  _generateFillStyle(style, lines) {
    if (!Array.isArray(style.fill)) {
      return style.fill;
    }

    let gradient;
    let totalIterations;
    let currentIteration;
    let stop;

    const width = this.canvas.width / this.resolution;
    const height = this.canvas.height / this.resolution;
    const fill = style.fill.slice();
    const fillGradientStops = style.fillGradientStops.slice();

    if (!fillGradientStops.length) {
      const lengthPlus1 = fill.length + 1;

      for (let i = 1; i < lengthPlus1; ++i) {
        fillGradientStops.push(i / lengthPlus1);
      }
    }

    fill.unshift(style.fill[0]);
    fillGradientStops.unshift(0);

    fill.push(style.fill[style.fill.length - 1]);
    fillGradientStops.push(1);

    if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
      gradient = this.context.createLinearGradient(
        width / 2,
        0,
        width / 2,
        height
      );

      totalIterations = (fill.length + 1) * lines.length;
      currentIteration = 0;
      for (let i = 0; i < lines.length; i++) {
        currentIteration += 1;
        for (let j = 0; j < fill.length; j++) {
          if (typeof fillGradientStops[j] === "number") {
            stop = fillGradientStops[j] / lines.length + i / lines.length;
          } else {
            stop = currentIteration / totalIterations;
          }
          gradient.addColorStop(stop, fill[j]);
          currentIteration++;
        }
      }
    } else {
      gradient = this.context.createLinearGradient(
        0,
        height / 2,
        width,
        height / 2
      );

      totalIterations = fill.length + 1;
      currentIteration = 1;

      for (let i = 0; i < fill.length; i++) {
        if (typeof fillGradientStops[i] === "number") {
          stop = fillGradientStops[i];
        } else {
          stop = currentIteration / totalIterations;
        }
        gradient.addColorStop(stop, fill[i]);
        currentIteration++;
      }
    }

    return gradient;
  }

  destroy(options) {
    if (this.destroyed) return;

    if (typeof options === "boolean") {
      options = { children: options };
    }

    options = Object.assign({}, defaultDestroyOptions, options);
    super.destroy(options);
    this.context = null;
    this.canvas = null;
    this._style = null;
  }

  get width() {
    this.updateText(true);
    return Math.abs(this.scale.x) * this._texture.orig.width;
  }

  set width(value) {
    this.updateText(true);
    const s = sign(this.scale.x) || 1;
    this.scale.x = (s * value) / this._texture.orig.width;
    this._width = value;
  }

  get height() {
    this.updateText(true);
    return Math.abs(this.scale.y) * this._texture.orig.height;
  }

  set height(value) {
    this.updateText(true);
    const s = sign(this.scale.y) || 1;
    this.scale.y = (s * value) / this._texture.orig.height;
    this._height = value;
  }

  get font() {
    return this._font;
  }

  get style() {
    return this._style;
  }

  set style(style) {
    style = style || {};

    if (style instanceof TextStyle) {
      this._style = style;
    } else {
      this._style = new TextStyle(style);
    }

    this.localStyleID = -1;
    this.dirty = true;
  }

  get text() {
    return this._text;
  }

  set text(text) {
    text = String(
      text === "" || text === null || text === undefined ? " " : text
    );

    if (this._text === text) return;
    this._text = text;
    this.dirty = true;
  }
}
