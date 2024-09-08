import PsImage from "../../polyfill/Image";
import { hex2rgb, rgb2hex } from "../../utils";
import canUseNewCanvasBlendModes from "../../renderers/canvas/utils/canUseNewCanvasBlendModes";

const CanvasTinter = {
  getTintedTexture: (sprite, color) => {
    const texture = sprite._texture;
    color = CanvasTinter.roundColor(color);
    const stringColor = `#${`00000${(color | 0).toString(16)}`.substr(-6)}`;
    texture.tintCache = texture.tintCache || {};
    const cachedTexture = texture.tintCache[stringColor];

    let canvas;

    if (cachedTexture) {
      if (cachedTexture.tintId === texture._updateID) {
        return texture.tintCache[stringColor];
      }
      canvas = texture.tintCache[stringColor];
    } else {
      canvas = CanvasTinter.canvas;
    }

    CanvasTinter.tintMethod(texture, color, canvas);

    canvas.tintId = texture._updateID;

    if (CanvasTinter.convertTintToImage) {
      const tintImage = new PsImage();
      tintImage.src = canvas.toDataURL();
      texture.tintCache[stringColor] = tintImage;
    } else {
      texture.tintCache[stringColor] = canvas;
      CanvasTinter.canvas = null;
    }

    return canvas;
  },

  tintWithMultiply: (texture, color, canvas) => {
    const context = canvas.getContext("2d");
    const crop = texture._frame.clone();
    const resolution = texture.baseTexture.resolution;

    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = Math.ceil(crop.width);
    canvas.height = Math.ceil(crop.height);

    context.save();
    context.fillStyle = `#${`00000${(color | 0).toString(16)}`.substr(-6)}`;

    context.fillRect(0, 0, crop.width, crop.height);

    context.globalCompositeOperation = "multiply";

    context.drawImage(
      texture.baseTexture.source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    context.globalCompositeOperation = "destination-atop";

    context.drawImage(
      texture.baseTexture.source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    context.restore();
  },

  tintWithOverlay(texture, color, canvas) {
    const context = canvas.getContext("2d");
    const crop = texture._frame.clone();
    const resolution = texture.baseTexture.resolution;

    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = Math.ceil(crop.width);
    canvas.height = Math.ceil(crop.height);

    context.save();
    context.globalCompositeOperation = "copy";
    context.fillStyle = `#${`00000${(color | 0).toString(16)}`.substr(-6)}`;
    context.fillRect(0, 0, crop.width, crop.height);

    context.globalCompositeOperation = "destination-atop";
    context.drawImage(
      texture.baseTexture.source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    // context.globalCompositeOperation = 'copy';
    context.restore();
  },

  tintWithPerPixel: (texture, color, canvas) => {
    const context = canvas.getContext("2d");
    const crop = texture._frame.clone();
    const resolution = texture.baseTexture.resolution;

    crop.x *= resolution;
    crop.y *= resolution;
    crop.width *= resolution;
    crop.height *= resolution;

    canvas.width = Math.ceil(crop.width);
    canvas.height = Math.ceil(crop.height);

    context.save();
    context.globalCompositeOperation = "copy";
    context.drawImage(
      texture.baseTexture.source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    context.restore();

    const rgbValues = hex2rgb(color);
    const r = rgbValues[0];
    const g = rgbValues[1];
    const b = rgbValues[2];

    const pixelData = context.getImageData(0, 0, crop.width, crop.height);

    const pixels = pixelData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i + 0] *= r;
      pixels[i + 1] *= g;
      pixels[i + 2] *= b;
    }

    context.putImageData(pixelData, 0, 0);
  },

  roundColor: color => {
    const step = CanvasTinter.cacheStepsPerColorChannel;

    const rgbValues = hex2rgb(color);

    rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
    rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
    rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

    return rgb2hex(rgbValues);
  },

  cacheStepsPerColorChannel: 8,
  convertTintToImage: false,
  canUseMultiply: canUseNewCanvasBlendModes(),
  tintMethod: 0
};

CanvasTinter.tintMethod = CanvasTinter.canUseMultiply
  ? CanvasTinter.tintWithMultiply
  : CanvasTinter.tintWithPerPixel;

export default CanvasTinter;
