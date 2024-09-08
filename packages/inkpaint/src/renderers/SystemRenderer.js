import { hex2string, hex2rgb } from "../utils";
import { Matrix, Rectangle } from "../math";
import { RENDERER_TYPE } from "../const";
import EventEmitter from "eventemitter3";
import Doc from "../polyfill/Doc";
import settings from "../settings";
import Container from "../display/Container";
import RenderTexture from "../textures/RenderTexture";
const tempMatrix = new Matrix();

export default class SystemRenderer extends EventEmitter {
  constructor(system, options, arg2, arg3) {
    super();

    if (typeof options === "number") {
      options = Object.assign(
        {
          width: options,
          height: arg2 || settings.RENDER_OPTIONS.height
        },
        arg3
      );
    }

    options = Object.assign({}, settings.RENDER_OPTIONS, options);
    this.options = options;
    this.type = RENDERER_TYPE.UNKNOWN;
    this.screen = new Rectangle(0, 0, options.width, options.height);
    this.view = options.view || Doc.createElement("canvas");
    this.resolution = options.resolution || settings.RESOLUTION;
    this.transparent = options.transparent;
    this.autoResize = options.autoResize || false;
    this.blendModes = null;
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;
    this.clearBeforeRender = options.clearBeforeRender;
    this.roundPixels = options.roundPixels;

    this._backgroundColor = 0x000000;
    this._backgroundColorRgba = [0, 0, 0, 0];
    this._backgroundColorString = "#000000";

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter
    this._tempDisplayObjectParent = new Container();
    this._lastObjectRendered = this._tempDisplayObjectParent;
  }

  get width() {
    return this.view.width;
  }

  get height() {
    return this.view.height;
  }

  resize(screenWidth, screenHeight) {
    this.screen.width = screenWidth;
    this.screen.height = screenHeight;

    this.view.width = screenWidth * this.resolution;
    this.view.height = screenHeight * this.resolution;

    if (this.autoResize) {
      this.view.style.width = `${screenWidth}px`;
      this.view.style.height = `${screenHeight}px`;
    }
  }

  destroy(removeView) {
    if (removeView && this.view.parentNode) {
      this.view.parentNode.removeChild(this.view);
    }

    this.type = RENDERER_TYPE.UNKNOWN;
    this.view = null;
    this.screen = null;
    this.resolution = 0;
    this.transparent = false;
    this.autoResize = false;
    this.blendModes = null;
    this.options = null;

    this.preserveDrawingBuffer = false;
    this.clearBeforeRender = false;
    this.roundPixels = false;

    this._backgroundColor = 0;
    this._backgroundColorRgba = null;
    this._backgroundColorString = null;

    this._tempDisplayObjectParent = null;
    this._lastObjectRendered = null;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = value;
    this._backgroundColorString = hex2string(value);
    hex2rgb(value, this._backgroundColorRgba);
  }
}
