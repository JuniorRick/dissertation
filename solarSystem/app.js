
window.onload  = main;

var width = 100;
var height = 100;
var centerX = width * 0.05;
var centerY = height * 0.05;
var offset = height * .004;
var sphereRotation = 0.0;

var speed = 0.5;
var MERCURY_ROTATION_SPEED = 0.025 * speed;
var VENUS_ROTATION_SPEED = 0.022 * speed;
var EARTH_ROTATION_SPEED = 0.02 * speed;
var MARS_ROTATION_SPEED = 0.018 * speed;

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
    // attribute vec3 a_Color;
    attribute vec2 a_Texture;
    attribute vec3 a_Normal;

    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_NormalMatrix;

    // varying highp vec3 v_Color;
    varying highp vec2 v_Texture;
    varying highp vec3 v_Lighting;

    void main() {
      gl_Position = u_ProjectionMatrix * u_ModelMatrix * u_ViewMatrix * vec4(a_Position, 1.0);
      // v_Color = a_Color;
      v_Texture = a_Texture;

      highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0, 0, 1));

      highp vec4 transformedNormal = u_NormalMatrix * vec4(a_Normal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      v_Lighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  const fragmentSource = `
    // varying highp vec3 v_Color;
    varying highp vec2 v_Texture;
    varying highp vec3 v_Lighting;

    uniform sampler2D u_Sampler;

    void main() {
      highp vec4 texelColor = texture2D(u_Sampler, v_Texture);

      gl_FragColor = vec4(texelColor.rgb * v_Lighting, texelColor.a);
    }
  `;


  const program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  const programInfo = {
    program: program,
    attribLocations: {
      a_Position: gl.getAttribLocation(program, 'a_Position'),
      a_Normal: gl.getAttribLocation(program, 'a_Normal'),
      a_Texture: gl.getAttribLocation(program, 'a_Texture'),
    },
    uniformLocations: {
      u_ProjectionMatrix: gl.getUniformLocation(program, 'u_ProjectionMatrix'),
      u_ModelMatrix: gl.getUniformLocation(program, 'u_ModelMatrix'),
      u_ViewMatrix: gl.getUniformLocation(program, 'u_ViewMatrix'),
      u_NormalMatrix: gl.getUniformLocation(program, 'u_NormalMatrix'),
    },
  }

  const buffers = initBuffers(gl);
  const earthTexture = loadTexture(gl, 'earth_texture_3d/png');

  const fpsElem = document.querySelector("#fps");

  var objInfo = {};
  var then = 0;
  var timeLapse = 0;
  var mercuryAngle = 0.0,
      earthAngle = 0.0,
      venusAngle = 0.0,
      marsAngle = 0.0;


  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);




  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things




  function render(now) {
    now *= 0.001;                          // convert to seconds
    const deltaTime = now - then;          // compute time since last frame
    then = now;                            // remember time for next frame
    const fps = 1 / deltaTime;             // compute frames per second

    if(now - timeLapse > 1) {
      fpsElem.textContent = fps.toFixed(1);
      timeLapse = now;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    object_angle = 0;
    objInfo.xRadius = 0;
    objInfo.zRadius = 0;
    objInfo.deltaTime = 0;
    objInfo.starName = 'Sun';
    objInfo.scale = 10;
    gl.bindTexture(gl.TEXTURE_2D, buffers.sunTexture);
    drawScene(gl, programInfo, buffers, buffers.sunTexture, objInfo);

    mercuryAngle += MERCURY_ROTATION_SPEED;
    objInfo.angle = mercuryAngle;
    objInfo.xRadius = 14;
    objInfo.zRadius = 13;
    objInfo.deltaTime = deltaTime;
    objInfo.starName = 'Mercury';
    objInfo.scale = .1;
    gl.bindTexture(gl.TEXTURE_2D, buffers.mercuryTexture);
    drawScene(gl, programInfo, buffers, buffers.mercuryTexture, objInfo);

    venusAngle += VENUS_ROTATION_SPEED;
    objInfo.angle = venusAngle;
    objInfo.xRadius = 6;
    objInfo.zRadius = 6;
    objInfo.deltaTime = deltaTime;
    objInfo.starName = 'Venus';
    objInfo.scale = .2;
    gl.bindTexture(gl.TEXTURE_2D, buffers.venusTexture);
    drawScene(gl, programInfo, buffers, buffers.venusTexture, objInfo);


    marsAngle += MARS_ROTATION_SPEED;
    objInfo.angle = marsAngle;
    objInfo.xRadius = 13;
    objInfo.zRadius = 12;
    objInfo.deltaTime = deltaTime;
    objInfo.scale = .3;
    objInfo.starName = 'Mars';
    gl.bindTexture(gl.TEXTURE_2D, buffers.marsTexture);
    drawScene(gl, programInfo, buffers, buffers.marsTexture, objInfo);

    earthAngle += EARTH_ROTATION_SPEED;
    objInfo.angle = earthAngle;
    objInfo.xRadius = 10;
    objInfo.zRadius = 10;
    objInfo.deltaTime = deltaTime;
    objInfo.scale = .4;
    objInfo.starName = 'Earth';
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    drawScene(gl, programInfo, buffers, earthTexture, objInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    console.log("inside onload image");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
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
  image.src = url;

  return texture;
}

function initBuffers(gl) {
  var vertices = [];

  var lat = 30,
      long = 30;

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

      if(i % 6 === 0) {
        r = Math.random();
        g = Math.random();
        b = Math.random();
      }
      vertices.push(r);
      vertices.push(g);
      vertices.push(b);

      vertices.push(x);
      vertices.push(y);
      vertices.push(z);

      let u = 1 - (j / long);
      let v = 1 - (i / lat);

      vertices.push(u);
      vertices.push(v);


    }
  }

  var indexCoord = [];

  for(let j = 0; j < lat; j++) {
    for(let i = 0; i < long; i++) {
      let first = j + i * (long + 1);
      let second = first + long + 1;

      indexCoord.push(first);
      indexCoord.push(second);
      indexCoord.push(first + 1);

      indexCoord.push(second);
      indexCoord.push(second + 1);
      indexCoord.push(first + 1);

    }
  }

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexCoord), gl.STREAM_DRAW);

  var sunTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, sunTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([253, 184, 19, 255]));

  var mercuryTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, mercuryTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([177, 173, 173, 255]));

  var venusTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, venusTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([193, 143, 23, 255]));

  var earthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, earthTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));

  var marsTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, marsTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([193, 68, 14, 255]));

  return {
    position: vertexBuffer,
    indices: indexBuffer,
    sunTexture: sunTexture,
    mercuryTexture: mercuryTexture,
    venusTexture: venusTexture,
    earthTexture: earthTexture,
    marsTexture: marsTexture,
  }

}

