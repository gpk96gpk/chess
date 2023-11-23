import { getMovesForPiece } from './getMovesForPiece';

function isCheck(gameState, playerNumber) {
  let kingPosition = null;
  const currentPlayerColor = playerNumber === 1 ? 'white' : 'black';

  // Find the king's position
  for (let i = 0; i < gameState.length; i++) {
    for (let j = 0; j < gameState[i].length; j++) {
      const piece = gameState[i][j];
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = { x: j, y: i };
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if any opponent's piece can attack the king
  for (let i = 0; i < gameState.length; i++) {
    for (let j = 0; j < gameState[i].length; j++) {
      const piece = gameState[i][j];
      if (piece && piece.color !== currentPlayerColor) {
        const moves = getMovesForPiece(piece, { x: j, y: i }, gameState);
        if (moves.some(([x, y]) => x === kingPosition.x && y === kingPosition.y)) {
          return true;
        }
      }
    }
  }

  return false;
}

export default isCheck;