import poly from "./poly";
import { createCanvas, Image as CImage } from "../canvas-gl";
import EventEmitter from "eventemitter3";
import { isBrowser } from "browser-or-node";

let myCanvas;
class PsImage extends poly(CImage) {
  constructor(...args) {
    super(...args);
    this.isPsImage = true;
  }

  addEventListener(name, cb) {
    if (!this._eventemitter) {
      this._eventemitter = new EventEmitter();
    }

    this._eventemitter.once(name, cb);
  }

  static convertToImageData(image, flip = false) {
    const { width, height } = image;

    if (!myCanvas) myCanvas = createCanvas(width, height);
    myCanvas.width = width;
    myCanvas.height = height;
    const ctx = myCanvas.getContext("2d");

    if (flip) {
      ctx.scale(1, -1);
      ctx.translate(0, -height);
    }

    ctx.clearRect(width, height);
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, width, height);
  }

  static convertToCanvas(imgData, width, height) {
    const can = createCanvas(width, height);
    const ctx = can.getContext("2d");
    ctx.putImageData(imgData, 0, 0);
    return can;
  }
}

export default isBrowser ? window.Image : PsImage;
