import "./polyfill/requestAnimationFrame";

import { utils } from "./core";
utils.mixins.performMixins();

import * as filters from "./filters";
import { loader, Loader, Resource } from "./loaders";

// node-canvas and headless-gl api
export {
  gl,
  Canvas,
  Context2d,
  CanvasRenderingContext2D,
  CanvasGradient,
  CanvasPattern,
  Image,
  ImageData,
  PNGStream,
  PDFStream,
  JPEGStream,
  DOMMatrix,
  DOMPoint,
  registerFont,
  deregisterAllFonts,
  parseFont,
  createCanvas,
  createImageData,
  loadImage
} from "./canvas-gl";

// inkpaint engine core api
export {
  settings,
  utils,
  ticker,
  Ticker,
  CanvasRenderer,
  WebGLRenderer,
  Bounds,
  ProxyObj,
  DisplayObject,
  Container,
  Transform,
  TransformStatic,
  Sprite,
  AnimatedSprite,
  CanvasSpriteRenderer,
  CanvasTinter,
  SpriteRenderer,
  Text,
  TextStyle,
  TextMetrics,
  Graphics,
  GraphicsRenderer,
  Texture,
  TextureMatrix,
  BaseTexture,
  Shader,
  Spritesheet,
  WebGLManager,
  ObjectRenderer,
  Quad,
  SpriteMaskFilter,
  Filter,
  RenderTexture,
  BaseRenderTexture,
  Rectangle,
  Application
} from "./core";

// inkpaint pugins
export * from "./const";
export * from "./math";
export { filters, loader, Loader, Resource };

export {
  TextureCache,
  BaseTextureCache,
  addToTextureCache,
  removeFromTextureCache,
  removeFromBaseTextureCache,
  addToBaseTextureCache,
  destroyAllTextureCache,
  deleteAllTextureCache,
  destroyAndCleanAllCache
} from "./utils/cache";

global.InkPaint = exports;
