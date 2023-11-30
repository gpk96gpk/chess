import { GameState, Move, Position } from "../types/clientTypes";

function enPassant(piece: { type: string; color: 'white' | 'black'; }, position: Position, gameState: GameState, playerNumber: number) {
    // Check if the piece is a pawn
    if (!gameState || !gameState.history) {
        return null;
    }
    if (piece.type !== 'pawn') {
        return null;
    }

    // Check if the last move was a pawn moving two squares
    const lastMove: Move = gameState.history[gameState.history.length - 1];
    if (!lastMove || typeof lastMove === 'string' || lastMove.piece.type !== 'pawn' || Math.abs(lastMove.from[1] - lastMove.to[1]) !== 2) {
        return null;
    }

    // Check if the current piece is a pawn on its fifth rank
    const rank = playerNumber === 1 ? 4 : 3;
    if (position[1] !== rank) {
        return null;
    }

    const file = position[0];
    if (lastMove.to[0] !== file - 1 && lastMove.to[0] !== file + 1) {
        return null;
    }

    // Modify the gameState to reflect the en passant capture
    const to: Position = [lastMove.to[0], playerNumber === 1 ? rank + 1 : rank - 1] as Position;
    const move: Move = {
        piece,
        from: position,
        to,
        board: gameState.board,
        turn: piece.color,
        turnNumber: lastMove.turnNumber + 1
    };
    // Add any additional modifications to gameState here

    return move;
}

export default enPassant;