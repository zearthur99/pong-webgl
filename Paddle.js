export default class Paddle {

  maxYDistance = 3.5;

  initPaddle(player) {
    this.y=0; // 0 represents middle of the screen
    this.player = player;

    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      if (this.checkKeys(player, 'up', keyName)) {
        this.direction='up';
      } else if (this.checkKeys(player, 'down', keyName)) {
        this.direction='down';
      }
    });
    document.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if (player === 'left' && (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S')) {
        this.direction=undefined;
      } else if (player === 'right' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        this.direction=undefined;
      }
    });
  }

  checkKeys (player, testDirection, key) {
    if (player === 'left' && testDirection === 'up' && (key === 'w' || key === 'W')) {
      return true;
    } else if (player === 'left' && testDirection === 'down' && (key === 's' || key === 'S')) {
      return true;
    } else if (player === 'right' && testDirection === 'up' && (key === 'ArrowUp')) {
      return true;
    } else if (player === 'right' && testDirection === 'down' && (key === 'ArrowDown')) {
      return true;
    }
  }

  getYPosition() {
    return this.y;
  }

  processGameTick() {
    if (this.direction === 'up') {
      let newY = this.y + 0.05;
      if (this.checkCollision(newY)) {
        this.y = newY;
      }
    } else if (this.direction === 'down') {
      let newY = this.y - 0.05;
      if (this.checkCollision(newY)) {
        this.y = newY;
      }
    }
  }

  getCollisionBox() {
    let screenY = this.y + 0.75;
    if (this.player === 'left') {
      return {
        minY: screenY - 1.5,
        maxY: screenY,
        x: -6.6
      }
    } else if (this.player === 'right') {
      return {
        minY: screenY - 1.5,
        maxY: screenY,
        x: 6.6
      }
    }
  }

  checkCollision (newY) {
    if (newY < this.maxYDistance && newY > -this.maxYDistance) {
      return true;
    }
  }

}
