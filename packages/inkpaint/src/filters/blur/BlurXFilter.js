import settings from "../../settings";
import Filter from "../../renderers/webgl/filters/Filter";
import generateBlurVertSource from "./generateBlurVertSource";
import generateBlurFragSource from "./generateBlurFragSource";
import getMaxBlurKernelSize from "./getMaxBlurKernelSize";

export default class BlurXFilter extends Filter {
  constructor(strength, quality, resolution, kernelSize) {
    kernelSize = kernelSize || 5;
    const vertSrc = generateBlurVertSource(kernelSize, true);
    const fragSrc = generateBlurFragSource(kernelSize);

    super(
      // vertex shader
      vertSrc,
      // fragment shader
      fragSrc
    );

    this.resolution = resolution || settings.RESOLUTION;

    this._quality = 0;

    this.quality = quality || 4;
    this.strength = strength || 8;

    this.firstRun = true;
  }

  apply(filterManager, input, output, clear) {
    if (this.firstRun) {
      const gl = filterManager.renderer.gl;
      const kernelSize = getMaxBlurKernelSize(gl);

      this.vertexSrc = generateBlurVertSource(kernelSize, true);
      this.fragmentSrc = generateBlurFragSource(kernelSize);

      this.firstRun = false;
    }

    this.uniforms.strength =
      (1 / output.size.width) * (output.size.width / input.size.width);

    // screen space!
    this.uniforms.strength *= this.strength;
    this.uniforms.strength /= this.passes; // / this.passes//Math.pow(1, this.passes);

    if (this.passes === 1) {
      filterManager.applyFilter(this, input, output, clear);
    } else {
      const renderTarget = filterManager.getRenderTarget(true);
      let flip = input;
      let flop = renderTarget;

      for (let i = 0; i < this.passes - 1; i++) {
        filterManager.applyFilter(this, flip, flop, true);

        const temp = flop;

        flop = flip;
        flip = temp;
      }

      filterManager.applyFilter(this, flip, output, clear);

      filterManager.returnRenderTarget(renderTarget);
    }
  }

  get blur() {
    return this.strength;
  }

  set blur(value) {
    this.padding = Math.abs(value) * 2;
    this.strength = value;
  }

  get quality() {
    return this._quality;
  }

  set quality(value) {
    this._quality = value;
    this.passes = value;
  }
}
