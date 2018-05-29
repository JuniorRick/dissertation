buffers = function () {

  //cube buffer
  var cube = function(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const vertices = [
      // Front face
      -1.0, -1.0,  1.0,     0.0,  0.0,  1.0,
       1.0, -1.0,  1.0,     0.0,  0.0,  1.0,
       1.0,  1.0,  1.0,     0.0,  0.0,  1.0,
      -1.0,  1.0,  1.0,     0.0,  0.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,     0.0,  0.0, -1.0,
      -1.0,  1.0, -1.0,     0.0,  0.0, -1.0,
       1.0,  1.0, -1.0,     0.0,  0.0, -1.0,
       1.0, -1.0, -1.0,     0.0,  0.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,     0.0,  1.0,  0.0,
      -1.0,  1.0,  1.0,     0.0,  1.0,  0.0,
       1.0,  1.0,  1.0,     0.0,  1.0,  0.0,
       1.0,  1.0, -1.0,     0.0,  1.0,  0.0,

      // Bottom face
      -1.0, -1.0, -1.0,     0.0, -1.0,  0.0,
       1.0, -1.0, -1.0,     0.0, -1.0,  0.0,
       1.0, -1.0,  1.0,     0.0, -1.0,  0.0,
      -1.0, -1.0,  1.0,     0.0, -1.0,  0.0,

      // Right face
       1.0, -1.0, -1.0,     1.0,  0.0,  0.0,
       1.0,  1.0, -1.0,     1.0,  0.0,  0.0,
       1.0,  1.0,  1.0,     1.0,  0.0,  0.0,
       1.0, -1.0,  1.0,     1.0,  0.0,  0.0,

      // Left face
      -1.0, -1.0, -1.0,    -1.0,  0.0,  0.0,
      -1.0, -1.0,  1.0,    -1.0,  0.0,  0.0,
      -1.0,  1.0,  1.0,    -1.0,  0.0,  0.0,
      -1.0,  1.0, -1.0,    -1.0,  0.0,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);


    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      indices: indexBuffer,
      texture: textureCoordBuffer,
      len: 36,
    };

  };

  //sphere buffer
  var sphere = function(gl) {
    const vertices = [];
    const textureCoordinates = [];
    const lat = 30;
    const long = 30;

    var radius = 3;
    let r = Math.random(),
    g = Math.random(),
    b = Math.random();
    for(let i = 0; i <= lat; i++) {
      let theta = i * Math.PI / lat;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);

      for(let j = 0; j <= long; j++) {
        let phi = j * 2 * Math.PI / long;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        let x = cosPhi * sinTheta;
        let y = cosTheta;
        let z = sinPhi * sinTheta;

        vertices.push(radius * x);
        vertices.push(radius * y);
        vertices.push(radius * z);

        // let rgb = Math.random();

        vertices.push(x);
        vertices.push(y);
        vertices.push(z);

        let u = 1 - (j / long);
        let v = 1 - (i / lat);

        textureCoordinates.push(u);
        textureCoordinates.push(v);


      }
    }

    var indices = [];

    for(let j = 0; j < lat; j++) {
      for(let i = 0; i < long; i++) {
        let first = j + i * (long + 1);
        let second = first + long + 1;

        indices.push(second);
        indices.push(first + 1);
        indices.push(second + 1);

        indices.push(first);
        indices.push(first + 1);
        indices.push(second);

      }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STREAM_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);


    return {
      position: positionBuffer,
      indices: indexBuffer,
      texture: textureCoordBuffer,
      len: 5400,
    };

  };

  return {
    cube: cube,
    sphere: sphere,
  };

}();
