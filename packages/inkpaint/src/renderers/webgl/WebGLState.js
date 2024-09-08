import mapWebGLBlendModesToPixi from "./utils/mapWebGLBlendModesToPixi";

const BLEND = 0;
const DEPTH_TEST = 1;
const FRONT_FACE = 2;
const CULL_FACE = 3;
const BLEND_FUNC = 4;

export default class WebGLState {
  constructor(gl) {
    this.activeState = new Uint8Array(16);
    this.defaultState = new Uint8Array(16);
    this.defaultState[0] = 1;
    this.stackIndex = 0;
    this.stack = [];
    this.gl = gl;

    this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.attribState = {
      tempAttribState: new Array(this.maxAttribs),
      attribState: new Array(this.maxAttribs)
    };

    this.blendModes = mapWebGLBlendModesToPixi(gl);
    this.nativeVaoExtension =
      gl.getExtension("OES_vertex_array_object") ||
      gl.getExtension("MOZ_OES_vertex_array_object") ||
      gl.getExtension("WEBKIT_OES_vertex_array_object");
  }

  push() {
    let state = this.stack[this.stackIndex];

    if (!state) {
      state = this.stack[this.stackIndex] = new Uint8Array(16);
    }

    ++this.stackIndex;
    for (let i = 0; i < this.activeState.length; i++) {
      state[i] = this.activeState[i];
    }
  }

  pop() {
    const state = this.stack[--this.stackIndex];
    this.setState(state);
  }

  setState(state) {
    this.setBlend(state[BLEND]);
    this.setDepthTest(state[DEPTH_TEST]);
    this.setFrontFace(state[FRONT_FACE]);
    this.setCullFace(state[CULL_FACE]);
    this.setBlendMode(state[BLEND_FUNC]);
  }

  setBlend(value) {
    value = value ? 1 : 0;
    if (this.activeState[BLEND] === value) {
      return;
    }

    this.activeState[BLEND] = value;
    this.gl[value ? "enable" : "disable"](this.gl.BLEND);
  }

  setBlendMode(value) {
    if (value === this.activeState[BLEND_FUNC]) {
      return;
    }

    this.activeState[BLEND_FUNC] = value;

    const mode = this.blendModes[value];

    if (mode.length === 2) {
      this.gl.blendFunc(mode[0], mode[1]);
    } else {
      this.gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
    }
  }

  setDepthTest(value) {
    value = value ? 1 : 0;

    if (this.activeState[DEPTH_TEST] === value) {
      return;
    }

    this.activeState[DEPTH_TEST] = value;
    this.gl[value ? "enable" : "disable"](this.gl.DEPTH_TEST);
  }

  setCullFace(value) {
    value = value ? 1 : 0;

    if (this.activeState[CULL_FACE] === value) {
      return;
    }

    this.activeState[CULL_FACE] = value;
    this.gl[value ? "enable" : "disable"](this.gl.CULL_FACE);
  }

  setFrontFace(value) {
    value = value ? 1 : 0;

    if (this.activeState[FRONT_FACE] === value) {
      return;
    }

    this.activeState[FRONT_FACE] = value;
    this.gl.frontFace(this.gl[value ? "CW" : "CCW"]);
  }

  resetAttributes() {
    for (let i = 0; i < this.attribState.tempAttribState.length; i++) {
      this.attribState.tempAttribState[i] = 0;
    }

    for (let i = 0; i < this.attribState.attribState.length; i++) {
      this.attribState.attribState[i] = 0;
    }

    // im going to assume one is always active for performance reasons.
    for (let i = 1; i < this.maxAttribs; i++) {
      this.gl.disableVertexAttribArray(i);
    }
  }

  resetToDefault() {
    // unbind any VAO if they exist..
    if (this.nativeVaoExtension) {
      this.nativeVaoExtension.bindVertexArrayOES(null);
    }

    // reset all attributes..
    this.resetAttributes();

    // set active state so we can force overrides of gl state
    for (let i = 0; i < this.activeState.length; ++i) {
      this.activeState[i] = 32;
    }

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

    this.setState(this.defaultState);
  }
}
