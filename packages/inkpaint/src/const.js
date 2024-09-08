export const PI_2 = Math.PI * 2;
export const RAD_TO_DEG = 180 / Math.PI;
export const DEG_TO_RAD = Math.PI / 180;
export const RENDERER_TYPE = {
  UNKNOWN: 0,
  WEBGL: 1,
  CANVAS: 2
};

export const BLEND_MODES = {
  NORMAL: 0,
  ADD: 1,
  MULTIPLY: 2,
  SCREEN: 3,
  OVERLAY: 4,
  DARKEN: 5,
  LIGHTEN: 6,
  COLOR_DODGE: 7,
  COLOR_BURN: 8,
  HARD_LIGHT: 9,
  SOFT_LIGHT: 10,
  DIFFERENCE: 11,
  EXCLUSION: 12,
  HUE: 13,
  SATURATION: 14,
  COLOR: 15,
  LUMINOSITY: 16,
  NORMAL_NPM: 17,
  ADD_NPM: 18,
  SCREEN_NPM: 19
};

export const DRAW_MODES = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
};

export const SCALE_MODES = {
  LINEAR: 0,
  NEAREST: 1
};

export const WRAP_MODES = {
  CLAMP: 0,
  REPEAT: 1,
  MIRRORED_REPEAT: 2
};

export const GC_MODES = {
  AUTO: 0,
  MANUAL: 1
};

export const URL_FILE_EXTENSION = /\.(\w{3,4})(?:$|\?|#)/i;

export const DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;

export const SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i; // eslint-disable-line max-len

export const SHAPES = {
  POLY: 0,
  RECT: 1,
  CIRC: 2,
  ELIP: 3,
  RREC: 4
};

export const PRECISION = {
  LOW: "lowp",
  MEDIUM: "mediump",
  HIGH: "highp"
};

export const TRANSFORM_MODE = {
  STATIC: 0,
  DYNAMIC: 1
};

export const TEXT_GRADIENT = {
  LINEAR_VERTICAL: 0,
  LINEAR_HORIZONTAL: 1
};

export const UPDATE_PRIORITY = {
  INTERACTION: 50,
  HIGH: 25,
  NORMAL: 0,
  LOW: -25,
  UTILITY: -50
};
