import isCheck from './isCheck';
import { getMovesForPiece } from './getMovesForPiece';

function isCheckmate(gameState, playerNumber) {
  if (!isCheck(gameState, playerNumber)) {
    return false; // Not in check, can't be checkmate
  }

  // Check if the king can move to any safe square
  const kingPosition = getKingPosition(gameState, playerNumber);
  const kingMoves = getMovesForPiece({ type: 'king', color: 'dummy' }, kingPosition, gameState, playerNumber);

  return kingMoves.length === 0;
}

export default isCheckmate;