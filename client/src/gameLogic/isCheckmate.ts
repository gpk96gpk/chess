import { GameState, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';

function isCheckmate(gameState: GameState, playerNumber: number) {
  const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';

  if (!isCheck(gameState, currentPlayerColor)) {
    console.log('isCheckmateFalse99')
    return false; // Not in check, can't be checkmate
  }

  // Find the king's position
  let kingPosition: Position | null = null;
  console.log('playerNumberCheckMate', playerNumber)
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [i, j];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if the king can move to any safe square
  if (kingPosition) {
    const king: PieceType = gameState.board[kingPosition[0]][kingPosition[1]];
    const kingMoves = getMovesForPiece(king, kingPosition, gameState);

    // Check if any of the king's moves would result in a check
    for (const move of kingMoves) {
      const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));
      hypotheticalGameState.board[move[0]][move[1]] = king;
      hypotheticalGameState.board[kingPosition[0]][kingPosition[1]] = null;
      if (!isCheck(hypotheticalGameState, currentPlayerColor)) {
        return { isCheckmate: false, loser: null };
        // The king has at least one safe move, so it's not checkmate
      }
    }
  }
  
  console.log('isCheckmateTrue99')
  console.log('currentPlayerColor', currentPlayerColor)
  return { isInCheckmate: true, loser: currentPlayerColor } // If we've gotten this far, it's checkmate
}

export default isCheckmate;