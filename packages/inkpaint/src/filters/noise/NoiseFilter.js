import settings from "../../settings";
import Filter from "../../renderers/webgl/filters/Filter";
import { readFileSync } from "fs";
import { join } from "path";

export default class NoiseFilter extends Filter {
  constructor(noise = 0.5, seed = Math.random()) {
    super(
      // vertex shader
      readFileSync(join(__dirname, "../fragments/default.vert"), "utf8"),
      // fragment shader
      readFileSync(join(__dirname, "./noise.frag"), "utf8")
    );

    this.noise = noise;
    this.seed = seed;
  }

  get noise() {
    return this.uniforms.uNoise;
  }

  set noise(value) {
    this.uniforms.uNoise = value;
  }

  get seed() {
    return this.uniforms.uSeed;
  }

  set seed(value) {
    this.uniforms.uSeed = value;
  }
}
