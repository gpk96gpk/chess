import { getKingPosition } from './getKingPosition';
import { getMovesForPiece } from './getMovesForPiece';

function isCheck(gameState, playerNumber) {
  const kingPosition = getKingPosition(gameState, playerNumber);

  // Check if any opponent's piece can attack the king
  for (let i = 0; i < gameState.length; i++) {
    for (let j = 0; j < gameState[i].length; j++) {
      const piece = gameState[i][j];
      if (piece && piece.color !== (playerNumber === 1 ? 'white' : 'black')) {
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