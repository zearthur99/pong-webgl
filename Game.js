import Renderer from "./Renderer.js";
import Paddle from "./Paddle.js";
import Ball from "./Ball.js";

export default class Game {



  initGame() {
    this.leftScore = 0;
    this.rightScore = 0;

    this.renderer = new Renderer();
    this.renderer.initGL();
    let game = this;

    this.leftPaddle = new Paddle();
    this.leftPaddle.initPaddle('left');

    this.renderer.setLeftPaddle(this.leftPaddle);

    this.rightPaddle = new Paddle();
    this.rightPaddle.initPaddle('right');

    this.renderer.setRightPaddle(this.rightPaddle);

    this.ball = new Ball();
    this.ball.initBall();
    this.ball.setLeftPaddle(this.leftPaddle);
    this.ball.setRightPaddle(this.rightPaddle);
    this.ball.setGameReference(this);
    this.renderer.setBall(this.ball);

    this.gameLoop = setInterval(() => {
      game.processTick();
    }, 1000 /60);
  }

  processTick () {
    this.processLogic();
    this.renderer.drawScene();
  }

  processLogic() {
    this.leftPaddle.processGameTick();
    this.rightPaddle.processGameTick();
    this.ball.processGameTick();
  }

  addRightScore () {
    this.leftScore++;
    this.checkEndOfGame();
  }

  addLeftScore() {
    this.rightScore++;
    this.checkEndOfGame();
  }

  checkEndOfGame() {
    document.getElementById('rightScore').innerHTML = this.rightScore;
    document.getElementById('leftScore').innerHTML = this.leftScore;
    if (this.leftScore > 4 || this.rightScore > 4) {
      document.getElementById('gameOver').style.display = 'block';
      clearInterval(this.gameLoop);
    }
  }
}
