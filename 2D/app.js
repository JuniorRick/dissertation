
window.onload = main();
var width = 0,
    height = 0;
function main() {

  var canvas = webGlUtils.getCanvas("#webgl");

  var gl = webGlUtils.getContext(canvas);
  if(!gl) {
    console.log("Unable to initialize webgl context");
    return;
  }

  var vertexSource = `
    attribute vec2 a_Position;

    void main() {
      gl_Position = vec4(a_Position, 0.0, 1.0);
    }
  `;

  var fragmentSource = `

    void main() {
      gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
  `;

  var program = webGlUtils.initShaderProgram(gl, vertexSource, fragmentSource);

  gl.useProgram(program);

  const programInfo = {
    program: program,
    attributes: {
      a_Position: gl.getAttribLocation(program, 'a_Position'),
    },
  }
  // const buffers = quad(gl);
  const buffers = donut(gl);

  window.addEventListener('resize', resize);

  function resize() {
    render();
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  function render() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    draw(gl, buffers, programInfo);
  }

  render();
}


function draw(gl, buffers, programInfo) {
"use strict";

gl.vertexAttribPointer(programInfo.attributes.a_Position,
   2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(programInfo.attributes.a_Position);
// gl.drawArrays(gl.TRIANGLES, 0, buffers.vertices_length);
gl.drawElements(gl.TRIANGLES, buffers.indices_length, gl.UNSIGNED_SHORT, 0);
}
