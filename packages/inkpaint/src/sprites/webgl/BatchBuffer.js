export default class Buffer {
  constructor(size) {
    this.vertices = new ArrayBuffer(size);
    this.float32View = new Float32Array(this.vertices);
    this.uint32View = new Uint32Array(this.vertices);
  }

  destroy() {
    this.vertices = null;
    this.positions = null;
    this.uvs = null;
    this.colors = null;
  }
}
