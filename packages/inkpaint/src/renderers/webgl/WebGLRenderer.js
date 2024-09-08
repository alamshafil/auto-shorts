import SystemRenderer from "../SystemRenderer";
import MaskManager from "./managers/MaskManager";
import StencilManager from "./managers/StencilManager";
import FilterManager from "./managers/FilterManager";
import RenderTarget from "./utils/RenderTarget";
import ObjectRenderer from "./utils/ObjectRenderer";
import TextureManager from "./TextureManager";
import BaseTexture from "../../textures/BaseTexture";
import TextureGarbageCollector from "./TextureGarbageCollector";
import WebGLState from "./WebGLState";
import mapWebGLDrawModesToPixi from "./utils/mapWebGLDrawModesToPixi";
import validateContext from "./utils/validateContext";
import { pluginTarget } from "../../utils";
import glCore from "pixi-gl-core";
import { RENDERER_TYPE } from "../../const";

let CONTEXT_UID = 0;

export default class WebGLRenderer extends SystemRenderer {
  constructor(options, arg2, arg3) {
    super("WebGL", options, arg2, arg3);

    this.legacy = this.options.legacy;
    if (this.legacy) {
      glCore.VertexArrayObject.FORCE_NATIVE = true;
    }

    this.type = RENDERER_TYPE.WEBGL;
    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);
    this.view.addEventListener(
      "webglcontextlost",
      this.handleContextLost,
      false
    );
    this.view.addEventListener(
      "webglcontextrestored",
      this.handleContextRestored,
      false
    );

    this._contextOptions = {
      alpha: this.transparent,
      antialias: this.options.antialias,
      premultipliedAlpha:
        this.transparent && this.transparent !== "notMultiplied",
      stencil: true,
      preserveDrawingBuffer: this.options.preserveDrawingBuffer,
      powerPreference: this.options.powerPreference
    };

    this._backgroundColorRgba[3] = this.transparent ? 0 : 1;
    this.maskManager = new MaskManager(this);
    this.stencilManager = new StencilManager(this);
    this.emptyRenderer = new ObjectRenderer(this);
    this.currentRenderer = this.emptyRenderer;
    this.textureManager = null;
    this.filterManager = null;

    this.initPlugins();
    if (this.options.context) {
      validateContext(this.options.context);
    }

    this.gl =
      this.options.context ||
      glCore.createContext(this.view, this._contextOptions);
    this.CONTEXT_UID = CONTEXT_UID++;
    this.state = new WebGLState(this.gl);
    this.renderingToScreen = true;

    this.boundTextures = null;
    this._activeShader = null;
    this._activeVao = null;
    this._activeRenderTarget = null;
    this._initContext();

