import * as core from "../../core";
import { readFileSync } from "fs";
import { join } from "path";

export default class DisplacementFilter extends core.Filter {
  constructor(sprite, scale) {
    const maskMatrix = new core.Matrix();

    sprite.renderable = false;

    super(
      // vertex shader
      readFileSync(
        join(__dirname, "../fragments/default-filter-matrix.vert"),
        "utf8"
      ),
      // fragment shader
      readFileSync(join(__dirname, "./displacement.frag"), "utf8")
    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    this.uniforms.mapSampler = sprite._texture;
    this.uniforms.filterMatrix = maskMatrix;
    this.uniforms.scale = { x: 1, y: 1 };

    if (scale === null || scale === undefined) {
      scale = 20;
    }

    this.scale = new core.Point(scale, scale);
  }

  apply(filterManager, input, output) {
    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(
      this.maskMatrix,
      this.maskSprite
    );
    this.uniforms.scale.x = this.scale.x;
    this.uniforms.scale.y = this.scale.y;

    // draw the filter...
    filterManager.applyFilter(this, input, output);
  }

  get map() {
    return this.uniforms.mapSampler;
  }

  set map(value) {
    this.uniforms.mapSampler = value;
  }
}
