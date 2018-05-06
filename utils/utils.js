

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


  function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // textura generata 1x1 de culoare pixel
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
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);


      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    image.crossOrigin = "";
    image.src = url;

    return texture;
  }

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  
  return {
    getCanvas: getCanvas,
    getContext: getContext,
    initShaderProgram: initShaderProgram,
    loadTexture: loadTexture,
  };
}();