    this.drawModes = mapWebGLDrawModesToPixi(this.gl);
    this._nextTextureLocation = 0;
    this.setBlendMode(0);
  }

  _initContext() {
    const gl = this.gl;
    if (gl.isContextLost() && gl.getExtension("WEBGL_lose_context")) {
      gl.getExtension("WEBGL_lose_context").restoreContext();
    }

    const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this._activeShader = null;
    this._activeVao = null;
    this.boundTextures = new Array(maxTextures);
    this.emptyTextures = new Array(maxTextures);
    this._unknownBoundTextures = false;

    // create a texture manager...
    this.textureManager = new TextureManager(this);
    this.filterManager = new FilterManager(this);
    this.textureGC = new TextureGarbageCollector(this);
    this.state.resetToDefault();

    this.rootRenderTarget = new RenderTarget(
      gl,
      this.width,
      this.height,
      null,
      this.resolution,
      true
    );
    this.rootRenderTarget.clearColor = this._backgroundColorRgba;

    this.bindRenderTarget(this.rootRenderTarget);
    const emptyGLTexture = new glCore.GLTexture.fromData(gl, null, 1, 1);
    const tempObj = { _glTextures: {} };
    tempObj._glTextures[this.CONTEXT_UID] = {};

    for (let i = 0; i < maxTextures; i++) {
      const empty = new BaseTexture();
      empty._glTextures[this.CONTEXT_UID] = emptyGLTexture;
      this.boundTextures[i] = tempObj;
      this.emptyTextures[i] = empty;
      this.bindTexture(null, i);
    }

    this.emit("context", gl);
    this.resize(this.screen.width, this.screen.height);
  }

  render(displayObject, renderTexture, clear, transform, skipUpdateTransform) {
    this.renderingToScreen = !renderTexture;
    this.emit("prerender");

    if (!this.gl || this.gl.isContextLost()) return;
    this._nextTextureLocation = 0;

    if (!renderTexture) {
      this._lastObjectRendered = displayObject;
    }

    if (!skipUpdateTransform) {
      const cacheParent = displayObject.parent;
      displayObject.parent = this._tempDisplayObjectParent;
      displayObject.updateTransform();
      displayObject.parent = cacheParent;
    }

    this.bindRenderTexture(renderTexture, transform);
    this.currentRenderer.start();

    if (clear !== undefined ? clear : this.clearBeforeRender) {
      this._activeRenderTarget.clear();
    }

    displayObject.renderWebGL(this);
    this.currentRenderer.flush();
    this.textureGC.update();

    this.emit("postrender");
  }

  setObjectRenderer(objectRenderer) {
    if (this.currentRenderer === objectRenderer) {
      return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
  }

  flush() {
    this.setObjectRenderer(this.emptyRenderer);
  }

  resize(screenWidth, screenHeight) {
    SystemRenderer.prototype.resize.call(this, screenWidth, screenHeight);
    this.rootRenderTarget.resize(screenWidth, screenHeight);

    if (this._activeRenderTarget === this.rootRenderTarget) {
      this.rootRenderTarget.activate();

      if (this._activeShader) {
        this._activeShader.uniforms.projectionMatrix = this.rootRenderTarget.projectionMatrix.toArray(
          true
        );
      }
    }
  }

  setBlendMode(blendMode) {
    this.state.setBlendMode(blendMode);
  }

  deleteTexture(texture) {
    this.gl.deleteTexture(texture);
  }

  clear(clearColor) {
    this._activeRenderTarget.clear(clearColor);
  }

  setTransform(matrix) {
    this._activeRenderTarget.transform = matrix;
  }

  clearRenderTexture(renderTexture, clearColor) {
    const baseTexture = renderTexture.baseTexture;
    const renderTarget = baseTexture._glRenderTargets[this.CONTEXT_UID];

    if (renderTarget) {
      renderTarget.clear(clearColor);
    }

    return this;
  }

  bindRenderTexture(renderTexture, transform) {
    let renderTarget;

    if (renderTexture) {
      const baseTexture = renderTexture.baseTexture;

      if (!baseTexture._glRenderTargets[this.CONTEXT_UID]) {
        this.textureManager.updateTexture(baseTexture, 0);
      }

      this.unbindTexture(baseTexture);

      renderTarget = baseTexture._glRenderTargets[this.CONTEXT_UID];
      renderTarget.setFrame(renderTexture.frame);
    } else {
      renderTarget = this.rootRenderTarget;
    }

    renderTarget.transform = transform;
    this.bindRenderTarget(renderTarget);

    return this;
  }

  bindRenderTarget(renderTarget) {
    if (renderTarget !== this._activeRenderTarget) {
      this._activeRenderTarget = renderTarget;
      renderTarget.activate();

      if (this._activeShader) {
        this._activeShader.uniforms.projectionMatrix = renderTarget.projectionMatrix.toArray(
          true
        );
      }

      this.stencilManager.setMaskStack(renderTarget.stencilMaskStack);
    }

    return this;
  }

  bindShader(shader, autoProject) {
    // TODO cache
    if (this._activeShader !== shader) {
      this._activeShader = shader;
      shader.bind();

      // `autoProject` normally would be a default parameter set to true
      // but because of how Babel transpiles default parameters
      // it hinders the performance of this method.
      if (autoProject !== false) {
        // automatically set the projection matrix
        shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(
          true
        );
      }
    }

    return this;
  }

  bindTexture(texture, location, forceLocation) {
    texture = texture || this.emptyTextures[location];
    texture = texture.baseTexture || texture;
    texture.touched = this.textureGC.count;

    if (!forceLocation) {
      // TODO - maybe look into adding boundIds.. save us the loop?
      for (let i = 0; i < this.boundTextures.length; i++) {
        if (this.boundTextures[i] === texture) {
          return i;
        }
      }

      if (location === undefined) {
        this._nextTextureLocation++;
        this._nextTextureLocation %= this.boundTextures.length;
        location = this.boundTextures.length - this._nextTextureLocation - 1;
      }
    } else {
      location = location || 0;
    }

    const gl = this.gl;
    const glTexture = texture._glTextures[this.CONTEXT_UID];

    if (!glTexture) {
      // this will also bind the texture..
      this.textureManager.updateTexture(texture, location);
    } else {
      // bind the current texture
      this.boundTextures[location] = texture;
      gl.activeTexture(gl.TEXTURE0 + location);
      gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);
    }

    return location;
  }

  unbindTexture(texture) {
    const gl = this.gl;

    texture = texture.baseTexture || texture;

    if (this._unknownBoundTextures) {
      this._unknownBoundTextures = false;
      // someone changed webGL state,
      // we have to be sure that our texture does not appear in multitexture renderer samplers

      for (let i = 0; i < this.boundTextures.length; i++) {
        if (this.boundTextures[i] === this.emptyTextures[i]) {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(
            gl.TEXTURE_2D,
            this.emptyTextures[i]._glTextures[this.CONTEXT_UID].texture
          );
        }
      }
    }

    for (let i = 0; i < this.boundTextures.length; i++) {
      if (this.boundTextures[i] === texture) {
        this.boundTextures[i] = this.emptyTextures[i];

        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(
          gl.TEXTURE_2D,
          this.emptyTextures[i]._glTextures[this.CONTEXT_UID].texture
        );
      }
    }

    return this;
  }

  createVao() {
    return new glCore.VertexArrayObject(this.gl, this.state.attribState);
  }

  bindVao(vao) {
    if (this._activeVao === vao) {
      return this;
    }

    if (vao) {
      vao.bind();
    } else if (this._activeVao) {
      // TODO this should always be true i think?
      this._activeVao.unbind();
    }

    this._activeVao = vao;

    return this;
  }

  reset() {
    this.setObjectRenderer(this.emptyRenderer);

    this.bindVao(null);
    this._activeShader = null;
    this._activeRenderTarget = this.rootRenderTarget;

    this._unknownBoundTextures = true;

    for (let i = 0; i < this.boundTextures.length; i++) {
      this.boundTextures[i] = this.emptyTextures[i];
    }

    // bind the main frame buffer (the screen);
    this.rootRenderTarget.activate();
    this.state.resetToDefault();
    return this;
  }

  handleContextLost(event) {
    event.preventDefault();
  }

  handleContextRestored() {
    this.textureManager.removeAll();
    this.filterManager.destroy(true);
    this._initContext();
  }

  destroy(removeView) {
    this.destroyPlugins();

    // remove listeners
    this.view.removeEventListener("webglcontextlost", this.handleContextLost);
    this.view.removeEventListener(
      "webglcontextrestored",
      this.handleContextRestored
    );

    this.textureManager.destroy();
    super.destroy(removeView);
    this.uid = 0;

    // destroy the managers
    this.maskManager.destroy();
    this.stencilManager.destroy();
    this.filterManager.destroy();

    this.maskManager = null;
    this.filterManager = null;
    this.textureManager = null;
    this.currentRenderer = null;

    this.handleContextLost = null;
    this.handleContextRestored = null;

    this._contextOptions = null;
    this.gl.useProgram(null);

    if (this.gl.getExtension("WEBGL_lose_context")) {
      this.gl.getExtension("WEBGL_lose_context").loseContext();
    }

    this.gl = null;
  }
}

pluginTarget.mixin(WebGLRenderer);
