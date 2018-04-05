var vertices = [];
(function(global) {

  var canvas = webGlUtils.getCanvas('#webgl');
  var gl = webGlUtils.getContext(canvas);

function resizing() {
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;

  gl.viewport(0, 0, width, height);
}

window.addEventListener('resize', resizing);



  var vertexSource = `
    attribute vec3 a_Position;

    void main() {
      gl_Position = vec4(a_Position, 1.0);
      gl_PointSize = 20.0;
    }
  `;

  var fragmentSource = `

    void main() {
      gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
  `;

  var program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  vertices = [
      0.5, 0.5, 0.0,
      -0.5, 0.5, 0.0,
      0.0, -0.5, 0.0,
  ];
  var counter = 3;

  canvas.addEventListener('mousedown', function(event) {
    vertices.push((event.clientX / canvas.width - 0.5) * 2);
    vertices.push((event.clientY / canvas.height - 0.5) * -2);
    vertices.push(0.0);
    counter++;
  });

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var then = 0;
  function render(now) {
    now *= 0.001;
    var deltaTime = then - now;
    then = now;

    resizing();

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.useProgram(program);

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, counter);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


})(window || this);
