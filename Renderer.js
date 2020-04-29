export default class Renderer {

  initGL(){
    this.first = 0;
    this.canvas = document.getElementById("gameCanvas");
    this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    this.gl.viewportWidth = this.canvas.width;
    this.gl.viewportHeight = this.canvas.height;
    this.resolution = [this.canvas.width, this.canvas.height, 1.0];

    if (!this.gl) {
      alert("OpenGL could not be initialized");
    }

    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

    const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

    const shaderProgram = this.initShaderProgram(vsSource, fsSource);
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };

    this.buffers = this.initBuffers();
    this.buffers2 = this.initBuffers2();

  }

  initBuffers() {
    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      -1.0,  1.0,
      1.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  }

  initBuffers2() {
    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      -4.0,  3.0,
      -3.0,  3.0,
      -2.0, -2.0,
      1.0, -1.0,
    ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  }

  initShaderProgram(vsSource, fsSource) {
    const vertexShader = this.loadShader(this.gl, this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(this.gl, this.gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  drawScene() {
    this.first += 0.1;
    if (this.first > 0.9) {
      this.first = 0;
    }
    this.gl.clearColor(Math.random(), 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = glMatrix.mat4.create();

    // note: this.glmatrix.js always has the first argument
    // as the destination to receive the result.
    glMatrix.mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = glMatrix.mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    glMatrix.mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [-0.0, 0.0, -6.0]);  // amount to translate

    // Tell Webthis.gl how to pull out the positions from the position
    // buffer into the vertexPosition attribute.


    // Tell Webthis.gl to use our program when drawing

    this.gl.useProgram(this.programInfo.program);

    // Set the shader uniforms

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

    {
      const offset = 0;
      const vertexCount = 4;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
      {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        this.gl.vertexAttribPointer(
          this.programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
      }
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers2.position);
      {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        this.gl.vertexAttribPointer(
          this.programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
      }
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
}
