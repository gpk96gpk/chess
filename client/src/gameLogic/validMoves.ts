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
import { getMovesForPiece } from './pieceMoves';



function validMoves(piece, position, gameState, playerNumber) {
    let moves = [];

    const normalMoves = getMovesForPiece(piece, position, gameState);
    moves = moves.concat(normalMoves);

    if (piece.type === 'pawn') {
        const enPassantMove = enPassant(piece, position, gameState, playerNumber);
        if (enPassantMove) {
            moves.push(enPassantMove);
        }
    }

    if (piece.type === 'king') {
        const castlingMoves = castling(piece, position, gameState, playerNumber);
        if (castlingMoves) {
            moves = moves.concat(castlingMoves);
        }
    }

    return moves;
}

export default validMoves