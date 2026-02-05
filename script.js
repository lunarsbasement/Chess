const board = document.getElementById("board");

const pieceImages = {
  r: "pieces/black_rook.png",
  n: "pieces/black_knight.png",
  b: "pieces/black_bishop.png",
  q: "pieces/black_queen.png",
  k: "pieces/black_king.png",
  p: "pieces/black_pawn.png",
  R: "pieces/white_rook.png",
  N: "pieces/white_knight.png",
  B: "pieces/white_bishop.png",
  Q: "pieces/white_queen.png",
  K: "pieces/white_king.png",
  P: "pieces/white_pawn.png"
};

let game = [
  "rnbqkbnr",
  "pppppppp",
  "........",
  "........",
  "........",
  "........",
  "PPPPPPPP",
  "RNBQKBNR"
];

let selected = null;
let turn = "white";

function drawBoard() {
  board.innerHTML = "";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement("div");
      square.classList.add("square", (r + c) % 2 === 0 ? "light" : "dark");
      square.dataset.row = r;
      square.dataset.col = c;

      const piece = game[r][c];
      if (piece !== ".") {
        const img = document.createElement("img");
        img.src = pieceImages[piece];
        img.classList.add("piece");
        square.appendChild(img);
      }

      square.addEventListener("click", () => onSquareClick(r, c));
      board.appendChild(square);

      // Check if black king is gone → player wins
      if (isKingCaptured("black")) {
      showWin();
      }

    }
  }
}

function onSquareClick(r, c) {
  if (turn !== "white") return;

  const piece = game[r][c];

  if (selected) {
    if (isLegalMove(selected.r, selected.c, r, c)) {
      movePiece(selected.r, selected.c, r, c);
      selected = null;
      drawBoard();
      setTimeout(aiMove, 400);
      return;
    }
    selected = null;
    drawBoard();
  }

  if (piece !== "." && isWhite(piece)) {
    selected = { r, c };
    highlightMoves(r, c);
  }
}

function movePiece(fr, fc, tr, tc) {
  let boardArr = game.map(r => r.split(""));
  boardArr[tr][tc] = boardArr[fr][fc];
  boardArr[fr][fc] = ".";
  game = boardArr.map(r => r.join(""));
  turn = turn === "white" ? "black" : "white";
}

function isWhite(p) { return p === p.toUpperCase(); }
function isBlack(p) { return p === p.toLowerCase(); }

function highlightMoves(r, c) {
  drawBoard();
  for (let tr = 0; tr < 8; tr++) {
    for (let tc = 0; tc < 8; tc++) {
      if (isLegalMove(r, c, tr, tc)) {
        board.children[tr * 8 + tc].classList.add("highlight");
      }
    }
  }
}

function isLegalMove(fr, fc, tr, tc) {
  if (fr === tr && fc === tc) return false;

  const piece = game[fr][fc];
  const target = game[tr][tc];

  if (target !== "." && isWhite(piece) === isWhite(target)) return false;

  const dr = tr - fr;
  const dc = tc - fc;

  switch (piece.toLowerCase()) {

    case "p": {
      const dir = isWhite(piece) ? -1 : 1;
      const startRow = isWhite(piece) ? 6 : 1;

      if (dc === 0 && target === "." && dr === dir) return true;
      if (dc === 0 && fr === startRow && dr === 2 * dir && game[fr + dir][fc] === "." && target === ".") return true;
      if (Math.abs(dc) === 1 && dr === dir && target !== ".") return true;
      return false;
    }

    case "r":
      return straightClear(fr, fc, tr, tc);

    case "b":
      return diagonalClear(fr, fc, tr, tc);

    case "q":
      return straightClear(fr, fc, tr, tc) || diagonalClear(fr, fc, tr, tc);

    case "n":
      return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

    case "k":
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  return false;
}

function straightClear(fr, fc, tr, tc) {
  if (fr !== tr && fc !== tc) return false;
  const stepR = Math.sign(tr - fr);
  const stepC = Math.sign(tc - fc);
  let r = fr + stepR;
  let c = fc + stepC;
  while (r !== tr || c !== tc) {
    if (game[r][c] !== ".") return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function diagonalClear(fr, fc, tr, tc) {
  if (Math.abs(tr - fr) !== Math.abs(tc - fc)) return false;
  const stepR = Math.sign(tr - fr);
  const stepC = Math.sign(tc - fc);
  let r = fr + stepR;
  let c = fc + stepC;
  while (r !== tr) {
    if (game[r][c] !== ".") return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function findKing(color) {
  const kingChar = color === "white" ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (game[r][c] === kingChar) {
        return { r, c };
      }
    }
  }
  return null;
}

function isKingCaptured(color) {
  return findKing(color) === null;
}

function showWin() {
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.textContent = "💖";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2500);
  }

  const msg = document.createElement("div");
  msg.id = "win-message";
  msg.innerHTML = "You won the game just like you had won my heart ♟️💖<br>Happy Valentine’s Day!";
  document.body.appendChild(msg);
}

function aiMove() {
  let moves = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game[r][c];
      if (piece !== "." && isBlack(piece)) {
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (isLegalMove(r, c, tr, tc)) {
              moves.push({ fr: r, fc: c, tr, tc });
            }
          }
        }
      }
    }
  }

  if (moves.length === 0) return;

  const move = moves[Math.floor(Math.random() * moves.length)];
  movePiece(move.fr, move.fc, move.tr, move.tc);
  drawBoard();
}

drawBoard();
