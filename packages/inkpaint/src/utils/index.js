import earcut from "earcut";
import * as mixins from "./mixin";
import EventEmitter from "eventemitter3";
import pluginTarget from "./pluginTarget";
import { DATA_URI, URL_FILE_EXTENSION, SVG_SIZE } from "../const";
import mapPremultipliedBlendModes from "./mapPremultipliedBlendModes";

let nextUid = 0;
export { EventEmitter, pluginTarget, mixins, earcut };

export function removeItems(arr, startIdx, removeCount) {
  const length = arr.length;
  if (startIdx >= length || removeCount <= 0 || startIdx < 0) return;

  removeCount =
    startIdx + removeCount > length ? length - startIdx : removeCount;

  const len = length - removeCount;
  for (let i = startIdx; i < len; ++i) arr[i] = arr[i + removeCount];
  arr.length = len;
}

export function uid() {
  return ++nextUid;
}

export function uuidvx() {
  return "xxxxxxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function hex2rgb(hex, out) {
  out = out || [];
  out[0] = ((hex >> 16) & 0xff) / 255;
  out[1] = ((hex >> 8) & 0xff) / 255;
  out[2] = (hex & 0xff) / 255;

  return out;
}

export function hex2string(hex) {
  hex = hex.toString(16);
  hex = "000000".substr(0, 6 - hex.length) + hex;
  return `#${hex}`;
}

export function rgb2hex(rgb) {
  return ((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + ((rgb[2] * 255) | 0);
}

export function rgb2hsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;
  return [h, s, l];
}

export function getResolutionOfUrl(url, defaultValue) {
  return defaultValue !== undefined ? defaultValue : 1;
}

export function decomposeDataUri(dataUri) {
  const dataUriMatch = DATA_URI.exec(dataUri);

  if (dataUriMatch) {
    return {
      mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : undefined,
      subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : undefined,
      charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : undefined,
      encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : undefined,
      data: dataUriMatch[5]
    };
  }

  return undefined;
}

export function getUrlFileExt(url) {
  const extension = URL_FILE_EXTENSION.exec(url);
  if (extension) return extension[1].toLowerCase();
  return undefined;
}

export function getSvgSize(svgString) {
  const sizeMatch = SVG_SIZE.exec(svgString);
  const size = {};

  if (sizeMatch) {
    size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
    size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
  }

  return size;
}

export function sign(n) {
  if (n === 0) return 0;
  return n < 0 ? -1 : 1;
}

export const premultiplyBlendMode = mapPremultipliedBlendModes();

export function correctBlendMode(blendMode, premultiplied) {
  return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}

export function premultiplyTint(tint, alpha) {
  if (alpha === 1.0) {
    return ((alpha * 255) << 24) + tint;
  }
  if (alpha === 0.0) {
    return 0;
  }
  let R = (tint >> 16) & 0xff;
  let G = (tint >> 8) & 0xff;
  let B = tint & 0xff;

  R = (R * alpha + 0.5) | 0;
  G = (G * alpha + 0.5) | 0;
  B = (B * alpha + 0.5) | 0;

  return ((alpha * 255) << 24) + (R << 16) + (G << 8) + B;
}

export function premultiplyRgba(rgb, alpha, out, premultiply) {
  out = out || new Float32Array(4);
  if (premultiply || premultiply === undefined) {
    out[0] = rgb[0] * alpha;
    out[1] = rgb[1] * alpha;
    out[2] = rgb[2] * alpha;
  } else {
    out[0] = rgb[0];
    out[1] = rgb[1];
    out[2] = rgb[2];
  }
  out[3] = alpha;

  return out;
}

export function premultiplyTintToRgba(tint, alpha, out, premultiply) {
  out = out || new Float32Array(4);
  out[0] = ((tint >> 16) & 0xff) / 255.0;
  out[1] = ((tint >> 8) & 0xff) / 255.0;
  out[2] = (tint & 0xff) / 255.0;
  if (premultiply || premultiply === undefined) {
    out[0] *= alpha;
    out[1] *= alpha;
    out[2] *= alpha;
  }
  out[3] = alpha;

  return out;
}

export function inherit(ClassA, ClassB) {
  for (const k in ClassB.prototype) {
    ClassA.prototype[k] = ClassB.prototype[k];
  }
}
