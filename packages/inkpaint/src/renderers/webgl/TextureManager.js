import { GLTexture } from "pixi-gl-core";
import { WRAP_MODES, SCALE_MODES } from "../../const";
import RenderTarget from "./utils/RenderTarget";
import { removeItems } from "../../utils";

export default class TextureManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this._managedTextures = [];
  }

  bindTexture() {
    // empty
  }

  getTexture() {
    // empty
  }

  updateTexture(texture, location) {
    const gl = this.gl;
    const isRenderTexture = !!texture._glRenderTargets;

    if (!texture.hasLoaded) {
      return null;
    }

    const boundTextures = this.renderer.boundTextures;
    if (location === undefined) {
      location = 0;
      for (let i = 0; i < boundTextures.length; ++i) {
        if (boundTextures[i] === texture) {
          location = i;
          break;
        }
      }
    }

    boundTextures[location] = texture;
    gl.activeTexture(gl.TEXTURE0 + location);
    let glTexture = texture._glTextures[this.renderer.CONTEXT_UID];

    if (!glTexture) {
      if (isRenderTexture) {
        const renderTarget = new RenderTarget(
          this.gl,
          texture.width,
          texture.height,
          texture.scaleMode,
          texture.resolution
        );

        renderTarget.resize(texture.width, texture.height);
        texture._glRenderTargets[this.renderer.CONTEXT_UID] = renderTarget;
        glTexture = renderTarget.texture;

        // framebuffer constructor disactivates current framebuffer
        if (!this.renderer._activeRenderTarget.root) {
          this.renderer._activeRenderTarget.frameBuffer.bind();
        }
      } else {
        glTexture = new GLTexture(this.gl, null, null, null, null);
        glTexture.bind(location);
        glTexture.premultiplyAlpha = true;
        glTexture.upload(texture.source);
      }

      texture._glTextures[this.renderer.CONTEXT_UID] = glTexture;
      texture.on("update", this.updateTexture, this);
      texture.on("dispose", this.destroyTexture, this);
      this._managedTextures.push(texture);

      if (texture.isPowerOfTwo) {
        if (texture.mipmap) {
          glTexture.enableMipmap();
        }

        if (texture.wrapMode === WRAP_MODES.CLAMP) {
          glTexture.enableWrapClamp();
        } else if (texture.wrapMode === WRAP_MODES.REPEAT) {
          glTexture.enableWrapRepeat();
        } else {
          glTexture.enableWrapMirrorRepeat();
        }
      } else {
        glTexture.enableWrapClamp();
      }

      if (texture.scaleMode === SCALE_MODES.NEAREST) {
        glTexture.enableNearestScaling();
      } else {
        glTexture.enableLinearScaling();
      }
    }
    // the texture already exists so we only need to update it..
    else if (isRenderTexture) {
      texture._glRenderTargets[this.renderer.CONTEXT_UID].resize(
        texture.width,
        texture.height
      );
    } else {
      glTexture.upload(texture.source);
    }

    return glTexture;
  }

  destroyTexture(texture, skipRemove) {
    texture = texture.baseTexture || texture;

    if (!texture.hasLoaded) {
      return;
    }

    const renderer = this.renderer;
    const uid = renderer.CONTEXT_UID;
    const glTextures = texture._glTextures;
    const glRenderTargets = texture._glRenderTargets;

    if (glTextures[uid]) {
      renderer.unbindTexture(texture);

      glTextures[uid].destroy();
      texture.off("update", this.updateTexture, this);
      texture.off("dispose", this.destroyTexture, this);

      delete glTextures[uid];

      if (!skipRemove) {
        const i = this._managedTextures.indexOf(texture);

        if (i !== -1) {
          removeItems(this._managedTextures, i, 1);
        }
      }
    }

    if (glRenderTargets && glRenderTargets[uid]) {
      if (renderer._activeRenderTarget === glRenderTargets[uid]) {
        renderer.bindRenderTarget(renderer.rootRenderTarget);
      }

      glRenderTargets[uid].destroy();
      delete glRenderTargets[uid];
    }
  }

  /**
   * Deletes all the textures from WebGL
   */
  removeAll() {
    // empty all the old gl textures as they are useless now
    for (let i = 0; i < this._managedTextures.length; ++i) {
      const texture = this._managedTextures[i];

      if (texture._glTextures[this.renderer.CONTEXT_UID]) {
        delete texture._glTextures[this.renderer.CONTEXT_UID];
      }
    }
  }

  /**
   * Destroys this manager and removes all its textures
   */
  destroy() {
    // destroy managed textures
    for (let i = 0; i < this._managedTextures.length; ++i) {
      const texture = this._managedTextures[i];

      this.destroyTexture(texture, true);

      texture.off("update", this.updateTexture, this);
      texture.off("dispose", this.destroyTexture, this);
    }

    this._managedTextures = null;
  }
}
