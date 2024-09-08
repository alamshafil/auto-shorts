const GLFix = {
  // Temporary fix https://github.com/stackgl/headless-gl/issues/170
  fixGetUniformLocation(ctx) {
    const _getUniformLocation = ctx.getUniformLocation;

    ctx.getUniformLocation = function(program, name) {
      if (program._uniforms && !/\[\d+\]$/.test(name)) {
        const reg = new RegExp(`${name}\\[\\d+\\]$`);

        for (let i = 0; i < program._uniforms.length; i++) {
          const _name = program._uniforms[i].name;
          if (reg.test(_name)) name = _name;
        }
      }

      return _getUniformLocation.call(this, program, name);
    };
  },

  fixTexImage2D(ctx) {
    const _tetImage2D = ctx.texImage2D;

    // ctx.texImage2D = function(...args) {
    //   let pixels = args[args.length - 1];
    //   if (pixels._image) pixels = pixels._image;

    //   if (pixels instanceof Image) {
    //     const canvas = new Canvas(pixels.width, pixels.height);
    //     canvas.getContext("2d").drawImage(pixels, 0, 0);
    //     args[args.length - 1] = canvas;
    //   }

    //   return _tetImage2D.apply(this, args);
    // };
  }
};

export default GLFix;
