import { GameState } from "../types/clientTypes";
import getMovesForPiece from "./pieceMoves";

function isStalemate( gameState: GameState, playerNumber: number) {
    if (playerNumber === 0) {
        return false;
    }
    const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
    console.log('Checking if game is in stalemate for player color:', currentPlayerColor);
    console.log('isStalematePropsCheck', gameState, playerNumber)
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const piece = gameState.board[y][x];
            if (piece && piece.color === currentPlayerColor) {
                console.log('Found piece of current player at position:', [y, x]);
                const moves = getMovesForPiece(piece, [y, x], gameState);
                console.log('Moves for piece at position:', [y, x], moves);
                // If moves is not an empty array, return false immediately
                if (moves && moves.length > 0) {
                    console.log('Found legal move for piece at position:', [y, x], 'Not a stalemate');
                    return false; // There's a legal move for this color, not stalemate
                }
            }
        }
    }
    // If we've gone through all pieces for the current player and found no legal moves, it's a stalemate
    console.log('No legal moves found for current player. It is a stalemate');
    return true;
}

export default isStalemate;