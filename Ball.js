export default class Ball {

  initBall() {
    this.maxYDistance = 4.2;
    this.minYDistance = -4.2;
    this.maxXDistance = 7;
    this.minXDistance = -7;
    this.xIncrementPerTick = 0;
    this.yIncrementPerTick = 0;
    this.posX=0;
    this.posY=0;
    // 0 represents middle of the screen
    let inverseX = Math.random() >= 0.5;
    let inverseY = Math.random() >= 0.5;
    this.xIncrementPerTick = (Math.random() * (0.06 - 0.04) + 0.04) * (inverseX ? -1 : 1);
    this.yIncrementPerTick = (Math.random() * (0.04 - 0.03) + 0.03) * (inverseX ? -1 : 1);
  }

  getPosition() {
    return {x: this.posX, y: this.posY};
  }

  processGameTick() {
    let newPosX = this.posX + this.xIncrementPerTick;
    let newPosY = this.posY + this.yIncrementPerTick;
    // Check screen borders and paddles
    this.processCollision(newPosX, newPosY);
    this.posX = this.posX + this.xIncrementPerTick;
    this.posY = this.posY + this.yIncrementPerTick;
    // Check paddles
  }

  processCollision (newPosX, newPosY) {
    if (newPosX > this.maxXDistance) {
      this.game.addLeftScore();
      this.initBall();
    }
    if (newPosX < this.minXDistance) {
      this.game.addRightScore();
      this.initBall();
    }

    if (newPosX < this.leftPaddle.getCollisionBox().x && (newPosY >= this.leftPaddle.getCollisionBox().minY && newPosY <= this.leftPaddle.getCollisionBox().maxY)) {
      this.xIncrementPerTick *= -1;
    }
    if (newPosX > this.rightPaddle.getCollisionBox().x && (newPosY >= this.rightPaddle.getCollisionBox().minY && newPosY <= this.rightPaddle.getCollisionBox().maxY)) {
      this.xIncrementPerTick *= -1;
    }
    
    if (newPosY < this.minYDistance || newPosY > this.maxYDistance) {
      this.yIncrementPerTick *= -1;
    }
    if (newPosX < this.minXDistance || newPosX > this.maxXDistance) {
      this.xIncrementPerTick *= -1;
    }
  }

  setLeftPaddle(leftPaddle) {
    this.leftPaddle = leftPaddle;
  }

  setRightPaddle(rightPaddle) {
    this.rightPaddle = rightPaddle;
  }

  setGameReference(game) {
    this.game = game;
  }
}
