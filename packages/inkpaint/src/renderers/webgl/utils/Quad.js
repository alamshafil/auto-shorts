import glCore from "pixi-gl-core";
import createIndicesForQuads from "../../../utils/createIndicesForQuads";

export default class Quad {
  constructor(gl, state) {
    this.gl = gl;
    this.vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
    this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
    this.interleaved = new Float32Array(8 * 2);

    for (let i = 0; i < 4; i++) {
      this.interleaved[i * 4] = this.vertices[i * 2];
      this.interleaved[i * 4 + 1] = this.vertices[i * 2 + 1];
      this.interleaved[i * 4 + 2] = this.uvs[i * 2];
      this.interleaved[i * 4 + 3] = this.uvs[i * 2 + 1];
    }

    this.indices = createIndicesForQuads(1);
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(
      gl,
      this.interleaved,
      gl.STATIC_DRAW
    );
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(
      gl,
      this.indices,
      gl.STATIC_DRAW
    );

    this.vao = new glCore.VertexArrayObject(gl, state);
  }

  initVao(shader) {
    this.vao
      .clear()
      .addIndex(this.indexBuffer)
      .addAttribute(
        this.vertexBuffer,
        shader.attributes.aVertexPosition,
        this.gl.FLOAT,
        false,
        4 * 4,
        0
      )
      .addAttribute(
        this.vertexBuffer,
        shader.attributes.aTextureCoord,
        this.gl.FLOAT,
        false,
        4 * 4,
        2 * 4
      );
  }

  map(targetTextureFrame, destinationFrame) {
    let x = 0; // destinationFrame.x / targetTextureFrame.width;
    let y = 0; // destinationFrame.y / targetTextureFrame.height;

    this.uvs[0] = x;
    this.uvs[1] = y;

    this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[3] = y;

    this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;

    this.uvs[6] = x;
    this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;

    x = destinationFrame.x;
    y = destinationFrame.y;

    this.vertices[0] = x;
    this.vertices[1] = y;

    this.vertices[2] = x + destinationFrame.width;
    this.vertices[3] = y;

    this.vertices[4] = x + destinationFrame.width;
    this.vertices[5] = y + destinationFrame.height;

    this.vertices[6] = x;
    this.vertices[7] = y + destinationFrame.height;

    return this;
  }

  upload() {
    for (let i = 0; i < 4; i++) {
      this.interleaved[i * 4] = this.vertices[i * 2];
      this.interleaved[i * 4 + 1] = this.vertices[i * 2 + 1];
      this.interleaved[i * 4 + 2] = this.uvs[i * 2];
      this.interleaved[i * 4 + 3] = this.uvs[i * 2 + 1];
    }

    this.vertexBuffer.upload(this.interleaved);
    return this;
  }

  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.indexBuffer);
  }
}
