class Brick {
  constructor(canva, context, rows, columns, color) {
    this.canva = canva;
    this.context = context;
    this.rows = rows;
    this.columns = columns;
    this.color = color;

    this.bricks = [];
    this.size = canva.width / this.columns;
  }

  createBricks() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.bricks.push({
          x: this.size * j + 5,
          y: (this.size / 2) * i + 10,
        });
      }
    }
  }

  displayBricks() {
    this.bricks.forEach((b) => {
      this.context.fillStyle = this.color;
      this.context.fillRect(b.x, b.y, this.size / 1.3, this.size / 5);
    });
  }

  checkCollision(ball) {
    this.bricks = this.bricks.filter((brick) => {
      const ballX = ball.ballScale.x + ball.size;
      const ballY = ball.ballScale.y + ball.size;

      const hitX = ballX >= brick.x && ballX <= brick.x + this.size / 1.3;
      const hitY = ballY >= brick.y && ballY <= brick.y + this.size / 5;

      if (hitX && hitY) {
        ball.yVel = -ball.yVel;
        return false;
      }
      return true;
    });
  }
}

class Ball {
  constructor(canva, context, size, speed) {
    this.canva = canva;
    this.context = context;
    this.size = size;
    this.speed = speed;

    this.ballScale = {
      x: canva.width / 2,
      y: canva.height / 3,
    };
    this.xVel = speed;
    this.yVel = speed;
  }

  moveBall() {
    this.ballScale.x += this.xVel;
    this.ballScale.y += this.yVel;
  }

  displayBall() {
    this.context.fillStyle = "white";
    this.context.beginPath();
    this.context.arc(
      this.ballScale.x + this.size,
      this.ballScale.y + this.size,
      this.size,
      0,
      Math.PI * 2,
      false
    );
    this.context.fill();
  }

  wallDetection() {
    if (
      this.ballScale.x + this.size * 2 >= this.canva.width ||
      this.ballScale.x <= 0
    ) {
      this.xVel = -this.xVel;
    }
    if (this.ballScale.y <= 0) {
      this.yVel = -this.yVel;
    }
  }
}

class Paddle {
  constructor(canva, context, size, speed) {
    this.canva = canva;
    this.context = context;
    this.size = size;
    this.speed = speed;

    this.paddleScale = {
      x: canva.width / 2,
      y: canva.height - 10,
    };
  }

  displaySlide() {
    this.context.fillStyle = "white";
    this.context.fillRect(
      this.paddleScale.x,
      this.paddleScale.y,
      this.size,
      this.size / 2 - this.size / 3
    );
  }

  moveLeft() {
    this.paddleScale.x -= this.speed;
  }

  moveRight() {
    this.paddleScale.x += this.speed;
  }

  checkPaddle() {
    if (this.paddleScale.x <= 0) {
      this.paddleScale.x = 0;
    }
    if (this.paddleScale.x + this.size >= this.canva.width) {
      this.paddleScale.x = this.canva.width - this.size;
    }
  }
}

// Setup
const gameInterface = document.getElementById("game-interface");
gameInterface.height = 400;
gameInterface.width = 400;

const ctx = gameInterface.getContext("2d");
const keyPress = {
  left: false,
  right: false,
};

let score = 0;
let points = 0;
let highScore = localStorage.getItem("highScore") || 0;

const scoreCard = document.getElementById("score");
const highScoreCard = document.getElementById("high-score");
highScoreCard.innerHTML = `High Score : ${highScore}`;

let ball = new Ball(gameInterface, ctx, 7, 3);
let paddle = new Paddle(gameInterface, ctx, 70, 5);
let brick = new Brick(gameInterface, ctx, 4, 7, "gray");

brick.createBricks();

function gameLoop() {
  if (isGameOver()) {
    endGame("Game Over !");
    return;
  }
  if (brick.bricks.length === 0) {
    endGame("You Won !");
    return;
  }

  points += 1;
  if (points > 5) {
    score += 1;
    points = 0;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreCard.innerHTML = `High Score : ${highScore}`;
    }
  }

  scoreCard.innerHTML = `Score : ${score}`;

  clearBoard();
  brick.displayBricks();
  brick.checkCollision(ball);

  ball.wallDetection();
  ball.moveBall();
  paddleBallCollision();
  ball.displayBall();

  if (keyPress.left) paddle.moveLeft();
  if (keyPress.right) paddle.moveRight();
  paddle.checkPaddle();
  paddle.displaySlide();

  requestAnimationFrame(gameLoop);
}

function paddleBallCollision() {
  const ballBottom = ball.ballScale.y + ball.size;
  const paddleLeft = paddle.paddleScale.x;
  const paddleRight = paddleLeft + paddle.size;
  const paddleTop = paddle.paddleScale.y;

  const leftThird = paddleLeft + paddle.size / 3;
  const rightThird = paddleLeft + 2 * (paddle.size / 3);

  if (
    ballBottom >= paddleTop &&
    ball.ballScale.x + ball.size >= paddleLeft &&
    ball.ballScale.x - ball.size <= paddleRight
  ) {
    if (ball.ballScale.x < leftThird) {
      ball.xVel = -(ball.speed + 1);
    } else if (ball.ballScale.x > rightThird) {
      ball.xVel = ball.speed + 1;
    } else {
      ball.xVel = (Math.random() - 0.5) * 1.5;
    }

    if (keyPress.left) {
      ball.xVel -= 1;
    } else if (keyPress.right) {
      ball.xVel += 1;
    }

    ball.yVel = -(ball.speed + 1);
  }
}

function isGameOver() {
  return ball.ballScale.y >= gameInterface.height;
}

function endGame(text) {
  ctx.fillStyle = "white";
  ctx.font = "bold 50px serif";
  ctx.textAlign = "center";
  ctx.fillText(text, gameInterface.width / 2, gameInterface.height / 2);
}

function resetHighScore() {
  localStorage.removeItem("highScore");
  highScore = 0;
  highScoreCard.innerHTML = `High Score : ${highScore}`;
}

function clearBoard() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, gameInterface.width, gameInterface.height);
}

// Input Events
window.addEventListener("keydown", (e) => {
  if (e.keyCode === 37) keyPress.left = true;
  if (e.keyCode === 39) keyPress.right = true;
});

window.addEventListener("keyup", (e) => {
  if (e.keyCode === 37) keyPress.left = false;
  if (e.keyCode === 39) keyPress.right = false;
});

// control for Mobile
const leftTouchZone = document.getElementById("left-touch");
const rightTouchZone = document.getElementById("right-touch");

leftTouchZone.addEventListener("touchstart", () => (keyPress.left = true));
leftTouchZone.addEventListener("touchend", () => (keyPress.left = false));

rightTouchZone.addEventListener("touchstart", () => (keyPress.right = true));
rightTouchZone.addEventListener("touchend", () => (keyPress.right = false));

gameLoop();
