function enPassant(piece, position, gameState, playerNumber) {
    // Check if the piece is a pawn
    if (piece.type !== 'pawn') {
        return null;
    }

    // Check if the last move was a pawn moving two squares
    const lastMove = gameState.history[gameState.history.length - 1];
    if (!lastMove || lastMove.piece.type !== 'pawn' || Math.abs(lastMove.from.y - lastMove.to.y) !== 2) {
        return null;
    }

    // Check if the current piece is a pawn on its fifth rank
    const rank = playerNumber === 1 ? 4 : 3;
    if (position.y !== rank) {
        return null;
    }

    const file = position.x;
    if (lastMove.to.x !== file - 1 && lastMove.to.x !== file + 1) {
        return null;
    }

    // Return the position where the pawn would move to perform the en passant capture
    return { x: lastMove.to.x, y: playerNumber === 1 ? rank + 1 : rank - 1 };
}

export default enPassant;