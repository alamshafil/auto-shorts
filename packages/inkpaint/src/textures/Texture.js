import BaseTexture from "./BaseTexture";
import settings from "../settings";
import TextureUvs from "./TextureUvs";
import EventEmitter from "eventemitter3";
import { Rectangle, Point } from "../math";
import { getResolutionOfUrl, uuidvx } from "../utils";
import {
  TextureCache,
  addToTextureCache,
  removeFromTextureCache,
  addToBaseTextureCache,
  destroyBaseTextureCache
} from "../utils/cache";

export default class Texture extends EventEmitter {
  constructor(baseTexture, frame, orig, trim, rotate, anchor) {
    super();

    if (frame) {
      this.hasDefaultFrame = true;
    } else {
      this.hasDefaultFrame = false;
      frame = new Rectangle(0, 0, 1, 1);
    }

    this._uvs = null;
    this._cache = [];
    this.valid = false;
    this.destroyed = false;
    this.requiresUpdate = false;
    this.cutout = false;
    this.cutoutColors = null;

    this.trim = trim;
    this.orig = orig || frame;
    this._frame = frame;
    this._rotate = Number(rotate || 0);
    this._updateID = 0;
    this.transform = null;
    this.textureCacheIds = [];

    if (rotate === true) {
      this._rotate = 2;
    } else if (this._rotate % 2 !== 0) {
      throw new Error("attempt to use diamond-shaped UVs.");
    }

    this.id = uuidvx();
    this.initBaseTexture(baseTexture, frame);
    this.defaultAnchor = anchor
      ? new Point(anchor.x, anchor.y)
      : new Point(0, 0);
  }

  initBaseTexture(baseTexture, frame) {
    if (baseTexture instanceof Texture) baseTexture = baseTexture.baseTexture;

    this.baseTexture = baseTexture;
    this.setCutoutToBaseTexture();
    this.addToCache(baseTexture.imageUrl);

    if (baseTexture.hasLoaded) {
      if (!this.hasDefaultFrame) {
        // from 1,1 -> w,h
        const { width, height } = baseTexture;
        this.frame = new Rectangle(0, 0, width, height);
        baseTexture.on("update", this.onBaseTextureUpdated, this);
      } else {
        this.frame = frame;
      }

      baseTexture.adaptedNodeCanvas();
    } else {
      baseTexture.once("loaded", this.onBaseTextureLoaded, this);
    }

    baseTexture.on("error", this.onBaseTextureError, this);
  }

  update() {
    this.baseTexture.update();
  }

  addToCache(imageUrl) {
    if (!imageUrl) return;
    if (this._cache.indexOf(imageUrl) < 0) this._cache.push(imageUrl);
  }

  updateSource(imageUrl, useCache = false) {
    if (this.baseTexture.imageUrl === imageUrl) return;

    if (useCache) {
      this.addToCache(imageUrl);
      this.baseTexture = BaseTexture.fromImage(imageUrl);
      this.setCutoutToBaseTexture();
      this.baseTexture.adaptedNodeCanvas();
    } else {
      this.baseTexture.updateSource(imageUrl);
    }
  }

  setCutoutColor(min, max) {
    this.cutout = true;
    this.cutoutColors = { min, max };
    this.setCutoutToBaseTexture();
  }

  setCutoutToBaseTexture() {
    if (!this.baseTexture) return;

    this.baseTexture.cutout = this.cutout;
    this.baseTexture.cutoutColors = this.cutoutColors;
  }

  getImageUrl() {
    return this.baseTexture.imageUrl;
  }

  onBaseTextureLoaded(baseTexture) {
    this._updateID++;

    if (!this.hasDefaultFrame) {
      // from 1,1 -> w,h
      const { width, height } = baseTexture;
      this.frame = new Rectangle(0, 0, width, height);
    } else {
      this.frame = this._frame;
    }

    baseTexture.adaptedNodeCanvas();
    this.baseTexture.on("update", this.onBaseTextureUpdated, this);
    this.emit("update", this);
  }

  onBaseTextureError(e) {
    this.emit("error", e);
  }

  onBaseTextureUpdated(baseTexture) {
    this._updateID++;
    if (!this.hasDefaultFrame) {
      this._frame.width = baseTexture.width;
      this._frame.height = baseTexture.height;
    }

    baseTexture.adaptedNodeCanvas();
    this.emit("update", this);
  }

