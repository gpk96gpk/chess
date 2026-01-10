import { GameStateType, Position } from "../types/clientTypes";
import getMovesForPiece from "./pieceMoves";

function isStalemate(gameState: GameStateType, playerNumber: number) {
    if (playerNumber === 0) {
        return false;
    }
    const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';

    const pieces = gameState.board.flat().map((piece, index) => ({ piece, position: [Math.floor(index / 8), index % 8] as Position }));
    const currentPlayerPieces = pieces.filter(({ piece }) => piece && piece.color === currentPlayerColor);

    const hasLegalMove = currentPlayerPieces.some(({ piece, position }) => {
        const moves = getMovesForPiece(piece, position, gameState);
        return moves && moves.length > 0;
    });
    return !hasLegalMove;
}

export default isStalemate;