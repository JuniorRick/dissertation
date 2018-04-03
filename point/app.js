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

    void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 20.0;
    }
  `;

  var fragmentSource = `

    void main() {
      gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
  `;

  var program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  gl.useProgram(program);

  var then = 0;
  function render(now) {
    now *= 0.001;
    var deltaTime = then - now;
    then = now;

    resizing();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


})(window || this);
