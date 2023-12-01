import { GameState } from "../types/clientTypes";
import getMovesForPiece from "./pieceMoves";

function isStalemate(gameState: GameState, playerNumber: number) {
    const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
    for (let i = 0; i < gameState.board.length; i++) {
        for (let j = 0; j < gameState.board[i].length; j++) {
            const piece = gameState.board[i][j];
            if (piece && piece.color === currentPlayerColor) {
                // const moves = getMovesForPiece(piece, [i,j], gameState);
                // if (moves && moves.length > 0) {
                //     return false; // There's a legal move for this color, not stalemate
                // }
            }
        }
    }
    // If we've gone through all pieces for the current player and found no legal moves, it's a stalemate
    return true;
}

export default isStalemate;