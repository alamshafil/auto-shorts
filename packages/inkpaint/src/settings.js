import maxRecommendedTextures from "./utils/maxRecommendedTextures";

export default {
  TARGET_FPMS: 0.06,
  MIPMAP_TEXTURES: true,
  RESOLUTION: 1,
  FILTER_RESOLUTION: 1,
  SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),
  SPRITE_BATCH_SIZE: 4096,
  RETINA_PREFIX: /@([0-9\.]+)x/,

  RENDER_OPTIONS: {
    view: null,
    antialias: false,
    forceFXAA: false,
    autoResize: false,
    transparent: false,
    backgroundColor: 0x000000,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    roundPixels: false,
    width: 800,
    height: 600,
    legacy: false
  },

  TRANSFORM_MODE: 0,
  GC_MODE: 0,
  GC_MAX_IDLE: 60 * 60,
  GC_MAX_CHECK_COUNT: 60 * 10,
  WRAP_MODE: 0,
  SCALE_MODE: 0,
  PRECISION_VERTEX: "highp",
  PRECISION_FRAGMENT: "mediump",
  CAN_UPLOAD_SAME_BUFFER: true,
  MESH_CANVAS_PADDING: 0
};
