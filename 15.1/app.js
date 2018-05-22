window.onload = main;

var rotate = 0.0;

var sphereTexture = '';
var cubeTexture = '';

var width = 300;
var height = 300;

var randPos = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

const MIN = -50;
const MAX = 50;
const MIN_Z = -500;
const MAX_Z = -5;
const N = 500; // *2
for(let ii = 0; ii < N; ii++) {
  let x = random(MIN, MAX);
  let y = random(MIN, MAX);
  let z = random(MIN_Z, MAX_Z);

  randPos.push({x: x, y: y, z: z});
}

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glCanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vertexSource = `
    attribute vec3 a_Position;
    attribute vec3 a_Normal;
    attribute vec2 a_TextureCoord;

    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ModelMatrix;

    uniform mat4 u_NormalMatrix;

    varying highp vec2 v_TextureCoord;
    varying highp vec3 v_Normal;
    varying highp vec3 v_Position;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);

        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
        v_Position = vec3(u_ModelMatrix * vec4(a_Position, 1.0));
        v_TextureCoord = a_TextureCoord;
    }
  `;

  // Fragment shader program

  const fragmentSource = `
    precision highp float;
    uniform sampler2D u_Sampler;

    uniform vec3 u_LightPosition;
    uniform vec3 u_AmbientLight;
    uniform vec3 u_DiffuseLight;

    varying highp vec2 v_TextureCoord;
    varying highp vec3 v_Normal;
    varying highp vec3 v_Position;

    void main(void) {
      vec3 normal = normalize(v_Normal);

      vec3 lightDirection = normalize(u_LightPosition - v_Position);

      float nDotL = max(dot(lightDirection, normal), 0.0);

      vec4 texel = texture2D(u_Sampler, v_TextureCoord);

      vec3 diffuse = u_DiffuseLight * texel.rgb * nDotL;
      vec3 ambient = u_AmbientLight * texel.rgb;

      gl_FragColor = vec4(diffuse + ambient, texel.a);
    }
  `;

  const program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  const programInfo = {
    program: program,
    attribLocations: {
      a_Position: gl.getAttribLocation(program, 'a_Position'),
      a_TextureCoord: gl.getAttribLocation(program, 'a_TextureCoord'),
      a_Normal: gl.getAttribLocation(program, 'a_Normal'),

    },
    uniformLocations: {
      u_ProjectionMatrix: gl.getUniformLocation(program, 'u_ProjectionMatrix'),
      u_ViewMatrix: gl.getUniformLocation(program, 'u_ViewMatrix'),
      u_ModelMatrix: gl.getUniformLocation(program, 'u_ModelMatrix'),

      u_NormalMatrix: gl.getUniformLocation(program, 'u_NormalMatrix'),
      u_LightPosition: gl.getUniformLocation(program, 'u_LightPosition'),
      u_AmbientLight: gl.getUniformLocation(program, 'u_AmbientLight'),
      u_DiffuseLight: gl.getUniformLocation(program, 'u_DiffuseLight'),

      u_Sampler: gl.getUniformLocation(program, 'u_Sampler'),
    },
  };


  sphereTexture = webGlUtils.loadTexture(gl, 'sphere.jpg');
  cubeTexture = webGlUtils.loadTexture(gl, 'cube.jpg');
  gl.useProgram(program);

  const viewMatrix = mat4.create();
  const eye =  [0.0, 0.0, 3.0];
  const target = [0.0, 0.0, -10.0];
  const up = [0.0, 1.0, 1.0];
  mat4.lookAt(viewMatrix, eye, target, up);


  gl.uniform3f(programInfo.uniformLocations.u_DiffuseLight, 1.0, 1.0, 1.0);
  gl.uniform3f(programInfo.uniformLocations.u_AmbientLight, 0.3, 0.3, 0.3);
  gl.uniform3f(programInfo.uniformLocations.u_LightPosition, 1.0, 0.0, -1.3);

  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ViewMatrix,
    false, viewMatrix);

  gl.clearColor(0.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things


  var then = 0;
  var timeLapse = 0;
  // Draw the scene repeatedly
  var lastWidth = window.innerWidth;
  var lastHeight = window.innerHeight;
  var timeLapse = 0.0;
  var fpsElem = document.querySelector('#fps');
  var counter = document.querySelector('#counter');
  counter.textContent = "count: " + N * 2;


  function render(now) {


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const projectionMatrix = mat4.create();
    const fieldOfView = glMatrix.toRadian(45);
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 1000;
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix,
      false, projectionMatrix);

    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    const fps = 1 / deltaTime;

    if(now - timeLapse > 0.5) {
      fpsElem.textContent = "fps: " + fps.toFixed(1);
      timeLapse = now;
    }

    drawScene(gl, programInfo, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;

  const sphereBuffer = buffers.sphere(gl);
  setBuffersAndAttributes(gl, sphereBuffer, programInfo);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
  gl.uniform1i(programInfo.uniformLocations.u_Sampler, 0);
  for(let ii = 0; ii < N; ii++) {
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -50.0]);
    mat4.translate(modelMatrix, modelMatrix, [randPos[ii].x, randPos[ii].y, randPos[ii].z]);
    mat4.rotate(modelMatrix, modelMatrix, rotate, [0.0, 1.0, 0.0]);
    mat4.rotate(modelMatrix, modelMatrix, randPos[ii].x, [1.0, 1.0, 0.0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelMatrix,
      false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.u_NormalMatrix,
      false, normalMatrix);

    gl.drawElements(gl.TRIANGLES, sphereBuffer.len, type, offset);

  }

  const cubeBuffer = buffers.cube(gl);
  setBuffersAndAttributes(gl, cubeBuffer, programInfo);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.uniform1i(programInfo.uniformLocations.u_Sampler, 1);

  for(let ii = 0; ii < N; ii++) {
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -50.0]);
    mat4.translate(modelMatrix, modelMatrix, [randPos[ii].y, randPos[ii].x, randPos[ii].z]);
    mat4.scale(modelMatrix, modelMatrix, [2,2,2]);
    mat4.rotate(modelMatrix, modelMatrix, rotate, [0.0, 1.0, 0.0]);
    mat4.rotate(modelMatrix, modelMatrix, randPos[ii].x, [1.0, 1.0, 0.0]);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelMatrix,
      false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.u_NormalMatrix,
      false, normalMatrix);

    gl.drawElements(gl.TRIANGLES, cubeBuffer.len, type, offset);

  }

  rotate += deltaTime;
}

function setBuffersAndAttributes(gl, buffer, programInfo) {
  const positionBuffer = buffer.position;
  const indexBuffer = buffer.indices;
  const textureCoordBuffer = buffer.texture;
  // const vertexCount = buffer.len;

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  let num = 3; // every coordinate composed of num values
  const type = gl.FLOAT; // the data in the buffer is 32 bit float
  const normalize = false; // don't normalize
  let stride = FSIZE * 6; // how many bytes to get from one set to the next
  let offset = 0; // how many bytes inside the buffer to start from

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.a_Position,
    num, type, normalize,  stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.a_Position);

  offset = FSIZE * 3;
  gl.vertexAttribPointer(programInfo.attribLocations.a_Normal,
    num, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.a_Normal);

  num = 2;
  stride = 0;
  offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.a_TextureCoord,
    num, type, normalize, stride, offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.a_TextureCoord);

}
