
function quad(gl) {
  "use strict";
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var vertices = [
    -0.5, 0.5,
    0.5, 0.5,
    -0.5, -0.5,
    -0.5, -0.5,
    0.5, 0.5,
    0.5, -0.5,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  return {
    square: vertexBuffer,
    vertices_length: vertices.length / 2,
  };
}
