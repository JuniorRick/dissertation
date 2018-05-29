
main();

var count = 0;



function main() {

  var vertexSource = `
    attribute vec3 a_Position;
    attribute vec3 a_Color;
    uniform mat4 u_ProjMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    varying vec3 v_Color;
    void main() {
      // convert the rectangle from pixels to 0.0 to 1.0
      vec3 zeroToOne = a_Position / vec3(800, 600, 500);

       // convert from 0->1 to 0->2
       vec3 zeroToTwo = zeroToOne * 2.0;

       // convert from 0->2 to -1->+1 (clipspace)
       vec3 clipSpace = zeroToTwo - 1.0;

       gl_Position = u_ProjMatrix * u_ViewMatrix  * u_ModelMatrix * vec4(clipSpace * vec3(1, -1, 1), 1);
       gl_PointSize = 1.0;
       v_Color = a_Color;
    }
  `;

  var fragmentSource = `
  precision mediump float;

  varying vec3 v_Color;

    void main() {
      gl_FragColor = vec4(v_Color, 1.0);
    }
  `;

  var canvas = document.querySelector('#webgl');
  var gl = canvas.getContext('webgl');

  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;

  gl.viewport(0, 0, width, height)
  var terrainBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainBuffer);

  var terrainVertices = [[]];

  const scale = 2.0;
  const rows = canvas.width / scale;
  const cols = canvas.height / scale;

  var i = 0;
  var t = 50;
  for(let y = 0; y < cols; y++ ) {
    for (let x = 0; x < rows; x++) {
      terrainVertices[i++] = [
        x, y,
        noise(x / cols, y / rows, 0.1) * 200,
        // Math.random() * 200,
      ];
    }
  }

  var vertices = [];


  for(let y = 0; y < cols - 1; y++ ) {
    for (let x = 0; x < rows - 1; x++) {
      vertices.push(terrainVertices[y * rows + x][0]);
      vertices.push(terrainVertices[y * rows + x][1]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);

      vertices.push(terrainVertices[(y + 1) * rows + x][0]);
      vertices.push(terrainVertices[(y + 1) * rows + x][1]);
      vertices.push(terrainVertices[(y + 1) * rows + x][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x][2]);

      vertices.push(terrainVertices[(y + 1) * rows + x + 1][0]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][1]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);

      vertices.push(terrainVertices[y * rows + x][0]);
      vertices.push(terrainVertices[y * rows + x][1]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);
      vertices.push(terrainVertices[y * rows + x][2]);

      vertices.push(terrainVertices[(y + 1) * rows + x + 1][0]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][1]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);
      vertices.push(terrainVertices[(y + 1) * rows + x + 1][2]);

      vertices.push(terrainVertices[y * rows + x + 1][0]);
      vertices.push(terrainVertices[y * rows + x + 1][1]);
      vertices.push(terrainVertices[y * rows + x + 1][2]);
      vertices.push(terrainVertices[y * rows + x + 1][2]);
      vertices.push(terrainVertices[y * rows + x + 1][2]);
      vertices.push(terrainVertices[y * rows + x + 1][2]);
    }
  }

  count = vertices.length / 6;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var program = initShaderProgram(gl, vertexSource, fragmentSource);

  gl.useProgram(program);

  var a_Position = gl.getAttribLocation(program, 'a_Position');
  var a_Color = gl.getAttribLocation(program, 'a_Color');

  var FSIZE = Float32Array.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false,  FSIZE * 6,  FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  var u_ProjMatrix = gl.getUniformLocation(program, 'u_ProjMatrix');
  var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');

  var projMatrix = mat4.create();
  var  fieldOfView = glMatrix.toRadian(45);
  var aspect = canvas.width / canvas.height;
  mat4.perspective(projMatrix, fieldOfView, aspect, 0.01, 100);


  var viewMatrix= mat4.create();

  mat4.lookAt(viewMatrix, [0, 0, 3], [0, 0, -80], [0, 1, 0]);

  gl.clearColor(0.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

  var modelMatrix= mat4.create();
  mat4.translate(modelMatrix,     // destination matrix
    modelMatrix,     // matrix to translate
    [-1.0, 0.0, 0.0]);

    mat4.rotate(modelMatrix, modelMatrix, glMatrix.toRadian(-60), [1,0,0])

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);


    gl.clear(gl.COLOR_BUFFER_BIT |  gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, count);


}



var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var moonRotationMatrix = mat4.create();
mat4.identity(moonRotationMatrix);

function noise(x, y, z) {

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];

      var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
          Y = Math.floor(y) & 255,                  // CONTAINS POINT.
          Z = Math.floor(z) & 255;
      x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
      y -= Math.floor(y);                                // OF POINT IN CUBE.
      z -= Math.floor(z);
      var u = fade(x),                                // COMPUTE FADE CURVES
             v = fade(y),                                // FOR EACH OF X,Y,Z.
             w = fade(z);
      var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,

      return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                     grad(p[BA  ], x-1, y  , z   )), // BLENDED
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                     grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                     grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 ))));
   }

   function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
   function lerp(t, a, b) { return a + t * (b - a); }
   function grad(hash, x, y, z) {
      var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
             v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
   }

   // for (let i=0; i < 256 ; i++) {
   //   p[256+i] = p[i] = permutation[i];
   // }
