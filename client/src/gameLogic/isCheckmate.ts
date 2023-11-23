import isCheck from './isCheck';
import { getMovesForPiece } from './getMovesForPiece';

function isCheckmate(gameState, playerNumber) {
  if (!isCheck(gameState, playerNumber)) {
    return false; // Not in check, can't be checkmate
  }

  // Find the king's position
  let kingPosition = null;
  const currentPlayerColor = playerNumber === 1 ? 'white' : 'black';
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

  // Check if the king can move to any safe square
  const kingMoves = getMovesForPiece({ type: 'king', color: currentPlayerColor }, kingPosition, gameState);

  return kingMoves.length === 0;
}

export default isCheckmate;