const ONE_FRAME_TIME = 16;

// Date.now
if (!(Date.now && Date.prototype.getTime)) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

// performance.now
if (!(global.performance && global.performance.now)) {
  const startTime = Date.now();

  if (!global.performance) {
    global.performance = {};
  }

  global.performance.now = () => Date.now() - startTime;
}

// requestAnimationFrame
let lastTime = Date.now();
const vendors = ["ms", "moz", "webkit", "o"];

for (let x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
  const p = vendors[x];

  global.requestAnimationFrame = global[`${p}RequestAnimationFrame`];
  global.cancelAnimationFrame =
    global[`${p}CancelAnimationFrame`] ||
    global[`${p}CancelRequestAnimationFrame`];
}

if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = callback => {
    if (typeof callback !== "function") {
      throw new TypeError(`${callback}is not a function`);
    }

    const currentTime = Date.now();
    let delay = ONE_FRAME_TIME + lastTime - currentTime;

    if (delay < 0) {
      delay = 0;
    }

    lastTime = currentTime;

    return setTimeout(() => {
      lastTime = Date.now();
      callback(performance.now());
    }, delay);
  };
}

if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = id => clearTimeout(id);
}
