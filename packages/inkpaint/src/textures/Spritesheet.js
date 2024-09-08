import { Rectangle, Texture } from "../core";
import { getResolutionOfUrl } from "../utils";
import { addToTextureCache } from "../utils/cache";

export default class Spritesheet {
  static get BATCH_SIZE() {
    return 1000;
  }

  constructor(baseTexture, data, resolutionFilename = null) {
    this.baseTexture = baseTexture;
    this.textures = {};
    this.animations = {};
    this.data = data;
    this.resolution = this._updateResolution(
      resolutionFilename || this.baseTexture.imageUrl
    );

    this._frames = this.data.frames;
    this._frameKeys = Object.keys(this._frames);
    this._batchIndex = 0;
    this._callback = null;
  }

  _updateResolution(resolutionFilename) {
    const scale = this.data.meta.scale;

    // Use a defaultValue of `null` to check if a url-based resolution is set
    let resolution = getResolutionOfUrl(resolutionFilename, null);

    // No resolution found via URL
    if (resolution === null) {
      // Use the scale value or default to 1
      resolution = scale !== undefined ? parseFloat(scale) : 1;
    }

    // For non-1 resolutions, update baseTexture
    if (resolution !== 1) {
      this.baseTexture.resolution = resolution;
      this.baseTexture.update();
    }

    return resolution;
  }

  parse(callback) {
    this._batchIndex = 0;
    this._callback = callback;

    if (this._frameKeys.length <= Spritesheet.BATCH_SIZE) {
      this._processFrames(0);
      this._processAnimations();
      this._parseComplete();
    } else {
      this._nextBatch();
    }
  }

  _processFrames(initialFrameIndex) {
    let frameIndex = initialFrameIndex;
    const maxFrames = Spritesheet.BATCH_SIZE;
    const sourceScale = this.baseTexture.sourceScale;

    while (
      frameIndex - initialFrameIndex < maxFrames &&
      frameIndex < this._frameKeys.length
    ) {
      const i = this._frameKeys[frameIndex];
      const data = this._frames[i];
      const rect = data.frame;

      if (rect) {
        let frame = null;
        let trim = null;
        const sourceSize =
          data.trimmed !== false && data.sourceSize
            ? data.sourceSize
            : data.frame;

        const orig = new Rectangle(
          0,
          0,
          Math.floor(sourceSize.w * sourceScale) / this.resolution,
          Math.floor(sourceSize.h * sourceScale) / this.resolution
        );

        if (data.rotated) {
          frame = new Rectangle(
            Math.floor(rect.x * sourceScale) / this.resolution,
            Math.floor(rect.y * sourceScale) / this.resolution,
            Math.floor(rect.h * sourceScale) / this.resolution,
            Math.floor(rect.w * sourceScale) / this.resolution
          );
        } else {
          frame = new Rectangle(
            Math.floor(rect.x * sourceScale) / this.resolution,
            Math.floor(rect.y * sourceScale) / this.resolution,
            Math.floor(rect.w * sourceScale) / this.resolution,
            Math.floor(rect.h * sourceScale) / this.resolution
          );
        }

        //  Check to see if the sprite is trimmed
        if (data.trimmed !== false && data.spriteSourceSize) {
          trim = new Rectangle(
            Math.floor(data.spriteSourceSize.x * sourceScale) / this.resolution,
            Math.floor(data.spriteSourceSize.y * sourceScale) / this.resolution,
            Math.floor(rect.w * sourceScale) / this.resolution,
            Math.floor(rect.h * sourceScale) / this.resolution
          );
        }

        this.textures[i] = new Texture(
          this.baseTexture,
          frame,
          orig,
          trim,
          data.rotated ? 2 : 0,
          data.anchor
        );

        addToTextureCache(this.textures[i], i);
      }

      frameIndex++;
    }
  }

  _processAnimations() {
    const animations = this.data.animations || {};

    for (const animName in animations) {
      this.animations[animName] = [];
      for (const frameName of animations[animName]) {
        this.animations[animName].push(this.textures[frameName]);
      }
    }
  }

  _parseComplete() {
    const callback = this._callback;

    this._callback = null;
    this._batchIndex = 0;
    callback.call(this, this.textures);
  }

  _nextBatch() {
    this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
    this._batchIndex++;
    setTimeout(() => {
      if (this._batchIndex * Spritesheet.BATCH_SIZE < this._frameKeys.length) {
        this._nextBatch();
      } else {
        this._processAnimations();
        this._parseComplete();
      }
    }, 0);
  }

  destroy(destroyBase = false) {
    for (const i in this.textures) {
      this.textures[i].destroy();
    }
    this._frames = null;
    this._frameKeys = null;
    this.data = null;
    this.textures = null;
    if (destroyBase) {
      this.baseTexture.destroy();
    }
    this.baseTexture = null;
  }
}
