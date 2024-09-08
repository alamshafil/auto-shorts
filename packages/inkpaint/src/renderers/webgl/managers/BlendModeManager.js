import WebGLManager from "./WebGLManager";

export default class BlendModeManager extends WebGLManager {
  constructor(renderer) {
    super(renderer);

    this.currentBlendMode = 99999;
  }

  setBlendMode(blendMode) {
    if (this.currentBlendMode === blendMode) {
      return false;
    }

    this.currentBlendMode = blendMode;
    const mode = this.renderer.blendModes[this.currentBlendMode];
    this.renderer.gl.blendFunc(mode[0], mode[1]);
    return true;
  }
}
