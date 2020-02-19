/**
 * @param {number[][]} board
 * @param {number[]} position
 * @return {number[][]}
 */
export function getPossibleSteps (board, position, shuffle = false) {
  const possibleSteps = [
    [position[0] - 3, position[1]],
    [position[0] + 3, position[1]],
    [position[0], position[1] - 3],
    [position[0], position[1] + 3],
    [position[0] - 2, position[1] - 2],
    [position[0] + 2, position[1] + 2],
    [position[0] + 2, position[1] - 2],
    [position[0] - 2, position[1] + 2]
  ]

  if (shuffle) {
    // shuffle steps for tour solution to be more interesting
    for (let i = possibleSteps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleSteps[i], possibleSteps[j]] = [possibleSteps[j], possibleSteps[i]]
    }
  }

  // filter out all steps that go beyond the board
  return possibleSteps.filter(step => {
    const boardSize = board.length
    return step[0] >= 0 && step[1] >= 0 && step[0] < boardSize && step[1] < boardSize
  })
}

/**
 * @param {number[][]} board
 * @param {number[]} step
 * @return {boolean}
 */
function isMoveAllowed (board, step) {
  return board[step[0]][step[1]] !== 1
}

/**
 * @param {number[][]} board
 * @param {number[][]} steps
 * @return {boolean}
 */
function isBoardCompletelyVisited (board, steps) {
  const totalPossibleStepsCount = board.length ** 2
  const existingStepsCount = steps.length

  return totalPossibleStepsCount === existingStepsCount
}

/**
 * @param {number[][]} board
 * @param {number} level
 * @param {number[][]} steps
 * @return {boolean}
 */
function tourRecursive (board, level, steps) {
  // check if number of steps for level is reached or if board is completely visited
  if (level === steps.length - 1 || isBoardCompletelyVisited(board, steps)) {
    return true
  }

  // get next possible steps
  const lastStep = steps[steps.length - 1]
  const possibleSteps = getPossibleSteps(board, lastStep, true)

  // try to do next possible moves
  for (let step of possibleSteps) {
    // check if current move is allowed
    // we aren't allowed to go to the same cells twice
    if (isMoveAllowed(board, step)) {
      steps.push(step)
      board[step[0]][step[1]] = 1
  
      if (tourRecursive(board, level, steps)) {
        return true
      }
    }
  }

  return false
}

/**
 * @param {number} boardSize
 * @param {number} level
 * @param {number[][]} firstStep
 * @return {number[][]}
 */
export function calculateTour (boardSize, level, firstStep) {
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))

  const steps = []

  steps.push(firstStep)
  board[firstStep[0]][firstStep[1]] = 1

  const solutionWasFound = tourRecursive(board, level, steps)

  return solutionWasFound ? steps : []
}
