import WebGLManager from "./WebGLManager";
import AlphaMaskFilter from "../filters/spriteMask/SpriteMaskFilter";

export default class MaskManager extends WebGLManager {
  constructor(renderer) {
    super(renderer);
    this.scissor = false;
    this.scissorData = null;
    this.scissorRenderTarget = null;
    this.enableScissor = true;
    this.alphaMaskPool = [];
    this.alphaMaskIndex = 0;
  }

  pushMask(target, maskData) {
    if (maskData.texture) {
      this.pushSpriteMask(target, maskData);
    } else if (
      this.enableScissor &&
      !this.scissor &&
      this.renderer._activeRenderTarget.root &&
      !this.renderer.stencilManager.stencilMaskStack.length &&
      maskData.isFastRect()
    ) {
      const matrix = maskData.worldTransform;

      let rot = Math.atan2(matrix.b, matrix.a);

      // use the nearest degree!
      rot = Math.round(rot * (180 / Math.PI));

      if (rot % 90) {
        this.pushStencilMask(maskData);
      } else {
        this.pushScissorMask(target, maskData);
      }
    } else {
      this.pushStencilMask(maskData);
    }
  }

  popMask(target, maskData) {
    if (maskData.texture) {
      this.popSpriteMask(target, maskData);
    } else if (
      this.enableScissor &&
      !this.renderer.stencilManager.stencilMaskStack.length
    ) {
      this.popScissorMask(target, maskData);
    } else {
      this.popStencilMask(target, maskData);
    }
  }

  pushSpriteMask(target, maskData) {
    let alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

    if (!alphaMaskFilter) {
      alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [
        new AlphaMaskFilter(maskData)
      ];
    }

    alphaMaskFilter[0].resolution = this.renderer.resolution;
    alphaMaskFilter[0].maskSprite = maskData;

    const stashFilterArea = target.filterArea;

    target.filterArea = maskData.getBounds(true);
    this.renderer.filterManager.pushFilter(target, alphaMaskFilter);
    target.filterArea = stashFilterArea;

    this.alphaMaskIndex++;
  }

  popSpriteMask() {
    this.renderer.filterManager.popFilter();
    this.alphaMaskIndex--;
  }

  pushStencilMask(maskData) {
    this.renderer.currentRenderer.stop();
    this.renderer.stencilManager.pushStencil(maskData);
  }

  popStencilMask() {
    this.renderer.currentRenderer.stop();
    this.renderer.stencilManager.popStencil();
  }

  pushScissorMask(target, maskData) {
    maskData.renderable = true;

    const renderTarget = this.renderer._activeRenderTarget;

    const bounds = maskData.getBounds();

    bounds.fit(renderTarget.size);
    maskData.renderable = false;

    this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);

    const resolution = this.renderer.resolution;

    this.renderer.gl.scissor(
      bounds.x * resolution,
      (renderTarget.root
        ? renderTarget.size.height - bounds.y - bounds.height
        : bounds.y) * resolution,
      bounds.width * resolution,
      bounds.height * resolution
    );

    this.scissorRenderTarget = renderTarget;
    this.scissorData = maskData;
    this.scissor = true;
  }

  popScissorMask() {
    this.scissorRenderTarget = null;
    this.scissorData = null;
    this.scissor = false;

    // must be scissor!
    const gl = this.renderer.gl;

    gl.disable(gl.SCISSOR_TEST);
  }
}
