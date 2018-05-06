

webGlUtils = function () {

  var getCanvas = function(selector) {
      var canvas = document.querySelector(selector);

      if(canvas.getContext) {
        return canvas;
      }

      return null;
  };

  var getContext = function(canvas) {

    var names = ["webgl2", "webgl", "experimental-web"];
    var context = null;
    for(let  i = 0; i < names.length; i++) {
      try {
        context = canvas.getContext(names[i]);
        return context;
      } catch(e) {}
      if(context) break;
    }

    return context;
  };

  var initShaderProgram = function (gl, vertexSource, fragmentSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
      return program;
    }

      console.log("Error linking program: " + gl.getProgramInfoLog(program));
      return null;
  };

  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) {
      return shader;
    }

    console.log("shader compilation error: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return {
    getCanvas: getCanvas,
    getContext: getContext,
    initShaderProgram: initShaderProgram,
  };
}();
