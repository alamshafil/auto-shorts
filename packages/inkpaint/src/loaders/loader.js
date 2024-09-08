import EventEmitter from "eventemitter3";
import textureParser from "./textureParser";
import { inherit } from "../utils";
import { Resource, ResourceLoader } from "../resource";
import spritesheetParser from "./spritesheetParser";

export default class Loader extends ResourceLoader {
  constructor(baseUrl, concurrency) {
    super(baseUrl, concurrency);
    EventEmitter.call(this);

    for (let i = 0; i < Loader._pixiMiddleware.length; ++i) {
      this.use(Loader._pixiMiddleware[i]());
    }

    this.onStart.add(l => this.emit("start", l));
    this.onLoad.add((l, r) => this.emit("load", l, r));
    this.onProgress.add((l, r) => this.emit("progress", l, r));
    this.onError.add((e, l, r) => this.emit("error", e, l, r));
    this.onComplete.add((l, r) => this.emit("complete", l, r));
  }

  static addPixiMiddleware(fn) {
    Loader._pixiMiddleware.push(fn);
  }

  destroy() {
    this.removeAllListeners();
    super.destroy();
  }
}

inherit(Loader, EventEmitter);
Loader._pixiMiddleware = [textureParser, spritesheetParser];
