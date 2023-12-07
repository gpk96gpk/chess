//isValidMove
//check if piece is in the way of another piece
//check if piece is moving in valid direction
//check if piece is moving to a valid tile
//check if piece is moving to a tile that is not occupied by a piece of the same color
//check if piece is moving to a tile that is occupied by a piece of the opposite color
// check if piece is moving to a tile that is occupied by a piece of the opposite color 
//and if so remove that piece from the board
//check for check and checkmate**
//check for en passant**
//if check is true then checkmate needs to be checked
//check if pawn is at the end of the board and if so promote to queen
//check for victory condition
//check for stalemate
//check for draw
//check if piece is moving to a tile that is occupied by a King piece of the opposite color
//
import enPassant from '../gameLogic/enPassant'
import getMovesForPiece from './pieceMoves';
import { GameState, Move, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import getCastlingMove from '../gameLogic/castling';



function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number) {
  console.log('validMoves', piece, position, gameState, playerNumber);
  let moves: Move[] = [];
  const normalMoves = getMovesForPiece(piece, position, gameState);
  if (normalMoves) {
      moves = moves.concat(normalMoves);
      console.log('moves', moves);
  }
  
  if (piece && piece.type === 'pawn') {
      const enPassantMove = enPassant(piece, position, gameState, playerNumber);
      if (enPassantMove) {
          moves = moves.concat([enPassantMove]);
      }
  }
  
  if (moves && piece && piece.type === 'king') {
    if (!piece.hasMoved && 
      ((gameState.board[0][0].type === 'rook' && !gameState.board[0][0].hasMoved && gameState.board[7][0].type === 'rook' && !gameState.board[7][0].hasMoved) ||
      (gameState.board[0][7].type === 'rook' && !gameState.board[0][7].hasMoved && gameState.board[7][7].type === 'rook' && !gameState.board[7][7].hasMoved)) ) {
        
        const castlingMove = getCastlingMove(piece, position, gameState, playerNumber) || [];
        if (castlingMove) {
          moves = moves.concat([castlingMove]);
        }
    }
      
    moves = moves.filter(newPosition => {
        if (!newPosition) {
            return false;
        }
        const tempGameState = JSON.parse(JSON.stringify(gameState));
        tempGameState.board[piece.position[0]][piece.position[1]] = null;
        console.log('tempGameState', tempGameState.board[piece.position[0]][piece.position[1]]);
        if (newPosition[0] >= 0 && newPosition[0] < tempGameState.board.length &&
            newPosition[1] >= 0 && newPosition[1] < tempGameState.board[0].length) {
          tempGameState.board[newPosition[0]][newPosition[1]] = piece;

          return !isCheck(tempGameState, playerNumber);
        }

        return false;
    });
  }
  
  return moves;
}

export default validMoves