var cubeRotation = 0.0;
var objPositions = [];
var NUM_OF_OBJS = 1000;
main();


function main() {

  var canvas = webGlUtils.getCanvas("#webgl");

  var gl = webGlUtils.getContext(canvas);
  if(!gl) {
    console.log("Unable to initialize webgl context");
    return;
  }

  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;

  const vertexSource = `

    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_NormalMatrix;

    varying highp vec3 v_Color;
    // varying highp vec2 v_Texture;
    varying highp vec3 v_Lighting;

    void main(void) {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);

      highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec4 vertexPosition = u_ModelMatrix * vec4(a_Position, 1.0);
      highp vec3 directionalVector = normalize(vec3(50, 0, -30) - vec3(vertexPosition));
      highp vec4 transformedNormal = u_NormalMatrix * vec4(a_Normal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      v_Lighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  const fragmentSource = `

    varying highp vec3 v_Lighting;

    void main(void) {
      gl_FragColor = vec4(vec3(0.0, 1.0, 1.0) * v_Lighting, 1.0);
    }
  `;


  const program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  const programInfo = {
    program: program,
    attribLocations: {
      a_Position: gl.getAttribLocation(program, 'a_Position'),
      a_Normal: gl.getAttribLocation(program, 'a_Normal'),
    },
    uniformLocations: {
      u_ProjectionMatrix: gl.getUniformLocation(program, 'u_ProjectionMatrix'),
      u_ModelMatrix: gl.getUniformLocation(program, 'u_ModelMatrix'),
      u_ViewMatrix: gl.getUniformLocation(program, 'u_ViewMatrix'),
      u_NormalMatrix: gl.getUniformLocation(program, 'u_NormalMatrix'),
    },
  }

  const buffers = initBuffers(gl);

  const fpsElem = document.querySelector("#fps");

  for(let ii = 0; ii < NUM_OF_OBJS; ii++) {
    let x = randBetween(-20, 20),
        y = randBetween(-10, 10),
        z = randBetween(-10, -90);
    objPositions.push([x,y,z]);
  }
// console.log(objPositions);

  let then = 0.0;
  var timeLapse = 0;
  var objInfo = {};
  function render(now) {
    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    const fps = 1 / deltaTime;

    if(now - timeLapse > 1) {
      fpsElem.textContent = fps.toFixed(1);
      timeLapse = now;
    }

    objInfo.deltaTime = deltaTime
    drawScene(gl, programInfo, buffers, objInfo.deltaTime / 2);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function initBuffers(gl) {

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    // Front face         Normals
    -1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
     1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
     1.0,  1.0,  1.0,   0.0,  0.0,  1.0,
    -1.0,  1.0,  1.0,   0.0,  0.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,   0.0,  0.0, -1.0,
    -1.0,  1.0, -1.0,   0.0,  0.0, -1.0,
     1.0,  1.0, -1.0,   0.0,  0.0, -1.0,
     1.0, -1.0, -1.0,   0.0,  0.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,   0.0,  1.0,  0.0,
    -1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
     1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
     1.0,  1.0, -1.0,   0.0,  1.0,  0.0,

    // Bottom face
    -1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
     1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
     1.0, -1.0,  1.0,   0.0, -1.0,  0.0,
    -1.0, -1.0,  1.0,   0.0, -1.0,  0.0,

    // Right face
     1.0, -1.0, -1.0,   1.0,  0.0,  0.0,
     1.0,  1.0, -1.0,   1.0,  0.0,  0.0,
     1.0,  1.0,  1.0,   1.0,  0.0,  0.0,
     1.0, -1.0,  1.0,   1.0,  0.0,  0.0,

    // Left face
    -1.0, -1.0, -1.0,   -1.0,  0.0,  0.0,
    -1.0, -1.0,  1.0,   -1.0,  0.0,  0.0,
    -1.0,  1.0,  1.0,   -1.0,  0.0,  0.0,
    -1.0,  1.0, -1.0,   -1.0,  0.0,  0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

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
  }

}


function drawScene(gl, programInfo, buffers, objInfo) {

  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // const fieldOfView = glMatrix.toRadian(45);
  const fieldOfView = 45 * Math.PI / 180;
  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 1000.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, zNear, zFar);

  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, 10], [0, 0, -100], [0, 1, 0]);

  cubeRotation += objInfo.deltaTime;

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalized = false;
    const stride = FSIZE * 6;
    const pointer = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.a_Position,
      numComponents, type, normalized, stride, pointer);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.a_Position);
  }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalized = false;
    const stride = FSIZE * 6;
    const pointer = FSIZE * 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.a_Normal,
      numComponents, type, normalized, stride, pointer);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.a_Normal);
  }


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix,
    false, projectionMatrix);

  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ViewMatrix,
    false, viewMatrix);

  objPositions.forEach(function(elem){

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [elem[0], elem[1], elem[2]]);
    mat4.rotate(modelMatrix, modelMatrix, cubeRotation, [0, 0, 1]);
    mat4.rotate(modelMatrix, modelMatrix, cubeRotation * 0.5, [0, 1, 0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelMatrix,
      false, modelMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.u_NormalMatrix,
      false, normalMatrix);

    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  });

}
