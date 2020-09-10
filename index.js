const BG_COLOR = "#231f20";
const SNAKE_COLOR_P1 = "#c2c2c2";
const SNAKE_COLOR_P2 = "#00adb5";
const FOOD_COLOR = "#e66916";

const socket = io("https://obscure-citadel-40924.herokuapp.com");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownRoom", handleUnknownRoom);
socket.on("cantjoin", handleCantJoin);
socket.on("startTimer", handleStartTimer);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameButton.addEventListener("click", newGame);
joinGameButton.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let canvas, ctx, playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOR_P1);
  paintPlayer(state.players[1], size, SNAKE_COLOR_P2);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;
  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) return;
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => {
    paintGame(gameState);
  });
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert("You Win!");
  } else {
    alert("You Lose, needs to eat more cookie");
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownRoom() {
  reset();
  alert("Unknown Game Code");
}

function handleCantJoin() {
  reset();
  alert("This room is full, plaese create new game");
}

//Starting game in 3 sec delay
function handleStartTimer() {
  let timer = 2;
  let int = setInterval(() => {
    timer--;
    if (timer == 0) {
      clearInterval(int);
    }
  }, 1000);
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
