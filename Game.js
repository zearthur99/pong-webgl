import Renderer from "./Renderer.js";
import Paddle from "./Paddle.js";

export default class Game {

  initGame() {
    this.renderer = new Renderer();
    this.renderer.initGL();
    let game = this;

    this.leftPaddle = new Paddle();
    this.leftPaddle.initPaddle('left');

    this.renderer.setLeftPaddle(this.leftPaddle);

    this.rightPaddle = new Paddle();
    this.rightPaddle.initPaddle('right');

    this.renderer.setRightPaddle(this.rightPaddle);

    setInterval(() => {
      game.processTick();
    }, 1000 / 60);
  }

  processTick () {
    this.processLogic();
    this.renderer.drawScene();
  }

  processLogic() {
    this.leftPaddle.processGameTick();
    this.rightPaddle.processGameTick();
  }
}
