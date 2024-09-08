import BaseTexture from "./BaseTexture";
import settings from "../settings";

export default class BaseRenderTexture extends BaseTexture {
  constructor(width = 100, height = 100, scaleMode, resolution) {
    super(null, scaleMode);

    this.resolution = resolution || settings.RESOLUTION;
    this.width = Math.ceil(width);
    this.height = Math.ceil(height);
    this.realWidth = this.width * this.resolution;
    this.realHeight = this.height * this.resolution;
    this.scaleMode = scaleMode !== undefined ? scaleMode : settings.SCALE_MODE;
    this.hasLoaded = true;

    this._glRenderTargets = {};
    this._canvasRenderTarget = null;
    this.valid = false;
  }

  resize(width, height) {
    width = Math.ceil(width);
    height = Math.ceil(height);

    if (width === this.width && height === this.height) {
      return;
    }

    this.valid = width > 0 && height > 0;
    this.width = width;
    this.height = height;
    this.realWidth = this.width * this.resolution;
    this.realHeight = this.height * this.resolution;

    if (!this.valid) {
      return;
    }

    this.emit("update", this);
  }

  destroy() {
    super.destroy(true);
    this.renderer = null;
  }
}
