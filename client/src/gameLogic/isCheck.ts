import { GameState, Position, Piece as PieceType, Move } from '../types/clientTypes';
import isCheckmate from './isCheckmate';
import getMovesForPiece from './pieceMoves';

interface CheckResult {
  isKingInCheck: boolean;
  isKingInCheckmate: boolean;
  loser: string;
}

function isCheck(gameState: GameState): CheckResult {
  if (!gameState || !gameState.turn) {
    console.log('Game state or turn state is null or undefined');
    return false;
  }

  let kingPosition: Position | null = null;
  const currentPlayerColor = gameState.turn === 'black' ? 'white' : 'black';  
  let isKingInCheck, isKingInCheckMate = false;
  console.log('isInCheckPropsCheck', gameState, currentPlayerColor);

  // Iterate over the board
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece: PieceType | null = gameState.board[i][j];

      // Find the king's position
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [i, j];
        console.log('isInCheckKingPosition', kingPosition);
      }

      // Check if any opponent's piece can attack the king
      if (piece && piece.type !== 'empty' && piece.color !== currentPlayerColor) {
        const moves: Move[] = getMovesForPiece(piece, [i, j], gameState);
        console.log('isInCheckMoves', moves);
        if (kingPosition !== null) {
          const [kingX, kingY] = kingPosition;
          if (moves && moves.some(move => move && move[0] === kingX && move[1] === kingY)) {
            isKingInCheck = true;
            break;
          }
        }
      }
    }
    
    if (isKingInCheck) {
      console.log('King is in check. Checking for checkmate...');
      console.log('isInCheckKingPosition', kingPosition);
      const isCheckmateResult = isCheckmate(gameState, kingPosition, currentPlayerColor);
      isKingInCheckMate = isCheckmateResult.isInCheckmate;
      if (isCheckmateResult.isInCheckmate) {
        console.log('King is in checkmate.');
      } else {
        console.log('King is in check but not in checkmate.');
      }
    }  }
  console.log('isInCheckKing or checkmate', isKingInCheck, isKingInCheckMate);
  return {isKingInCheck, isKingInCheckMate, loser : currentPlayerColor};
}

export default isCheck;