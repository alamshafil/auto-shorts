import settings from "./settings";
import Container from "./display/Container";
import { autoRenderer } from "./autoRenderer";
import { shared, Ticker } from "./ticker";
import { UPDATE_PRIORITY } from "./const";

export default class Application {
  constructor(options, arg2, arg3, arg4, arg5) {
    if (typeof options === "number") {
      options = Object.assign(
        {
          width: options,
          height: arg2 || settings.RENDER_OPTIONS.height,
          useGL: !!arg4,
          sharedTicker: !!arg5,
        },
        arg3
      );
    }

    this._options = options = Object.assign(
      {
        autoStart: true,
        sharedTicker: false,
        useGL: false,
        sharedLoader: false,
        autoRender: false,
      },
      options
    );

    this.renderer = autoRenderer(options);
    this.stage = new Container();
    this.stage.isStage = true;

    this._ticker = null;
    if (options.autoRender) {
      this.ticker = options.sharedTicker ? shared : new Ticker();
    }

    if (options.autoStart) {
      this.start();
    }
  }

  set ticker(ticker) {
    if (this._ticker) this._ticker.remove(this.render, this);
    this._ticker = ticker;

    if (ticker) ticker.add(this.render, this, UPDATE_PRIORITY.LOW);
  }

  get ticker() {
    return this._ticker;
  }

  render() {
    this.renderer.render(this.stage);
  }

  stop() {
    this.ticker && this.ticker.stop();
  }

  start() {
    this.ticker && this.ticker.start();
  }

  get view() {
    return this.renderer.view;
  }

  get screen() {
    return this.renderer.screen;
  }

  destroyChildren(options) {
    this.stage.destroyChildren(options);
  }

  destroy(removeView, stageOptions) {
    if (this._ticker) {
      const oldTicker = this._ticker;
      this.ticker = null;
      oldTicker.destroy();
    }

    this.stage.destroy(stageOptions);
    this.renderer.destroy(removeView);

    this.renderer = null;
    this._options = null;
    this.stage = null;
  }
}
