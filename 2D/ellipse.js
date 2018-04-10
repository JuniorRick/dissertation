
function ellipse(gl) {

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var vertices = [];

  let x = 0,
      y = 0,
      r = 0.5,
      strides = 100;
  for(let ii = 0; ii < strides; ii++) {
    x = r * Math.cos(ii * 2*Math.PI / strides);
    y = r * Math.sin(ii * 2*Math.PI / strides);

    vertices.push(x);
    vertices.push(y);
  }

  vertices.push(0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  var indices = [];

  for(let ii = 0; ii < strides - 1; ii++) {
    indices.push(vertices[vertices.length - 1]);
    indices.push(ii);
    indices.push(ii + 1);
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    square: vertexBuffer,
    indices: indexBuffer,
    vertices_length: vertices.length / 2,
    indices_length: indices.length,
  };
}
