import { GameState, Position, Piece as PieceType, Move } from '../types/clientTypes';
import getMovesForPiece from './pieceMoves';

function isCheck(gameState: GameState, playerNumber: number): boolean {
  let kingPosition: Position | null = null;
  const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';

  // Find the king's position
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      console.log('ischeckKingPiece', piece)
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [i, j];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Check if any opponent's piece can attack the king
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      console.log('ischeckOpponentPiece', piece)
      if (piece && piece.type !== 'empty' && piece.color !== currentPlayerColor) {
        const moves: Move[] = getMovesForPiece(piece, [i, j], gameState);
        console.log('ischeckMoves', moves)
        if (kingPosition !== null) {
          const [kingX, kingY] = kingPosition;
          console.log('ischeckkingX', kingX)
          console.log('ischeckkingY', kingY)
          console.log('ischeckkingPosition', kingPosition)
          if (moves && moves.some(move => move && move[0] === kingX && move[1] === kingY)) {
            console.log('ischeckTrue99')
            return true;
          }
        }
      }
    }
  }

  return false;
}

export default isCheck;