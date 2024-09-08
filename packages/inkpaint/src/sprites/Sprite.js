import { Point, ObservablePoint, Rectangle } from "../math";
import { sign } from "../utils";
import { BLEND_MODES } from "../const";
import Texture from "../textures/Texture";
import Container from "../display/Container";
import { TextureCache } from "../utils/cache";

const tempPoint = new Point();

export default class Sprite extends Container {
  constructor(texture) {
    super();

    this._anchor = new ObservablePoint(
      this._onAnchorUpdate,
      this,
      texture ? texture.defaultAnchor.x : 0,
      texture ? texture.defaultAnchor.y : 0
    );

    this._texture = null;
    this._width = 0;
    this._height = 0;
    this._tint = null;
    this._tintRGB = null;

    this.tint = 0xffffff;
    this.blendMode = BLEND_MODES.NORMAL;
    this.shader = null;
    this.cachedTint = 0xffffff;
    this.texture = texture || Texture.EMPTY;
    this.vertexData = new Float32Array(8);
    this.vertexTrimmedData = null;

    this._transformID = -1;
    this._textureID = -1;

    this._transformTrimmedID = -1;
    this._textureTrimmedID = -1;
    this.pluginName = "sprite";
    this.log = false;
  }

  _onTextureUpdate() {
    this._textureID = -1;
    this._textureTrimmedID = -1;
    this.cachedTint = 0xffffff;

    if (this._width) {
      this.scale.x =
        (sign(this.scale.x) * this._width) / this._texture.orig.width;
    }

    if (this._height) {
      this.scale.y =
        (sign(this.scale.y) * this._height) / this._texture.orig.height;
    }
  }

  _onAnchorUpdate() {
    this._transformID = -1;
    this._transformTrimmedID = -1;
  }

  calculateVertices() {
    if (
      this._transformID === this.transform._worldID &&
      this._textureID === this._texture._updateID
    ) {
      return;
    }

    this._transformID = this.transform._worldID;
    this._textureID = this._texture._updateID;

    const texture = this._texture;
    const wt = this.transform.worldTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const vertexData = this.vertexData;
    const trim = texture.trim;
    const orig = texture.orig;
    const anchor = this._anchor;

    let w0 = 0;
    let w1 = 0;
    let h0 = 0;
    let h1 = 0;

    if (trim) {
      w1 = trim.x - anchor._x * orig.width;
      w0 = w1 + trim.width;

      h1 = trim.y - anchor._y * orig.height;
      h0 = h1 + trim.height;
    } else {
      w1 = -anchor._x * orig.width;
      w0 = w1 + orig.width;

      h1 = -anchor._y * orig.height;
      h0 = h1 + orig.height;
    }

    // xy
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;

    // xy
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;

    // xy
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;

    // xy
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
  }

  calculateTrimmedVertices() {
    if (!this.vertexTrimmedData) {
      this.vertexTrimmedData = new Float32Array(8);
    } else if (
      this._transformTrimmedID === this.transform._worldID &&
      this._textureTrimmedID === this._texture._updateID
    ) {
      return;
    }

    this._transformTrimmedID = this.transform._worldID;
    this._textureTrimmedID = this._texture._updateID;

    // lets do some special trim code!
    const texture = this._texture;
    const vertexData = this.vertexTrimmedData;
    const orig = texture.orig;
    const anchor = this._anchor;

    // lets calculate the new untrimmed bounds..
    const wt = this.transform.worldTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;

    const w1 = -anchor._x * orig.width;
    const w0 = w1 + orig.width;

    const h1 = -anchor._y * orig.height;
    const h0 = h1 + orig.height;

    // xy
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;

    // xy
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;

    // xy
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;

    // xy
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
  }

  _renderWebGL(renderer) {
    this.calculateVertices();

    renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  }

  _renderCanvas(renderer) {
    renderer.plugins[this.pluginName].render(this);
  }

  _calculateBounds() {
    const trim = this._texture.trim;
    const orig = this._texture.orig;

    if (!trim || (trim.width === orig.width && trim.height === orig.height)) {
      this.calculateVertices();
      this._bounds.addQuad(this.vertexData);
    } else {
      this.calculateTrimmedVertices();
      this._bounds.addQuad(this.vertexTrimmedData);
    }
  }

  updateBaseTexture(imageUrl, useCache = false) {
    if (!this.texture) return;
    this.texture.updateSource(imageUrl, useCache);
  }

  getLocalBounds(rect) {
    // we can do a fast local bounds if the sprite has no children!
    if (this.children.length === 0) {
      this._bounds.minX = this._texture.orig.width * -this._anchor._x;
      this._bounds.minY = this._texture.orig.height * -this._anchor._y;
      this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
      this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._y);

      if (!rect) {
        if (!this._localBoundsRect) {
          this._localBoundsRect = new Rectangle();
        }
        rect = this._localBoundsRect;
      }

      return this._bounds.getRectangle(rect);
    }

    return super.getLocalBounds.call(this, rect);
  }

  containsPoint(point) {
    this.worldTransform.applyInverse(point, tempPoint);

    const width = this._texture.orig.width;
    const height = this._texture.orig.height;
    const x1 = -width * this.anchor.x;
    let y1 = 0;

    if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
      y1 = -height * this.anchor.y;
      if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
        return true;
      }
    }

    return false;
  }

  destroy(options) {
    if (this.destroyed) return;

    super.destroy(options);
    this._texture.off("update", this._onTextureUpdate, this);
    this._anchor = null;

    const destroyTexture =
      typeof options === "boolean" ? options : options && options.texture;

    if (destroyTexture) {
      const destroyBaseTexture =
        typeof options === "boolean" ? options : options && options.baseTexture;
      this._texture.destroy(!!destroyBaseTexture);
    }

    this._texture = null;
    this.shader = null;
  }

  static from(source) {
    return new Sprite(Texture.from(source));
  }

  static fromFrame(frameId) {
    const texture = TextureCache[frameId];
    if (!texture) throw new Error(`The frameId "${frameId}" does not exist`);

    return new Sprite(texture);
  }

  static fromImage(imageId, crossorigin, scaleMode) {
    return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
  }

  get width() {
    return Math.abs(this.scale.x) * this._texture.orig.width;
  }

  set width(value) {
    const s = sign(this.scale.x) || 1;
    this.scale.x = (s * value) / this._texture.orig.width;
    this._width = value;
  }

  get height() {
    return Math.abs(this.scale.y) * this._texture.orig.height;
  }

  set height(value) {
    const s = sign(this.scale.y) || 1;
    this.scale.y = (s * value) / this._texture.orig.height;
    this._height = value;
  }

  get anchor() {
    return this._anchor;
  }

  set anchor(value) {
    this._anchor.copy(value);
  }

  get tint() {
    return this._tint;
  }

  set tint(value) {
    this._tint = value;
    this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
  }

  get texture() {
    return this._texture;
  }

  set texture(value) {
    if (this._texture === value) return;

    this._texture = value || Texture.EMPTY;
    this.cachedTint = 0xffffff;
    this._textureID = -1;
    this._textureTrimmedID = -1;

    if (!value) return;
    if (value.baseTexture.hasLoaded) {
      this._onTextureUpdate();
    } else {
      value.once("update", this._onTextureUpdate, this);
    }
  }
}
