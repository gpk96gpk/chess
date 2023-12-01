import { GameState, Position, Piece as PieceType, Move } from '../types/clientTypes';
import getMovesForPiece from './pieceMoves';

function isCheck(gameState: GameState, playerNumber: number): boolean {
  let kingPosition: Position | null = null;
  const currentPlayerColor = playerNumber === 1 ? 'white' : 'black';

  // Find the king's position
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [j, i];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if any opponent's piece can attack the king
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.color !== currentPlayerColor) {
      //   const moves: Move[] = getMovesForPiece(piece, [j, i], gameState);
      //   if (kingPosition !== null) {
      //     const [kingX, kingY] = kingPosition;
      //     if (moves.some(move => move.to[0] === kingX && move.to[1] === kingY)) {
      //         return true;
      //     }
      // }
      }
    }
  }

  return false;
}

export default isCheck;