import { Point } from "../math";
import EventEmitter from "eventemitter3";
export default class ProxyObj extends EventEmitter {
  constructor() {
    super();

    this.width = null;
    this.height = null;
    this.alpha = 1;
    this.worldAlpha = 1;
    this.rotation = 0;
    this.x = 0;
    this.y = 0;
    this.scale = new Point(1, 1);
    this.anchor = new Point();
    this.transform = {};
    this.blendMode = null;
    this.text = null;
    this.style = null;
    this.parent = null;

    this.isProxy = true;
  }

  setScaleToInit() {}
  copyScaleAndInit(scale) {}
  attr(attrs) {}

  replaceFromParent(display) {
    const { parent } = this;
    if (!parent) return;

    const index = parent.getChildIndex(this);
    parent.removeChild(this);
    parent.addChildAt(display, index);
  }

  updateStyle(style) {
    if (!this.style) this.style = {};

    for (let key in style) {
      let newKey = this.camelCase(key);
      if (newKey === "color") newKey = "fill";
      this.style[newKey] = style[key];
    }
  }

  camelCase(name) {
    const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    const MOZ_HACK_REGEXP = /^moz([A-Z])/;

    return name
      .replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      })
      .replace(MOZ_HACK_REGEXP, "Moz$1");
  }

  destroy() {
    this.width = null;
    this.height = null;
    this.alpha = null;
    this.x = null;
    this.y = null;
    this.scale = null;
    this.pivot = null;
    this.anchor = null;
    this.text = null;
    this.style = null;
    this.transform = null;
    this.parent = null;
    this.removeAllListeners();
  }
}
