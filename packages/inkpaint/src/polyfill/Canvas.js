import { gl, Canvas, createImageData } from "../canvas-gl";
import poly from "./poly";
import GLFix from "./glfix";
import { uuidvx } from "../utils";
import EventEmitter from "eventemitter3";

export default class PSCanvas extends poly(Canvas) {
  constructor(width, height, type) {
    super(width, height, type);

    this._event = new EventEmitter();
    this._glResizeExt = null;
    this._gl = null;
    this._renderType = "2d";
    this.useTypedArray = false;
    this.isPSCanvas = true;
    this.id = uuidvx();
  }

  // Get canvas context
  getContext(type, options) {
    this._renderType = type;

    if (type === "webgl") {
      if (this._gl) return this._gl;

      const { width, height } = this;
      const ctx = gl(width, height, options);
      GLFix.fixGetUniformLocation(ctx);
      GLFix.fixTexImage2D(ctx);

      this._gl = ctx;
      this._glResizeExt = ctx.getExtension("STACKGL_resize_drawingbuffer");
      this._ctx = super.getContext("2d", options);
      return this._gl;
    }

    return super.getContext(type, options);
  }

  // Canvas Reset width and height
  get height() {
    return super.height;
  }

  set height(value) {
    if (this._glResizeExt) this._glResizeExt.resize(this.width, value);
    super.height = value;
  }

  get width() {
    return super.width;
  }

  set width(value) {
    if (this._glResizeExt) this._glResizeExt.resize(value, this.height);
    super.width = value;
  }

  get clientWidth() {
    return super.width;
  }

  get clientHeight() {
    return super.height;
  }

  // add and remove event listener
  addEventListener(type, listener) {
    return this._event.addListener(type, listener);
  }

  removeEventListener(type, listener) {
    if (listener) return this._event.removeListener(type, listener);
    return this._event.removeAllListeners(type);
  }

  _putImageData() {
    let data;
    const { width, height, _ctx, _gl, useTypedArray } = this;
    const pixels = new Uint8Array(width * height * 4);
    _gl.readPixels(0, 0, width, height, _gl.RGBA, _gl.UNSIGNED_BYTE, pixels);

    if (useTypedArray) {
      data = createImageData(new Uint8ClampedArray(pixels), width, height);
    } else {
      data = _ctx.getImageData(0, 0, width, height);
      this._fillImageData(data, pixels, width, height);
    }

    _ctx.putImageData(data, 0, 0);
  }

  _fillImageData(data, pixels, width, height) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const col = j;
        const row = height - i - 1;
        for (let k = 0; k < 4; k++) {
          const idx = 4 * (row * width + col) + k;
          const idx2 = 4 * (i * width + col) + k;
          data.data[idx] = pixels[idx2];
        }
      }
    }

    return data;
  }

  // Store buffer png jpg and other data
  toBuffer(...args) {
    if (this._gl) this._putImageData();
    return super.toBuffer(...args);
  }

  toDataURL(...args) {
    if (this._gl) this._putImageData();
    return super.toDataURL(...args);
  }

  createPNGStream(...args) {
    if (this._gl) this._putImageData();
    return super.createPNGStream(...args);
  }

  createJPEGStream(...args) {
    if (this._gl) this._putImageData();
    return super.createJPEGStream(...args);
  }

  createPDFStream(...args) {
    if (this._gl) this._putImageData();
    return super.createPDFStream(...args);
  }

  destroy() {
    //super.destroy();
    this._event.removeAllListeners();
    this._event = null;
    this._glResizeExt = null;
    this._gl = null;
  }
}
