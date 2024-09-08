import PsImage from "../polyfill/Image";
import settings from "../settings";
import bitTwiddle from "bit-twiddle";
import EventEmitter from "eventemitter3";
import {
  uid,
  rgb2hsl,
  getUrlFileExt,
  decomposeDataUri,
  getResolutionOfUrl
} from "../utils";
import {
  TextureCache,
  BaseTextureCache,
  addToBaseTextureCache,
  removeFromBaseTextureCache
} from "../utils/cache";

export default class BaseTexture extends EventEmitter {
  constructor(source, scaleMode, resolution) {
    super();

    this.uid = uid();
    this.touched = 0;
    this.width = 100;
    this.height = 100;
    this.realWidth = 100;
    this.realHeight = 100;

    this.resolution = resolution || settings.RESOLUTION;
    this.scaleMode = scaleMode !== undefined ? scaleMode : settings.SCALE_MODE;

    this.hasLoaded = false;
    this.isLoading = false;
    this.image = null;
    this.source = null;
    this.imageType = null;
    this.sourceScale = 1.0;
    this.premultipliedAlpha = true;
    this.imageUrl = null;
    this.isPowerOfTwo = false;
    this.cutout = false;
    this.cutoutColors = null;

    this.mipmap = settings.MIPMAP_TEXTURES;
    this.wrapMode = settings.WRAP_MODE;

    this._glTextures = {};
    this._enabled = 0;
    this._virtalBoundId = -1;
    this.destroyed = false;
    this.textureCacheIds = [];

    this.loadSource(source);
  }

  updateSource(imageUrl) {
    if (!this.image) this.image = new PsImage();

    this.resetImage(this.image);
    this.loadSource(this.image);
    this.image.src = imageUrl;
    this.imageUrl = imageUrl;
    this.resolution = getResolutionOfUrl(imageUrl);
  }

  loadSource(source) {
    if (!source) return;

    const wasLoading = this.isLoading;
    this.hasLoaded = false;
    this.isLoading = false;
    if (wasLoading && this.source) this.removeHandler(this.source);

    const firstLoaded = !this.source;
    this.source = source;

    // source resources loaded
    const { src, width, height, complete, getContext, network } = source;
    const hasSize = width && height;

    if (((src && complete) || (network && complete) || getContext) && hasSize) {
      this._updateImageType();
      this._sourceLoaded();
      if (firstLoaded) this.emit("loaded", this);
    }

    // the resource is not loaded
    else if (!getContext) {
      this.isLoading = true;
      source.onload = () => {
        this._updateImageType();
        this.removeHandler(source);

        if (!this.isLoading) return;
        this.isLoading = false;
        this._sourceLoaded();
        this.emit("loaded", this);
      };

      source.onerror = () => {
        this.removeHandler(source);
        if (!this.isLoading) return;
        this.isLoading = false;
        this.emit("error", this);
      };

      if (complete && src) {
        this.removeHandler(source);
        this.isLoading = false;

        if (width && height) {
          this._sourceLoaded();
          if (wasLoading) this.emit("loaded", this);
        } else if (wasLoading) {
          this.emit("error", this);
        }
      }
    }
  }

  removeHandler(source) {
    source.onload = null;
    source.onerror = null;
  }

  resetImage(image) {
    image.src = "";
    image.width = 0;
    image.height = 0;
  }

  adaptedNodeCanvas() {
    const { source, cutout, cutoutColors } = this;
    if (source && source instanceof PsImage && source.isPsImage) {
      this.source = PsImage.convertToImageData(source);

      if (cutout) {
        const { min, max } = cutoutColors;
        this.cutoutImageData({ pixel: this.source, min, max });
      }
    }
  }

  cutoutImageData({ pixel, min, max }) {
    const { data } = pixel;
    const length = data.length;

    for (let i = 0; i < length; i += 4) {
      const r = data[i + 0];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgb2hsl(r, g, b);

      if (h > min && h < max) {
        data[i + 3] = 0;
      }
    }
  }

  update() {
    if (this.imageType !== "svg") {
      this.realWidth =
        this.source.naturalWidth || this.source.videoWidth || this.source.width;

      this.realHeight =
        this.source.naturalHeight ||
        this.source.videoHeight ||
        this.source.height;

      // update width and height
      this._updateDimensions();
    }

    this.emit("update", this);
  }

  _updateDimensions() {
    this.width = this.realWidth / this.resolution;
    this.height = this.realHeight / this.resolution;

    this.isPowerOfTwo =
      bitTwiddle.isPow2(this.realWidth) && bitTwiddle.isPow2(this.realHeight);
  }

  _updateImageType() {
    if (!this.imageUrl) return;

    const dataUri = decomposeDataUri(this.imageUrl);
    let imageType;

    if (dataUri && dataUri.mediaType === "image") {
      const firstSubType = dataUri.subType.split("+")[0];
      imageType = getUrlFileExt(`.${firstSubType}`);
    } else {
      imageType = getUrlFileExt(this.imageUrl);
    }

    this.imageType = imageType || "png";
  }

  _sourceLoaded() {
    this.hasLoaded = true;
    this.update();
  }

  destroy() {
    if (this.imageUrl) {
      delete TextureCache[this.imageUrl];
      this.imageUrl = null;
      this.source.src = "";
      this.removeHandler(this.source);
    }

    if (this.image) {
      this.image.src = "";
      this.image = null;
    }

    this.source = null;
    this.dispose();

    removeFromBaseTextureCache(this);
    this.textureCacheIds = null;
    this.destroyed = true;
    this.cutout = false;
    this.cutoutColors = null;
  }

  dispose() {
    this.emit("dispose", this);
  }

  static fromImage(imageUrl, crossorigin, scaleMode, sourceScale) {
    let baseTexture = BaseTextureCache[imageUrl];

    if (!baseTexture) {
      const image = new PsImage();
      baseTexture = new BaseTexture(image, scaleMode);
      baseTexture.imageUrl = imageUrl;

      if (sourceScale) baseTexture.sourceScale = sourceScale;
      baseTexture.resolution = getResolutionOfUrl(imageUrl);
      image.src = imageUrl;

      addToBaseTextureCache(baseTexture, imageUrl);
    }

    return baseTexture;
  }

  static fromCanvas(canvas, scaleMode, origin = "canvas") {
    if (!canvas.__paintId) canvas.__paintId = `${origin}_${uid()}`;

    let baseTexture = BaseTextureCache[canvas.__paintId];
    if (!baseTexture) {
      baseTexture = new BaseTexture(canvas, scaleMode);
      addToBaseTextureCache(baseTexture, canvas.__paintId);
    }

    return baseTexture;
  }

  static from(source, scaleMode, sourceScale) {
    if (typeof source === "string") {
      return BaseTexture.fromImage(source, undefined, scaleMode, sourceScale);
    } else if (source instanceof HTMLImageElement) {
      const imageUrl = source.src;
      let baseTexture = BaseTextureCache[imageUrl];

      if (!baseTexture) {
        baseTexture = new BaseTexture(source, scaleMode);
        baseTexture.imageUrl = imageUrl;

        if (sourceScale) {
          baseTexture.sourceScale = sourceScale;
        }

        baseTexture.resolution = getResolutionOfUrl(imageUrl);
        addToBaseTextureCache(baseTexture, imageUrl);
      }

      return baseTexture;
    } else if (source instanceof HTMLCanvasElement) {
      return BaseTexture.fromCanvas(source, scaleMode);
    }

    return source;
  }
}
