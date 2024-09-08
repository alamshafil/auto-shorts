import settings from "../../settings";
import Filter from "../../renderers/webgl/filters/Filter";
import { readFileSync } from "fs";
import { join } from "path";

export default class FXAAFilter extends Filter {
  constructor() {
    super(
      // vertex shader
      readFileSync(join(__dirname, "./fxaa.vert"), "utf8"),
      // fragment shader
      readFileSync(join(__dirname, "./fxaa.frag"), "utf8")
    );
  }
}
