import EventEmitter from "eventemitter3";
import { TRANSFORM_MODE } from "../const";
import Bounds from "./Bounds";
import settings from "../settings";
import Transform from "./Transform";
import { uuidvx } from "../utils";
import { Rectangle, Point } from "../math";
import TransformStatic from "./TransformStatic";
import FXAAFilter from "../filters/fxaa/FXAAFilter";
import BlurFilter from "../filters/blur/BlurFilter";

export default class DisplayObject extends EventEmitter {
  constructor() {
    super();

    const TransformClass =
      settings.TRANSFORM_MODE === TRANSFORM_MODE.STATIC
        ? TransformStatic
        : Transform;

    this.tempDisplayObjectParent = null;
    this.transform = new TransformClass();
    this.alpha = 1;
    this.visible = true;
    this.renderable = true;
    this.parent = null;
    this.worldAlpha = 1;
    this.filterArea = null;
    this.initScale = new Point(1, 1);

    this.filters = null;
    this._enabledFilters = null;
    this._bounds = new Bounds();
    this._boundsID = 0;
    this._lastBoundsID = -1;
    this._boundsRect = null;
    this._localBoundsRect = null;
    this._mask = null;
    this._blur = 0;
    this._fxaa = false;
    this.maskEnabled = true;
    this.destroyed = false;
    this.id = uuidvx();
  }

  get _tempDisplayObjectParent() {
    if (this.tempDisplayObjectParent === null) {
      this.tempDisplayObjectParent = new DisplayObject();
    }
    return this.tempDisplayObjectParent;
  }

  updateTransform() {
    this.transform.updateTransform(this.parent.transform);
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
    this._bounds.updateID++;
  }

  _recursivePostUpdateTransform() {
    if (this.parent) {
      this.parent._recursivePostUpdateTransform();
      this.transform.updateTransform(this.parent.transform);
    } else {
      this.transform.updateTransform(this._tempDisplayObjectParent.transform);
    }
  }

  getBounds(skipUpdate, rect) {
    if (!skipUpdate) {
      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.updateTransform();
        this.parent = null;
      } else {
        this._recursivePostUpdateTransform();
        this.updateTransform();
      }
    }

    if (this._boundsID !== this._lastBoundsID && this.maskEnabled) {
      this.calculateBounds();
    }

    if (!rect) {
      if (!this._boundsRect) {
        this._boundsRect = new Rectangle();
      }
      rect = this._boundsRect;
    }

