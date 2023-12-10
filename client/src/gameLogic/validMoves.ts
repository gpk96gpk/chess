import { PieceType, Position, Move } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
import getCastlingMove from './castling';
import enPassant from './enPassant';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';

function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number, lastPosition) {
  console.log('302validMoves piece', piece, 'position', position, 'gameState', gameState, 'playerNumber', playerNumber);
  let moves: Move[] = [];
  let threateningSquares;

  const addMoveIfValid = (newPosition: Position) => {
    if (!newPosition) {
      return;
    }
    
    const tempGameState = JSON.parse(JSON.stringify(gameState));
    tempGameState.board[position[0]][position[1]] = null;
    if (newPosition[0] >= 0 && newPosition[0] < tempGameState.board.length &&
      newPosition[1] >= 0 && newPosition[1] < tempGameState.board[0].length) {
      tempGameState.board[newPosition[0]][newPosition[1]] = piece;
      console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn);
      console.log('843piece.type', piece.type, '843piece.position', piece.position);
      if (piece.type !== 'king') {
        threateningSquares = calculateThreateningSquares(tempGameState.kingPositions[tempGameState.turn], tempGameState, position);
      } else {
        threateningSquares = calculateThreateningSquares(lastPosition, tempGameState, position);
      }
      console.log('843threateningSquares', threateningSquares);
      if (playerNumber === 2 && piece.color === 'white' || playerNumber === 1 && piece.color === 'black' ) {
        tempGameState.threateningPiecesPositions[piece.color] = threateningSquares;
      }
      console.log('766tempGameState.threateningPiecesPositions', tempGameState);
      const checkPosition = piece.type === 'king' ? lastPosition : position;
      if (!isCheck(tempGameState, threateningSquares, playerNumber, checkPosition).isKingInCheck) {
          moves.push(newPosition);
      }
    }
  };

  const normalMoves = getMovesForPiece(piece, position, gameState);
  console.log('normalMoves', normalMoves);
  if (normalMoves) {
    normalMoves.forEach(addMoveIfValid);
  }

  if (piece && piece.type === 'pawn') {
    const enPassantMove = enPassant(piece, position, gameState, playerNumber);
    if (enPassantMove) {
      addMoveIfValid(enPassantMove);
    }
  }

  if (piece && piece.type === 'king') {
    if (!piece.hasMoved &&
      ((gameState.board[0][0].type === 'rook' && !gameState.board[0][0].hasMoved && gameState.board[7][0].type === 'rook' && !gameState.board[7][0].hasMoved) ||
        (gameState.board[0][7].type === 'rook' && !gameState.board[0][7].hasMoved && gameState.board[7][7].type === 'rook' && !gameState.board[7][7].hasMoved))) {

      const castlingMove = getCastlingMove(piece, position, gameState, playerNumber) || [];
      if (castlingMove && Array.isArray(castlingMove[0])) {
        addMoveIfValid(castlingMove);
      }
    }
  }

  return {
    moves,
    threateningSquares
  };
}

export default validMoves;