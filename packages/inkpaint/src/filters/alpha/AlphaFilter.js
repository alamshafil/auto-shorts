import settings from "../../settings";
import Filter from "../../renderers/webgl/filters/Filter";
import { readFileSync } from "fs";
import { join } from "path";
export default class AlphaFilter extends Filter {
  constructor(alpha = 1.0) {
    super(
      // vertex shader
      readFileSync(join(__dirname, "../fragments/default.vert"), "utf8"),
      // fragment shader
      readFileSync(join(__dirname, "./alpha.frag"), "utf8")
    );

    this.alpha = alpha;
    this.glShaderKey = "alpha";
  }

  /**
   * Coefficient for alpha multiplication
   *
   * @member {number}
   * @default 1
   */
  get alpha() {
    return this.uniforms.uAlpha;
  }

  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
}
