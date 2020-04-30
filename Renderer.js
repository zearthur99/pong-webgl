export default class Renderer {

  initGL(){
    this.canvas = document.getElementById("gameCanvas");
    this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    this.gl.viewportWidth = this.canvas.width;
    this.gl.viewportHeight = this.canvas.height;
    console.log({width: this.gl.viewportWidth, height: this.gl.viewportHeight});
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
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    const modelViewMatrix = glMatrix.mat4.create();

    glMatrix.mat4.translate(modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -10.0]);

    this.gl.useProgram(this.programInfo.program);
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

    this.drawPaddles();
    this.drawBall();
  }

  drawPaddles() {
    // Left paddle
    this.setRectangle(-6.75, -0.75 + this.leftPaddle.getYPosition(), 0.15, 1.5); // Defines the rectangle to be draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
    // Right paddle
    this.setRectangle(6.60, -0.75  + this.rightPaddle.getYPosition(), 0.15, 1.5);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  drawBall() {
    //TODO: Mostrar a bola usando setRectangle e gl.drawArrays
  }

  setRectangle(x, y, width, height) {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    const positions = [
      x1,  y2,
      x2,  y2,
      x1, y1,
      x2, y1,
    ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    var numComponents = 2;          // 2 components per iteration
    var type = this.gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
  }

  setLeftPaddle(leftPaddle) {
    this.leftPaddle = leftPaddle;
  }

  setRightPaddle(rightPaddle) {
    this.rightPaddle = rightPaddle;
  }
}
