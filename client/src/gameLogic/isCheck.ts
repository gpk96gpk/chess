import { GameState, Position, Piece as PieceType, Move } from '../types/clientTypes';
import isCheckmate from './isCheckmate';
import getMovesForPiece from './pieceMoves';

interface CheckResult {
  isKingInCheck: boolean;
  isKingInCheckmate: boolean;
  loser: string;
}
function isCheck(gameState: GameState, playerNumber): CheckResult {
  if (!gameState || !playerNumber) {
      return false;
  }

  const currentPlayerColor = playerNumber === 2 ? 'white' : 'black';

  const pieces = gameState.board.flat().map((piece, index) => ({ piece, position: [Math.floor(index / 8), index % 8] as Position }));
  const king = pieces.find(({ piece }) => piece && piece.type === 'king' && piece.color === currentPlayerColor);
  const kingPosition = king ? king.position : null;

  // Store the valid moves for each piece in a map
  const validMovesMap = new Map();

  const isKingInCheck = pieces.some(({ piece, position }) => {
    if (piece && piece.type !== 'empty' && piece.color !== currentPlayerColor) {
        const moves = validMovesMap.get(piece) || getMovesForPiece(piece, position, gameState);
        validMovesMap.set(piece, moves);
        return moves.some(move => {
            if (!move || !kingPosition) {
                return false;
            }
            return move[0] === kingPosition[0] && move[1] === kingPosition[1];
        });
    }
    return false;
});

  const isCheckmateResult = isCheckmate(gameState, kingPosition, currentPlayerColor);
  const isKingInCheckMate = isCheckmateResult.isInCheckmate;
  if (isCheckmateResult.isInCheckmate) {
      console.log('King is in checkmate.');
  } else {
      console.log('King is in check but not in checkmate.');
  }

  return { isKingInCheck, isKingInCheckMate, loser: currentPlayerColor };
}

export default isCheck;