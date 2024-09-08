import WebGLManager from "./WebGLManager";

export default class StencilManager extends WebGLManager {
  constructor(renderer) {
    super(renderer);
    this.stencilMaskStack = null;
  }

  setMaskStack(stencilMaskStack) {
    this.stencilMaskStack = stencilMaskStack;

    const gl = this.renderer.gl;

    if (stencilMaskStack.length === 0) {
      gl.disable(gl.STENCIL_TEST);
    } else {
      gl.enable(gl.STENCIL_TEST);
    }
  }

  pushStencil(graphics) {
    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    this.renderer._activeRenderTarget.attachStencilBuffer();

    const gl = this.renderer.gl;
    const prevMaskCount = this.stencilMaskStack.length;

    if (prevMaskCount === 0) {
      gl.enable(gl.STENCIL_TEST);
    }

    this.stencilMaskStack.push(graphics);

    // Increment the reference stencil value where the new mask overlaps with the old ones.
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.EQUAL, prevMaskCount, this._getBitwiseMask());
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    this.renderer.plugins.graphics.render(graphics);

    this._useCurrent();
  }

  popStencil() {
    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    const gl = this.renderer.gl;
    const graphics = this.stencilMaskStack.pop();

    if (this.stencilMaskStack.length === 0) {
      // the stack is empty!
      gl.disable(gl.STENCIL_TEST);
      gl.clear(gl.STENCIL_BUFFER_BIT);
      gl.clearStencil(0);
    } else {
      // Decrement the reference stencil value where the popped mask overlaps with the other ones
      gl.colorMask(false, false, false, false);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      this.renderer.plugins.graphics.render(graphics);

      this._useCurrent();
    }
  }

  _useCurrent() {
    const gl = this.renderer.gl;

    gl.colorMask(true, true, true, true);
    gl.stencilFunc(
      gl.EQUAL,
      this.stencilMaskStack.length,
      this._getBitwiseMask()
    );
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  }

  _getBitwiseMask() {
    return (1 << this.stencilMaskStack.length) - 1;
  }

  destroy() {
    WebGLManager.prototype.destroy.call(this);
    this.stencilMaskStack.stencilStack = null;
  }
}
