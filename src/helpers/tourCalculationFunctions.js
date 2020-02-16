/**
 * @param {number[][]} board
 * @param {number[]} position
 * @return {number[][]}
 */
export function getPossibleSteps (board, position) {
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

  // Filter out all steps that go beyond the board.
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
function isMoveAllowed(board, step) {
  return board[step[0]][step[1]] !== 1
}

/**
 * @param {number[][]} board
 * @param {number[][]} steps
 * @return {boolean}
 */
function isBoardCompletelyVisited(board, steps) {
  const totalPossibleStepsCount = board.length ** 2
  const existingStepsCount = steps.length

  return totalPossibleStepsCount === existingStepsCount
}

/**
 * @param {number[][]} board
 * @param {number[][]} steps
 * @return {boolean}
 */
function tourRecursive(board, steps) {
  const currentBoard = board

  if (isBoardCompletelyVisited(currentBoard, steps)) {
    return true
  }

  // Get next possible steps.
  const lastStep = steps[steps.length - 1]
  const possibleSteps = getPossibleSteps(currentBoard, lastStep)

  // Try to do next possible moves.
  for (let stepIndex = 0; stepIndex < possibleSteps.length; stepIndex += 1) {
    const currentStep = possibleSteps[stepIndex]

    // Check if current move is allowed. We aren't allowed to go to
    // the same cells twice.
    if (isMoveAllowed(currentBoard, currentStep)) {
      steps.push(currentStep)
      currentBoard[currentStep[0]][currentStep[1]] = 1

      // If further moves starting from current are successful then
      // return true meaning the solution is found.
      if (tourRecursive(currentBoard, steps)) {
        return true
      }

      // BACKTRACKING.
      // If current move was unsuccessful then step back and try to do another move.
      steps.pop()
      currentBoard[currentStep[0]][currentStep[1]] = 0
    }
  }

  return false
}

/**
 * @param {number} boardSize
 * @param {number[][]} firstStep
 * @return {number[][]}
 */
export function calculateTour(boardSize, firstStep) {
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))

  const steps = []

  steps.push(firstStep)
  board[firstStep[0]][firstStep[1]] = 1

  const solutionWasFound = tourRecursive(board, steps)

  return solutionWasFound ? steps : []
}
