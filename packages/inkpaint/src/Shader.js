import { GLShader } from "pixi-gl-core";
import settings from "./settings";

function checkPrecision(src, def) {
  if (src instanceof Array) {
    if (src[0].substring(0, 9) !== "precision") {
      const copy = src.slice(0);
      copy.unshift(`precision ${def} float;`);
      return copy;
    }
  } else if (src.trim().substring(0, 9) !== "precision") {
    return `precision ${def} float;\n${src}`;
  }

  return src;
}

export default class Shader extends GLShader {
  constructor(gl, vertexSrc, fragmentSrc, attributeLocations, precision) {
    super(
      gl,
      checkPrecision(vertexSrc, precision || settings.PRECISION_VERTEX),
      checkPrecision(fragmentSrc, precision || settings.PRECISION_FRAGMENT),
      undefined,
      attributeLocations
    );
  }
}
