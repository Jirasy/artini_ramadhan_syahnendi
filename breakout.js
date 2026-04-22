const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let paddle, ball, bricks, keys;
let gameRunning = false;
let score = 0;
const brickRowCount = 4;
const brickColumnCount = 8;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Resize canvas sesuai device
function resizeCanvas() {
  canvas.width = window.innerWidth > 700 ? 600 : window.innerWidth - 40;
  canvas.height = window.innerHeight > 500 ? 400 : window.innerHeight - 100;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Deteksi device
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Start game
function startGame() {
  const paddleColor = document.getElementById("paddleColor").value;
  const ballColor = document.getElementById("ballColor").value;

  paddle = {
    x: canvas.width/2 - 40,
    y: canvas.height - 20,
    width: 80,
    height: 9,
    speed: 8,
    vx: 0,
    color: paddleColor
  };

  ball = {
    x: canvas.width/2,
    y: canvas.height - 30,
    radius: 8,
    dx: 3,
    dy: -3,
    color: ballColor
  };

  bricks = [];
  for(let c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
      bricks[c][r] = { x:0, y:0, status:1 };
    }
  }

  keys = {};
  score = 0;

  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("controls").style.display = "block";

  if (isMobile()) {
    document.querySelector(".controls").style.display = "block";
  } else {
    document.querySelector(".controls").style.display = "none";
  }

  gameRunning = true;
}

// Event listeners (PC)
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (!gameRunning) return;
  if (e.key === "ArrowLeft") { paddle.vx = -paddle.speed; }
  if (e.key === "ArrowRight") { paddle.vx = paddle.speed; }
});
document.addEventListener("keyup", e => {
  keys[e.key] = false;
  paddle.vx = 0;
});

// Virtual controls (HP)
function move(direction) {
  if (!gameRunning) return;
  if (direction === "LEFT") paddle.vx = -paddle.speed;
  if (direction === "RIGHT") paddle.vx = paddle.speed;
}

// Swipe gesture (HP)
let touchStartX = null;
canvas.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", e => {
  if (!touchStartX) return;
  let touchX = e.touches[0].clientX;
  if (touchX < touchStartX) paddle.vx = -paddle.speed;
  else paddle.vx = paddle.speed;
});
canvas.addEventListener("touchend", () => {
  paddle.vx = 0;
  touchStartX = null;
});

// Draw paddle
function drawPaddle() {
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

// Draw bricks
function drawBricks() {
  for(let c=0; c<brickColumnCount; c++) {
    for(let r=0; r<brickRowCount; r++) {
      if(bricks[c][r].status === 1) {
        let brickX = (c*(brickWidth+brickPadding)) + brickOffsetLeft;
        let brickY = (r*(brickHeight+brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.fillStyle = "cyan";
        ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

// Collision detection
function collisionDetection() {
  for(let c=0; c<brickColumnCount; c++) {
    for(let r=0; r<brickRowCount; r++) {
      let b = bricks[c][r];
      if(b.status === 1) {
        if(ball.x > b.x && ball.x < b.x+brickWidth &&
           ball.y > b.y && ball.y < b.y+brickHeight) {
          ball.dy = -ball.dy;
          b.status = 0;
          score++;
        }
      }
    }
  }
}

// Update game state
function update() {
  paddle.x += paddle.vx;

  // Paddle stop di tepi
  if (paddle.x <= 0) {
    paddle.x = 0;
    paddle.vx = 0;
  }
  if (paddle.x + paddle.width >= canvas.width) {
    paddle.x = canvas.width - paddle.width;
    paddle.vx = 0;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Pantulan dinding
  if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if(ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Pantulan paddle
  if(ball.y + ball.radius > paddle.y &&
     ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
    ball.dy = -ball.dy;
  }

  // Game over
  if(ball.y + ball.radius > canvas.height) {
    endGame("Game Over! Skor: " + score);
  }

  collisionDetection();
}

// Draw everything
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (!gameRunning) return;

  drawBricks();
  drawPaddle();
  drawBall();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// End game
function endGame(message) {
  alert(message);
  gameRunning = false;

  canvas.style.display = "none";
  document.getElementById("controls").style.display = "none";
  document.querySelector(".controls").style.display = "none";
  document.getElementById("menu").style.display = "block";
}

// Game loop
function gameLoop() {
  if (gameRunning) {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();