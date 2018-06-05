function drawCube() {
  var canvas = document.querySelector('#cube');
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  const vertexSource = `
    attribute vec3 a_Position;
    // attribute vec3 a_Color;
    attribute vec2 a_TextureCoord;

    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;

    // varying vec3 v_Color;
    varying highp vec2 v_TextureCoord;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
        // v_Color = a_Color;
        v_TextureCoord = a_TextureCoord;
    }
  `;

  const fragmentSource = `
    varying highp vec2 v_TextureCoord;
    uniform sampler2D u_Sampler;

    void main(void) {
      gl_FragColor = texture2D(u_Sampler, v_TextureCoord);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexSource);
  gl.shaderSource(fragmentShader, fragmentSource);

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
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




  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
    gl.UNSIGNED_BYTE, new Uint8Array([0,255,255,255]));


  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                      gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = '';

  const a_Position = gl.getAttribLocation(program, 'a_Position');
  const a_TextureCoord = gl.getAttribLocation(program, 'a_TextureCoord');

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // gl.enableVertexAttribArray(a_Color);

  const num = 2; // every coordinate composed of 2 values
  const type = gl.FLOAT; // the data in the buffer is 32 bit float
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set to the next
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(a_TextureCoord, num, type, normalize, stride, offset);
  gl.enableVertexAttribArray(a_TextureCoord);

  gl.useProgram(program);


  const projectionMatrix = mat4.create();
  const fieldOfView = glMatrix.toRadian(45);
  const aspect = canvas.width / canvas.height;
  const zNear = 0.1;
  const zFar = 100;
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const viewMatrix = mat4.create();
  const eye =  [0.0, 0.0, 3.0];
  const center = [0.0, 0.0, -10.0];
  const up = [0.0, 1.0, 1.0];
  mat4.lookAt(viewMatrix, eye, center, up);

  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -3.0]);
  mat4.rotate(modelMatrix, modelMatrix, 30, [1.0, 1.0, 0.0]);

  const u_ProjectionMatrix = gl.getUniformLocation(program, 'u_ProjectionMatrix');
  const u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
  const u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');

  const u_Sampler = gl.getUniformLocation(program, 'u_Sampler');

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);


  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_Sampler, 0);


  gl.clearColor(0.0, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);

  var rotate = 0.0;
  var then = 0.0;
  function render(now){

    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -3.0]);
    mat4.rotate(modelMatrix, modelMatrix, rotate, [0.0, 1.0, 0.0]);
    mat4.rotate(modelMatrix, modelMatrix, rotate * 0.5, [1.0, 1.0, 0.0]);


    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

    rotate += deltaTime;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }
}
