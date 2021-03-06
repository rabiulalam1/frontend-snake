const BG_COLOR = "#111111";
const SNAKE_COLOR_P1 = "#d724cc";
const SNAKE_COLOR_P2 = "#028701";
const FOOD_COLOR = "#e66916";

const socket = io("https://obscure-citadel-40924.herokuapp.com");
//("https://obscure-citadel-40924.herokuapp.com")
//("http://localhost:3000")

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleCantJoin);
socket.on("startTimer", handleStartTimer);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const scoreP1Display = document.getElementById("player1Score");
const scoreP2Display = document.getElementById("player2Score");

let result = new Audio();
result.src = "./result.mp3";
let eat = new Audio();
eat.src = "./eating.mp3";
let p1OldScore = 0;
let p2OldScore = 0;

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

let alanBtnInstance = alanBtn({
  key: "84a494ad8f539673a55f82ffc415d1e62e956eca572e1d8b807a3e2338fdd0dc/stage",
  onCommand: function (commandData) {
    if (commandData.command === "go-left") {
      socket.emit("keydown", "37");
    }

    if (commandData.command === "go-right") {
      socket.emit("keydown", "39");
    }

    if (commandData.command === "go-up") {
      socket.emit("keydown", "38");
    }

    if (commandData.command === "go-down") {
      socket.emit("keydown", "40");
    }
  },
  rootEl: document.getElementById("alan-btn"),
});

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

  scoreP1Display.innerText = state.players[0].score;
  if (state.players[0].score > p1OldScore) {
    eat.play();
    p1OldScore = state.players[0].score;
  }
  scoreP2Display.innerText = state.players[1].score;
  if (state.players[1].score > p2OldScore) {
    eat.play();
    p2OldScore = state.players[1].score;
  }
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
    result.play();
    swal({
      className: "win",
      title: "You Win!",
      button: "New Match",
    }).then((newMatch) => {
      location.reload();
    });
  } else {
    result.play();
    swal({
      className: "loose",
      title: "You Loose!",
      button: "New Match",
    }).then((newMatch) => {
      location.reload();
    });
  }
}

function handleGameCode(gameCode) {
  swal({
    className: "game-code",
    title: "Game Code",
    text: gameCode,
    button: "OK",
  });
}

function handleUnknownRoom() {
  swal({
    className: "warning",
    title: "Invalid Game Code !",
    button: "OK",
  }).then((OK) => {
    location.reload();
  });
}

function handleCantJoin() {
  swal({
    className: "warning",
    title: "Room is full !",
    button: "OK",
  }).then((OK) => {
    location.reload();
  });
}

//Starting game in 3 sec delay
function handleStartTimer() {
  swal({
    className: "instruction",
    text:
      "If you started the game you are PLAYER 1(Purple); If you joined the game you are PLAYER 2(Green). \n\nUse your keyboard arrows to move your snake. \n\nRace your opponent to grab 10 bites.\n\n Bon Appétit !!!",
    buttons: false,
    timer: 9500,
  });
}
