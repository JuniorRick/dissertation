
function donut(gl) {

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var vertices = [];

  let x = 0,
      y = 0,
      r = 0.5,
      strides = 120;
  for(let ii = 0; ii < strides; ii++) {
    x = r * Math.cos(ii * 2*Math.PI / strides * 2);
    y = r * Math.sin(ii * 2*Math.PI / strides * 2);
    // x = r * Math.cos(ii * 2*Math.PI / 180);
    // y = r * Math.sin(ii * 2*Math.PI / 180);

    vertices.push(x);
    vertices.push(y);

    vertices.push(x * 0.5);
    vertices.push(y * 0.5);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  var indices = [];

  for(let ii = 0; ii < strides; ii++) {
    indices.push(ii);
    indices.push(ii + 1);
    indices.push(ii + 2);
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    vertices: vertexBuffer,
    indices: indexBuffer,
    vertices_length: vertices.length / 2,
    indices_length: indices.length,
  };
}
