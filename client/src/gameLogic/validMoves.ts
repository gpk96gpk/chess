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
import castling from '../gameLogic/castling'
import getMovesForPiece from './pieceMoves';
import { GameState, Move, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';



function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number) {
    let moves: Move[] = [];
    console.log('validMovesPropsCheck', piece, position, gameState, playerNumber);
    const normalMoves = getMovesForPiece(piece, position, gameState);
    if (normalMoves) {
        moves = moves.concat(normalMoves);
        console.log('MovesConcat', moves);
    }
    
    if (piece && piece.type === 'pawn') {
        console.log('enPassantPropsCheck!!!', piece, position, gameState, playerNumber);
        const enPassantMove = enPassant(piece, position, gameState, playerNumber);
        if (enPassantMove) {
            moves.concat([enPassantMove]);
        }
        console.log('enPassantMove!!!', enPassantMove);
    }
    
    if (moves && piece && piece.type === 'king') {
        // If the piece has not moved, check for castling
        if (!piece.hasMoved) {
          const castlingMove = castling(piece, position, gameState, playerNumber) || [];
          if (castlingMove) {
            moves = moves.concat([castlingMove]);
          }
          console.log('castlingMove', castlingMove);
        }
      
        // Filter out moves that would put the king in check
        moves = moves.filter(newPosition => {
          const tempGameState = JSON.parse(JSON.stringify(gameState)); // Create a copy of the game state
          tempGameState.board[piece.position[0]][piece.position[1]] = null; // Remove the king from its current position
      
          // Check if newPosition is within the bounds of the board
          if (newPosition[0] >= 0 && newPosition[0] < tempGameState.board.length &&
              newPosition[1] >= 0 && newPosition[1] < tempGameState.board[0].length) {
            tempGameState.board[newPosition[0]][newPosition[1]] = piece; // Place the king at the new position
      
            return !isCheck(tempGameState, piece.color); // If the new position is in check, the move is not valid
          }
      
          return false;
        });
      }
    
    console.log('validMoveMoves', moves)
    return moves;
}

export default validMoves