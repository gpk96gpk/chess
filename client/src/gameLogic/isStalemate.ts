import { GameStateType, Position } from "../types/clientTypes";
import getMovesForPiece from "./pieceMoves";

function isStalemate(gameState: GameStateType, playerNumber: number) {
    if (playerNumber === 0) {
        return false;
    }
    const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
    console.log('Checking if game is in stalemate for player color:', currentPlayerColor);
    console.log('isStalematePropsCheck', gameState, playerNumber);

    const pieces = gameState.board.flat().map((piece, index) => ({ piece, position: [Math.floor(index / 8), index % 8] as Position }));
    const currentPlayerPieces = pieces.filter(({ piece }) => piece && piece.color === currentPlayerColor);

    const hasLegalMove = currentPlayerPieces.some(({ piece, position }) => {
        console.log('Found piece of current player at position:', position);
        const moves = getMovesForPiece(piece, position, gameState);
        console.log('Moves for piece at position:', position, moves);
        return moves && moves.length > 0;
    });

    console.log(hasLegalMove ? 'Found legal move for piece. Not a stalemate' : 'No legal moves found for current player. It is a stalemate');
    return !hasLegalMove;
}

export default isStalemate;