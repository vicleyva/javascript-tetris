// Initialize constants
const BLOCK_SIZE = 20
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const PIECES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1, 1],
    [0, 1, 0]
  ], // T
  [
    [1, 1, 1],
    [1, 0, 0]
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1]
  ], // J
  [
    [0, 1, 1],
    [1, 1, 0]
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1]
  ], // Z
  [
    [1, 1],
    [1, 1]
  ] // O
]

// Define game state variables
let canvas, context, board, currentPiece, dropCounter, lastTime

// Initialize the game
function init () {
  canvas = document.querySelector('canvas')
  context = canvas.getContext('2d')
  canvas.width = BLOCK_SIZE * BOARD_WIDTH
  canvas.height = BLOCK_SIZE * BOARD_HEIGHT
  context.scale(BLOCK_SIZE, BLOCK_SIZE)
  reset()
  dropCounter = 0
  lastTime = 0
  requestAnimationFrame(update)
}

// Reset the game state
function reset () {
  board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
  currentPiece = generateRandomPiece()
}

// Generate a random tetromino piece
function generateRandomPiece () {
  const pieceIndex = Math.floor(Math.random() * PIECES.length)
  return {
    shape: PIECES[pieceIndex],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
  }
}

// Update the game state
function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime

  // Move the piece down
  if (dropCounter > 1000) {
    movePieceDown()
  }

  draw()
  requestAnimationFrame(update)
}

// Draw the game board and current piece
function draw () {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  drawBoard()
  drawPiece(currentPiece)
}

// Draw the game board
function drawBoard () {
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })
}

// Draw a tetromino piece
function drawPiece (piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red'
        context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1)
      }
    })
  })
}

// Move the current piece down
function movePieceDown () {
  currentPiece.position.y++

  // Check for collisions
  if (checkCollision()) {
    currentPiece.position.y--
    solidifyPiece()
    removeCompletedRows()
    reset()
  }

  dropCounter = 0
}

// Check for collisions between the current piece and the game board
function checkCollision () {
  return currentPiece.shape.some((row, y) => {
    return row.some((value, x) => {
      if (value !== 0) {
        const boardX = currentPiece.position.x + x
        const boardY = currentPiece.position.y + y
        return (
          boardY >= BOARD_HEIGHT ||
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          board[boardY]?.[boardX] !== 0
        )
      }
      return false
    })
  })
}

// Solidify the current piece onto the game board
function solidifyPiece () {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardX = currentPiece.position.x + x
        const boardY = currentPiece.position.y + y
        board[boardY][boardX] = value
      }
    })
  })
}

// Remove completed rows from the game board
function removeCompletedRows () {
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(value => value !== 0)) {
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      y++
    }
  }
}

// Handle keyboard input
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':
      movePieceHorizontal(-1)
      break
    case 'ArrowRight':
      movePieceHorizontal(1)
      break
    case 'ArrowDown':
      movePieceDown()
      break
    case 'ArrowUp':
      rotatePiece()
      break
  }
})

// Move the current piece horizontally
function movePieceHorizontal (direction) {
  currentPiece.position.x += direction
  if (checkCollision()) {
    currentPiece.position.x -= direction
  }
}

// Rotate the current piece
function rotatePiece () {
  const originalShape = currentPiece.shape
  currentPiece.shape = currentPiece.shape[0].map((_, index) =>
    currentPiece.shape.map(row => row[index]).reverse()
  )
  if (checkCollision()) {
    currentPiece.shape = originalShape
  }
}

// Start the game
init()
