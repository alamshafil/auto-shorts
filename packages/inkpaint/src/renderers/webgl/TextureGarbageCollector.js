import { GC_MODES } from "../../const";
import settings from "../../settings";

export default class TextureGarbageCollector {
  constructor(renderer) {
    this.renderer = renderer;

    this.count = 0;
    this.checkCount = 0;
    this.maxIdle = settings.GC_MAX_IDLE;
    this.checkCountMax = settings.GC_MAX_CHECK_COUNT;
    this.mode = settings.GC_MODE;
  }

  update() {
    this.count++;

    if (this.mode === GC_MODES.MANUAL) {
      return;
    }

    this.checkCount++;

    if (this.checkCount > this.checkCountMax) {
      this.checkCount = 0;

      this.run();
    }
  }

  run() {
    const tm = this.renderer.textureManager;
    const managedTextures = tm._managedTextures;
    let wasRemoved = false;

    for (let i = 0; i < managedTextures.length; i++) {
      const texture = managedTextures[i];

      // only supports non generated textures at the moment!
      if (
        !texture._glRenderTargets &&
        this.count - texture.touched > this.maxIdle
      ) {
        tm.destroyTexture(texture, true);
        managedTextures[i] = null;
        wasRemoved = true;
      }
    }

    if (wasRemoved) {
      let j = 0;

      for (let i = 0; i < managedTextures.length; i++) {
        if (managedTextures[i] !== null) {
          managedTextures[j++] = managedTextures[i];
        }
      }

      managedTextures.length = j;
    }
  }

  unload(displayObject) {
    const tm = this.renderer.textureManager;

    // only destroy non generated textures
    if (displayObject._texture && displayObject._texture._glRenderTargets) {
      tm.destroyTexture(displayObject._texture, true);
    }

    for (let i = displayObject.children.length - 1; i >= 0; i--) {
      this.unload(displayObject.children[i]);
    }
  }
}
