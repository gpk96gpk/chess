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



function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number) {
    let moves: Move[] = [];
    console.log('validMovesPropsCheck', piece, position, gameState, playerNumber);
    const normalMoves = getMovesForPiece(piece, position, gameState);
    if (normalMoves) {
        moves = moves.concat(normalMoves);
        console.log('MovesConcat', moves);
    }
    
    if (piece && piece.type === 'pawn') {
        const enPassantMove = enPassant(piece, position, gameState, playerNumber);
        if (enPassantMove) {
            moves.push(enPassantMove);
        }
        console.log('enPassantMove', enPassantMove);
    }
    
    if (piece && piece.type === 'king') {
        const castlingMove = castling(piece, position, gameState, playerNumber) || [];
        if (castlingMove) {
            moves = moves.concat(castlingMove);
        }
        console.log('castlingMove', castlingMove);
    }
    
    console.log('validMoveMoves', moves)
    return moves;
}

export default validMoves