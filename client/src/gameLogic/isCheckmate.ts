import { GameState, Piece, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';

function isCheckmate(gameState: GameState, playerNumber: number): boolean {
  if (!isCheck(gameState, playerNumber)) {
    return false; // Not in check, can't be checkmate
  }

  // Find the king's position
  let kingPosition: Position | null = null;
  const currentPlayerColor = playerNumber === 1 ? 'white' : 'black';
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: Piece | null = gameState.board[i][j];
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [j, i];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if the king can move to any safe square
  if (kingPosition) {
    const king: Piece = {
      position: kingPosition,
      type: 'king', 
      color: currentPlayerColor,
      hasMoved: false, // This is a placeholder. You should replace this with the actual value.
      isHighlighted: false // This is a placeholder. You should replace this with the actual value.
    };
    const kingMoves = getMovesForPiece(king, kingPosition, gameState);

    return Boolean(kingMoves && kingMoves.length === 0);
  }

  return false;
}

export default isCheckmate;