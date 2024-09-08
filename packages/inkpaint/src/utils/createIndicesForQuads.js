export default function createIndicesForQuads(size) {
  const totalIndices = size * 6;
  const indices = new Uint16Array(totalIndices);

  for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
    indices[i + 0] = j + 0;
    indices[i + 1] = j + 1;
    indices[i + 2] = j + 2;
    indices[i + 3] = j + 0;
    indices[i + 4] = j + 2;
    indices[i + 5] = j + 3;
  }

  return indices;
}
