export default function validateContext(gl) {
  const attributes = gl.getContextAttributes();

  // this is going to be fairly simple for now.. but at least we have room to grow!
  if (!attributes.stencil) {
    console.warn(
      "Provided WebGL context does not have a stencil buffer, masks may not render correctly"
    );
  }
}
