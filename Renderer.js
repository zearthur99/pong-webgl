export default class Renderer {

  initGL(){
    this.amountOfPoints = 1;
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
    this.drawBezier();
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
    this.setRectangle(this.ball.getPosition().x, this.ball.getPosition().y, 0.15, 0.15); // Defines the rectangle to be draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
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
    let numComponents = 2;
    let type = this.gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
  }

  setLine(x1, y1, x2, y2) {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      x1,  y1,
      x2,  y2,
    ];

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    let numComponents = 2;
    let type = this.gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
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

  setBall (ball) {
    this.ball = ball;
  }

  getpoint(p, t) {
    let result1 = 0;
    let result2 = 0;
    let n = p.length-1;

    console.log(p);

    for(let i = 0; i < p.length; i++){

      if(i === 0 || i === n){
        console.log(1)
        result1 = result1 + Math.pow((1-t), (n - i)) * Math.pow(t, i) * p[i].x;
        result2 = result2 + Math.pow((1-t), (n - i)) * Math.pow(t, i) * p[i].y;
      }else{
        console.log(2)
        result1 = result1 + Math.pow((1-t), (n - i)) * (Math.pow(t, i) * n)* p[i].x;
        result2 = result2 + Math.pow((1-t), (n - i)) * (Math.pow(t, i) * n) * p[i].y;
      }

    }
    return {x: result1, y: result2}

  }


  drawBezier() {
    if (this.amountOfPoints < 100) {
      this.amountOfPoints += 0.05;
    }
    let ctrlP = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 0},
      {x: 3, y: 1}
    ];
    let t, t1;
    let roundedAmountOfPoints = Math.round(this.amountOfPoints);

    for (let i = 0; i < roundedAmountOfPoints; i++) {
      t = i / roundedAmountOfPoints;
      t1 = (i + 1) / roundedAmountOfPoints;
      let {x: px1, y: py1} = this.getpoint(ctrlP, t);
      let {x: px2, y: py2} = this.getpoint(ctrlP, t1);
      this.setLine(px1,py1,px2,py2);
      this.gl.drawArrays(this.gl.LINE_STRIP, 0, 2);
    }
  }
}