    return this._bounds.getRectangle(rect);
  }

  getLocalBounds(rect) {
    const transformRef = this.transform;
    const parentRef = this.parent;
    this.parent = null;
    this.transform = this._tempDisplayObjectParent.transform;

    if (!rect) {
      if (!this._localBoundsRect) {
        this._localBoundsRect = new Rectangle();
      }
      rect = this._localBoundsRect;
    }

    const bounds = this.getBounds(false, rect);
    this.parent = parentRef;
    this.transform = transformRef;
    return bounds;
  }

  toGlobal(position, point, skipUpdate = false) {
    if (!skipUpdate) {
      this._recursivePostUpdateTransform();

      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
      } else {
        this.displayObjectUpdateTransform();
      }
    }

    return this.worldTransform.apply(position, point);
  }

  getGlobalPosition(point, skipUpdate = false) {
    if (this.parent) {
      this.parent.toGlobal(this.position, point, skipUpdate);
    } else {
      point.x = this.position.x;
      point.y = this.position.y;
    }
    return point;
  }

  toLocal(position, from, point, skipUpdate) {
    if (from) {
      position = from.toGlobal(position, point, skipUpdate);
    }

    if (!skipUpdate) {
      this._recursivePostUpdateTransform();

      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
      } else {
        this.displayObjectUpdateTransform();
      }
    }

    return this.worldTransform.applyInverse(position, point);
  }

  copyFromProxy(proxyObj) {
    const copyFunc = key => {
      if (proxyObj[key] !== null) {
        this[key] = proxyObj[key];
      }
    };

    copyFunc("x");
    copyFunc("y");
    copyFunc("text");
    copyFunc("style");
    copyFunc("width");
    copyFunc("height");
    copyFunc("alpha");
    copyFunc("rotation");
    copyFunc("blendMode");
    this.scale.copy(proxyObj.scale);
    this.anchor.copy(proxyObj.anchor);
  }

  substitute(proxyObj) {
    this.copyFromProxy(proxyObj);
    const { parent } = proxyObj;

    if (parent) {
      const index = parent.getChildIndex(proxyObj);
      parent.removeChild(proxyObj);
      parent.addChildAt(this, index);
    }

    proxyObj.destroy();
    proxyObj = null;
  }

  renderWebGL(renderer) {
    // OVERWRITE;
  }

  renderCanvas(renderer) {
    // OVERWRITE;
  }

  setParent(container) {
    if (!container || !container.addChild) {
      throw new Error("setParent: Argument must be a Container");
    }
    container.addChild(this);
    return container;
  }

  setTransform(
    x = 0,
    y = 0,
    scaleX = 1,
    scaleY = 1,
    rotation = 0,
    skewX = 0,
    skewY = 0,
    pivotX = 0,
    pivotY = 0
  ) {
    this.position.x = x;
    this.position.y = y;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation;
    this.skew.x = skewX;
    this.skew.y = skewY;
    this.pivot.x = pivotX;
    this.pivot.y = pivotY;

    return this;
  }

  setScaleToInit() {
    this.initScale.copy(this.scale);
  }

  copyScaleAndInit(scale) {
    this.scale.copy(scale);
    this.initScale.copy(scale);
  }

  attr(attrs) {
    const scaleInitX = this.initScale.x;
    const scaleInitY = this.initScale.y;

    for (let key in attrs) {
      const val = attrs[key];

      switch (key) {
        case "scale":
          this.scale.x = val * scaleInitX;
          this.scale.y = val * scaleInitY;
          break;

        case "skew":
          this.skew.x = val;
          this.skew.y = val;
          break;

        case "rotate":
          this.rotation = val;
          break;

        default:
          this[key] = val;
      }
    }
  }

  getAttr(key) {
    let attr;
    switch (key) {
      case "scale":
        attr = this.scale.x;
        break;

      case "rotate":
        attr = this.rotation;
        break;

      default:
        attr = this[key];
    }

    return attr;
  }

  get x() {
    return this.position.x;
  }

  set x(value) {
    this.transform.position.x = value;
  }

  get y() {
    return this.position.y;
  }

  set y(value) {
    this.transform.position.y = value;
  }

  get worldTransform() {
    return this.transform.worldTransform;
  }

  get localTransform() {
    return this.transform.localTransform;
  }

  get position() {
    return this.transform.position;
  }

  set position(value) {
    this.transform.position.copy(value);
  }

  get scale() {
    return this.transform.scale;
  }

  set scale(value) {
    this.transform.scale.copy(value);
  }

  get pivot() {
    return this.transform.pivot;
  }

  set pivot(value) {
    this.transform.pivot.copy(value);
  }

  get skew() {
    return this.transform.skew;
  }

  set skew(value) {
    this.transform.skew.copy(value);
  }

  get rotation() {
    return this.transform.rotation;
  }

  set rotation(value) {
    this.transform.rotation = value;
  }

  get worldVisible() {
    let item = this;

    do {
      if (!item.visible) {
        return false;
      }

      item = item.parent;
    } while (item);

    return true;
  }

  get mask() {
    return this._mask;
  }

  set mask(value) {
    if (this._mask) {
      this._mask.renderable = true;
      this._mask.isMask = false;
    }

    this._mask = value;

    if (this._mask) {
      this._mask.renderable = false;
      this._mask.isMask = true;
    }
  }

  hasFilters() {
    if (this.filters && this.filters.length) {
      return true;
    } else {
      return false;
    }
  }

  set blur(blur = 0) {
    this._blur = blur;

    if (blur <= 0) {
      this.filters = null;
      return;
    }

    if (!this.filters) {
      this.filters = [new BlurFilter()];
    }

    this.filters[0].blur = blur;
  }

  set fxaa(fxaa) {
    if (fxaa === false) {
      this.filters = null;
      return;
    }

    if (!this.filters) {
      this.filters = [new FXAAFilter()];
    }
  }

  get fxaa() {
    return this._fxaa;
  }

  get blur() {
    return this._blur;
  }

  destroy() {
    if (this.destroyed) return;

    this.removeAllListeners();
    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.blur = 0;
    this.fxaa = false;
    this.filters = null;
    this.transform = null;
    this.initScale = null;
    this.parent = null;
    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;

    this.filterArea = null;
    this.interactive = false;
    this.interactiveChildren = false;
    this.destroyed = true;
  }
}

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform =
  DisplayObject.prototype.updateTransform;
