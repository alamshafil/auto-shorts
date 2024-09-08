import extractUniformsFromSrc from "./extractUniformsFromSrc";
import { uid } from "../../../utils";
import { BLEND_MODES } from "../../../const";
import settings from "../../../settings";

const SOURCE_KEY_MAP = {};

export default class Filter {
  constructor(vertexSrc, fragmentSrc, uniformData) {
    this.vertexSrc = vertexSrc || Filter.defaultVertexSrc;
    this.fragmentSrc = fragmentSrc || Filter.defaultFragmentSrc;
    this._blendMode = BLEND_MODES.NORMAL;
    this.uniformData =
      uniformData ||
      extractUniformsFromSrc(
        this.vertexSrc,
        this.fragmentSrc,
        "projectionMatrix|uSampler"
      );

    this.uniforms = {};

    for (const i in this.uniformData) {
      this.uniforms[i] = this.uniformData[i].value;
      if (this.uniformData[i].type) {
        this.uniformData[i].type = this.uniformData[i].type.toLowerCase();
      }
    }

    this.glShaders = {};
    if (!SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc]) {
      SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc] = uid();
    }

    this.glShaderKey = SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc];
    this.padding = 4;
    this.resolution = settings.FILTER_RESOLUTION;
    this.enabled = true;
    this.autoFit = true;
  }

  apply(filterManager, input, output, clear, currentState) {
    filterManager.applyFilter(this, input, output, clear);
  }

  get blendMode() {
    return this._blendMode;
  }

  set blendMode(value) {
    this._blendMode = value;
  }

  static get defaultVertexSrc() {
    return [
      "attribute vec2 aVertexPosition;",
      "attribute vec2 aTextureCoord;",

      "uniform mat3 projectionMatrix;",
      "uniform mat3 filterMatrix;",

      "varying vec2 vTextureCoord;",
      "varying vec2 vFilterCoord;",

      "void main(void){",
      "   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);",
      "   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;",
      "   vTextureCoord = aTextureCoord ;",
      "}"
    ].join("\n");
  }

  static get defaultFragmentSrc() {
    return [
      "varying vec2 vTextureCoord;",
      "varying vec2 vFilterCoord;",

      "uniform sampler2D uSampler;",
      "uniform sampler2D filterSampler;",

      "void main(void){",
      "   vec4 masky = texture2D(filterSampler, vFilterCoord);",
      "   vec4 sample = texture2D(uSampler, vTextureCoord);",
      "   vec4 color;",
      "   if(mod(vFilterCoord.x, 1.0) > 0.5)",
      "   {",
      "     color = vec4(1.0, 0.0, 0.0, 1.0);",
      "   }",
      "   else",
      "   {",
      "     color = vec4(0.0, 1.0, 0.0, 1.0);",
      "   }",
      // '   gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);',
      "   gl_FragColor = mix(sample, masky, 0.5);",
      "   gl_FragColor *= sample.a;",
      "}"
    ].join("\n");
  }
}
