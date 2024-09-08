import { default as Matrix } from "../math/Matrix";

const tempMat = new Matrix();

export default class TextureMatrix {
  constructor(texture, clampMargin) {
    this._texture = texture;
    this.mapCoord = new Matrix();
    this.uClampFrame = new Float32Array(4);
    this.uClampOffset = new Float32Array(2);
    this._lastTextureID = -1;
    this.clampOffset = 0;
    this.clampMargin = typeof clampMargin === "undefined" ? 0.5 : clampMargin;
  }

  get texture() {
    return this._texture;
  }

  set texture(value) {
    this._texture = value;
    this._lastTextureID = -1;
  }

  multiplyUvs(uvs, out) {
    if (out === undefined) {
      out = uvs;
    }

    const mat = this.mapCoord;

    for (let i = 0; i < uvs.length; i += 2) {
      const x = uvs[i];
      const y = uvs[i + 1];

      out[i] = x * mat.a + y * mat.c + mat.tx;
      out[i + 1] = x * mat.b + y * mat.d + mat.ty;
    }

    return out;
  }

  update(forceUpdate) {
    const tex = this._texture;

    if (!tex || !tex.valid) {
      return false;
    }

    if (!forceUpdate && this._lastTextureID === tex._updateID) {
      return false;
    }

    this._lastTextureID = tex._updateID;

    const uvs = tex._uvs;

    this.mapCoord.set(
      uvs.x1 - uvs.x0,
      uvs.y1 - uvs.y0,
      uvs.x3 - uvs.x0,
      uvs.y3 - uvs.y0,
      uvs.x0,
      uvs.y0
    );

    const orig = tex.orig;
    const trim = tex.trim;

    if (trim) {
      tempMat.set(
        orig.width / trim.width,
        0,
        0,
        orig.height / trim.height,
        -trim.x / trim.width,
        -trim.y / trim.height
      );
      this.mapCoord.append(tempMat);
    }

    const texBase = tex.baseTexture;
    const frame = this.uClampFrame;
    const margin = this.clampMargin / texBase.resolution;
    const offset = this.clampOffset;

    frame[0] = (tex._frame.x + margin + offset) / texBase.width;
    frame[1] = (tex._frame.y + margin + offset) / texBase.height;
    frame[2] =
      (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
    frame[3] =
      (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
    this.uClampOffset[0] = offset / texBase.realWidth;
    this.uClampOffset[1] = offset / texBase.realHeight;

    return true;
  }
}
