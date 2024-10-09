'use strict';

/**
 * GLUtil - A OpenGl tool function library
 *
 * ####Example:
 *
 *
 *
 * @object
 */
const ndarray = require('ndarray');
const ndarray_pixels = require('ndarray-pixels');

const GLUtil = {
  byteArray: null,
  getPixelsByteArray({ gl, width, height }) {
    const byteArray = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, byteArray);
    return byteArray;
  },

  enableBlendMode(gl) {
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
  },

  /**
   * Get the pixel data of the image
   * https://github.com/stackgl/gl-texture2d/issues/16
   * @public
   */
  async getPixels({ type, data, width, height }) {
    if (type === 'raw') {
      return ndarray(data, [width, height, 4], [4, width * 4, 1]);
    } else {
      const res = await ndarray_pixels.getPixels(data, `image/${type}`);
      return res;
    }
  },
};

module.exports = GLUtil;
