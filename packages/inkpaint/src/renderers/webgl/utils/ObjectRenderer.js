import WebGLManager from "../managers/WebGLManager";

export default class ObjectRenderer extends WebGLManager {
  start() {
    // set the shader..
  }

  stop() {
    this.flush();
  }

  flush() {
    // flush!
  }

  render(object) {
    // render the object
  }
}