function drawScene(gl, programInfo, buffers, texture, objInfo) {

  const fieldOfView = glMatrix.toRadian(45);
  const aspectRation = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1.0;
  const zFar = 1000;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspectRation, zNear, zFar);

  var viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0.0, 50.0, 0.0], [0, -100.0, 0.0], [0, 0, 1]);

  var modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [0, 0, -150]);


  if(!(objInfo.starName === 'Sun')) {

    const x = centerX * Math.cos(objInfo.angle) * objInfo.xRadius;
    const z = centerY * -Math.sin(objInfo.angle) * objInfo.zRadius;

    mat4.translate(modelMatrix, modelMatrix, [x, z, 0]);
    // mat4.translate(modelMatrix, modelMatrix, [x, 0, z]);
    var v = objInfo.scale;
    mat4.scale(modelMatrix, modelMatrix, [v,v,v]);


  }

  // modelMatrix[0] *= v;
  // modelMatrix[5] *= v;
  // modelMatrix[10] *= v;

  const normalMatrix = mat4.create();
  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, modelMatrix, viewMatrix);
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  sphereRotation += objInfo.deltaTime;

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalized = false;
    const stride = FSIZE * 11;
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
    const stride = FSIZE * 11;
    const pointer = FSIZE * 6;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.a_Normal,
      numComponents, type, normalized, stride, pointer);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.a_Normal);
  }

  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalized = false;
    const stride = FSIZE * 11;
    const pointer = FSIZE * 9;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.a_Texture,
      numComponents, type, normalized, stride, pointer);
    gl.enableVertexAttribArray(
      programInfo.attribLocations.a_Texture);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ProjectionMatrix,
    false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_NormalMatrix,
    false, normalMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ModelMatrix,
    false, modelMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.u_ViewMatrix,
    false, viewMatrix);


    gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawElements(gl.TRIANGLES, 5400, gl.UNSIGNED_SHORT, 0);
}
