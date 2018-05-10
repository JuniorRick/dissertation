
window.onload = main;

var width = 300;
var height = 300;

var randPos = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}
const MIN = -50;
const MAX = 50;
const MIN_Z = -500;
const MAX_Z = -10;
const N = 100;
for(let ii = 0; ii < N; ii++) {
  let x = random(MIN, MAX);
  let y = random(MIN, MAX);
  let z = random(MIN_Z, MAX_Z);

  randPos.push({x: x, y: y, z: z});
}

function main() {
  var canvas = document.querySelector('#glCanvas');
  var gl = webGlUtils.getContext(canvas);

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

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

    const positionBuffer = buffers.sphere(gl).position;
    const indexBuffer = buffers.sphere(gl).indices;
    const textureCoordBuffer = buffers.sphere(gl).texture;
    const vertexCount = buffers.sphere(gl).len;

    const texture = webGlUtils.loadTexture(gl, 'cube.jpg');



    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.a_Position,
      3, gl.FLOAT, false,  FSIZE * 6, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_Position);

    gl.vertexAttribPointer(programInfo.attribLocations.a_Normal,
      3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_Normal);

    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.a_TextureCoord,
      num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.a_TextureCoord);

    gl.useProgram(program);


    const projectionMatrix = mat4.create();
    const fieldOfView = glMatrix.toRadian(45);
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1;
    const zFar = 1000;
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const viewMatrix = mat4.create();
    const eye =  [0.0, 0.0, 3.0];
    const center = [0.0, 0.0, -10.0];
    const up = [0.0, 1.0, 1.0];
    mat4.lookAt(viewMatrix, eye, center, up);

    gl.uniform3f(programInfo.uniformLocations.u_DiffuseLight, 1.0, 1.0, 1.0);
    gl.uniform3f(programInfo.uniformLocations.u_AmbientLight, 0.3, 0.3, 0.3);
    gl.uniform3f(programInfo.uniformLocations.u_LightPosition, 1.0, 0.0, -1.3);


    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix,
      false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.u_ViewMatrix,
      false, viewMatrix);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.u_Sampler, 0);


    gl.clearColor(0.0, 0.5, 0.5, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var rotate = 0.0;
    var then = 0.0;
    var timeLapse = 0;
    const fpsElem = document.querySelector("#fps");

    function render(now){

      now *= 0.001;
      let deltaTime = now - then;
      then = now;
      const fps = 1 / deltaTime;             // compute frames per second

      if(now - timeLapse > 1) {
        fpsElem.textContent = fps.toFixed(1);
        timeLapse = now;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.clear(gl.COLOR_BUFFER_BIT);
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;

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

        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }

      rotate += deltaTime;
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    function isPowerOf2(value) {
      return (value & (value - 1)) == 0;
    }
}
