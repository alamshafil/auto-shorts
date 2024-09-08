import BaseRenderTexture from "./BaseRenderTexture";
import Texture from "./Texture";

export default class RenderTexture extends Texture {
  constructor(baseRenderTexture, frame) {
    // support for legacy..
    let _legacyRenderer = null;

    if (!(baseRenderTexture instanceof BaseRenderTexture)) {
      /* eslint-disable prefer-rest-params, no-console */
      const width = arguments[1];
      const height = arguments[2];
      const scaleMode = arguments[3];
      const resolution = arguments[4];

      // we have an old render texture..
      console.warn(
        `Please use RenderTexture.create(${width}, ${height}) instead of the ctor directly.`
      );
      _legacyRenderer = arguments[0];
      frame = null;
      baseRenderTexture = new BaseRenderTexture(
        width,
        height,
        scaleMode,
        resolution
      );
    }

    super(baseRenderTexture, frame);
    this.legacyRenderer = _legacyRenderer;
    this.valid = true;
    this._updateUvs();
  }

  resize(width, height, doNotResizeBaseTexture) {
    width = Math.ceil(width);
    height = Math.ceil(height);

    // TODO - could be not required..
    this.valid = width > 0 && height > 0;
    this._frame.width = this.orig.width = width;
    this._frame.height = this.orig.height = height;

    if (!doNotResizeBaseTexture) {
      this.baseTexture.resize(width, height);
    }

    this._updateUvs();
  }

  static create(width, height, scaleMode, resolution) {
    return new RenderTexture(
      new BaseRenderTexture(width, height, scaleMode, resolution)
    );
  }
}
