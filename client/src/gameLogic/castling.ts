function castling(piece, position, gameState, playerNumber) {
    // Castling can only be done if the king has not moved and the rook has not moved
    if (piece.type !== 'king' || piece.hasMoved) {
        return null;
    }

    const rookPositions = playerNumber === 1 ? [[0, 0], [7, 0]] : [[0, 7], [7, 7]];
    const castlingMoves = [];

    for (let [x, y] of rookPositions) {
        const rook = gameState[y][x];
        if (rook && rook.type === 'rook' && !rook.hasMoved) {
            // Check if there are no pieces between the king and the rook
            const direction = x === 0 ? -1 : 1;
            let canCastle = true;
            for (let i = position.x + direction; i !== x; i += direction) {
                if (gameState[position.y][i]) {
                    canCastle = false;
                    break;
                }
            }

            if (canCastle) {
                // The king moves two squares towards the rook
                castlingMoves.push({ x: position.x + 2 * direction, y: position.y });
            }
        }
    }

    return castlingMoves.length > 0 ? castlingMoves : null;
}

export default castling;