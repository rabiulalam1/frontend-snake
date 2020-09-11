const BG_COLOR = "#231f20";
const SNAKE_COLOR_P1 = "#c2c2c2";
const SNAKE_COLOR_P2 = "#00adb5";
const FOOD_COLOR = "#e66916";

const socket = io("http://localhost:3000");
//("https://obscure-citadel-40924.herokuapp.com")
//("http://localhost:3000")

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
const codeDisplayHeader = document.getElementById("codeDisplayHeader");
const scoreP1Display = document.getElementById("player1Score");
const scoreP2Display = document.getElementById("player2Score");

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

  codeDisplayHeader.style.display = "none";
  scoreP1Display.innerText = state.players[0].score;
  scoreP2Display.innerText = state.players[1].score;
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
    swal({
      title: "You Win!",
      text: "Like to play again?",
      icon: "success",
      button: "New Match",
    }).then((newMatch) => {
      reset();
    });
  } else {
    swal({
      title: "You Loose!",
      text: "Like to play again?",
      icon: "error",
      button: "New Match",
    }).then((newMatch) => {
      reset();
    });
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
  swal("Bon Appétit!", {
    buttons: false,
    timer: 3000,
  });
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