  destroy(destroyBase) {
    if (this.destroyed) return;

    if (this.baseTexture) {
      if (destroyBase) {
        const { imageUrl } = this.baseTexture;
        if (TextureCache[imageUrl]) {
          removeFromTextureCache(imageUrl);
        }

        for (let i = 0; i < this._cache.length; i++) {
          const urlKey = this._cache[i];
          destroyBaseTextureCache(urlKey);
        }
        this.baseTexture.destroy();
      }

      this.baseTexture.off("update", this.onBaseTextureUpdated, this);
      this.baseTexture.off("loaded", this.onBaseTextureLoaded, this);
      this.baseTexture.off("error", this.onBaseTextureError, this);
      this.baseTexture = null;
    }

    this._cache.length = 0;
    this._cache = null;
    this._frame = null;
    this._uvs = null;
    this.trim = null;
    this.orig = null;
    this.valid = false;
    this.cutout = false;
    this.cutoutColors = null;
    this.destroyed = true;

    removeFromTextureCache(this);
    this.textureCacheIds = null;
  }

  clone() {
    return new Texture(
      this.baseTexture,
      this.frame,
      this.orig,
      this.trim,
      this.rotate,
      this.defaultAnchor
    );
  }

  _updateUvs() {
    if (!this._uvs) this._uvs = new TextureUvs();
    this._uvs.set(this._frame, this.baseTexture, this.rotate);
    this._updateID++;
  }

  get frame() {
    return this._frame;
  }

  set frame(frame) {
    this._frame = frame;
    this.hasDefaultFrame = true;
    const { x, y, width, height } = frame;
    const xNotFit = x + width > this.baseTexture.width;
    const yNotFit = y + height > this.baseTexture.height;

    if (xNotFit || yNotFit) {
      const relationship = xNotFit && yNotFit ? "and" : "or";
      const errorX = `X: ${x} + ${width} = ${x + width} > ${
        this.baseTexture.width
      }`;
      const errorY = `Y: ${y} + ${height} = ${y + height} > ${
        this.baseTexture.height
      }`;

      throw new Error(
        "Texture Error: frame does not fit inside the base Texture dimensions: " +
          `${errorX} ${relationship} ${errorY}`
      );
    }

    this.valid = width && height && this.baseTexture.hasLoaded;
    if (!this.trim && !this.rotate) {
      this.orig = frame;
    }

    if (this.valid) this._updateUvs();
  }

  get rotate() {
    return this._rotate;
  }

  set rotate(rotate) {
    this._rotate = rotate;
    if (this.valid) this._updateUvs();
  }

  get width() {
    return this.orig.width;
  }

  get height() {
    return this.orig.height;
  }

  static newEmpty() {
    return new Texture(new BaseTexture());
  }

  static fromImage(imageUrl, crossorigin, scaleMode, sourceScale) {
    let texture = TextureCache[imageUrl];
    if (texture) return texture;

    if (crossorigin instanceof Rectangle) {
      texture = new Texture(
        BaseTexture.fromImage(imageUrl),
        crossorigin,
        scaleMode,
        sourceScale
      );
    } else {
      texture = new Texture(
        BaseTexture.fromImage(imageUrl, crossorigin, scaleMode, sourceScale)
      );
    }

    addToTextureCache(texture, imageUrl);
    return texture;
  }

  static fromFrame(frameId) {
    const texture = TextureCache[frameId];
    if (!texture) {
      throw new Error(`The frameId "${frameId}" does not exist in cache`);
    }

    return texture;
  }

  static fromCanvas(canvas, scaleMode, origin = "canvas") {
    return new Texture(BaseTexture.fromCanvas(canvas, scaleMode, origin));
  }

  static from(source) {
    if (typeof source === "string") {
      const texture = TextureCache[source];
      if (texture) return texture;
      return Texture.fromImage(source);
    } else if (source instanceof Texture) {
      return source;
    } else if (source instanceof HTMLImageElement) {
      return new Texture(BaseTexture.from(source));
    } else if (source instanceof HTMLCanvasElement) {
      return Texture.fromCanvas(
        source,
        settings.SCALE_MODE,
        "HTMLCanvasElement"
      );
    } else if (source instanceof BaseTexture) {
      return new Texture(source);
    }

    return source;
  }

  static fromLoader(source, imageUrl, name) {
    const baseTexture = new BaseTexture(
      source,
      undefined,
      getResolutionOfUrl(imageUrl)
    );

    const texture = new Texture(baseTexture);
    baseTexture.imageUrl = imageUrl;
    if (!name) name = imageUrl;

    addToBaseTextureCache(texture.baseTexture, name);
    addToTextureCache(texture, name);

    if (name !== imageUrl) {
      addToBaseTextureCache(texture.baseTexture, imageUrl);
      addToTextureCache(texture, imageUrl);
    }
    return texture;
  }
}

function removeAllHandlers(tex) {
  tex.destroy = () => {};
  tex.on = () => {};
  tex.once = () => {};
  tex.emit = () => {};
}

Texture.EMPTY = new Texture(new BaseTexture());
removeAllHandlers(Texture.EMPTY);
removeAllHandlers(Texture.EMPTY.baseTexture);
