import Renderer from "./Renderer.js";

export default class Game {

  initGame() {
    this.renderer = new Renderer();
    this.renderer.initGL();
    setInterval(() => {
      this.renderer.drawScene();
      this.processTick();
    }, 1000 / 2);
  }

  processTick () {

  }

}
