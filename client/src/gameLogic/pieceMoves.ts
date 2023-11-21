function getMovesForPiece(piece, position, gameState) {
    switch (piece.type) {
        case 'pawn':
            return getPawnMoves(piece, position, gameState);
        case 'rook':
            return getRookMoves(piece, position, gameState);
        case 'knight':
            return getKnightMoves(piece, position, gameState);
        case 'bishop':
            return getBishopMoves(piece, position, gameState);
        case 'queen':
            return getQueenMoves(piece, position, gameState);
        case 'king':
            return getKingMoves(piece, position, gameState);
        default:
            return [];
    }
}

function getPawnMoves(piece, position, gameState) {
        const moves = [];
    
        // Pawns can move forward one square, if it's not occupied
        const forward = { x: position.x, y: piece.color === 'white' ? position.y + 1 : position.y - 1 };
        if (!gameState[forward.y][forward.x]) {
            moves.push(forward);
        }
    
        // If it's the pawn's first move, it can move forward two squares
        if (!piece.hasMoved) {
            const forwardTwo = { x: position.x, y: piece.color === 'white' ? position.y + 2 : position.y - 2 };
            if (!gameState[forward.y][forward.x] && !gameState[forwardTwo.y][forwardTwo.x]) {
                moves.push(forwardTwo);
            }
        }
    
        // Pawns capture diagonally
        const leftCapture = { x: position.x - 1, y: piece.color === 'white' ? position.y + 1 : position.y - 1 };
        const rightCapture = { x: position.x + 1, y: piece.color === 'white' ? position.y + 1 : position.y - 1 };
        if (gameState[leftCapture.y][leftCapture.x] && gameState[leftCapture.y][leftCapture.x].color !== piece.color) {
            moves.push(leftCapture);
        }
        if (gameState[rightCapture.y][rightCapture.x] && gameState[rightCapture.y][rightCapture.x].color !== piece.color) {
            moves.push(rightCapture);
        }
    
        return moves;
}

function getRookMoves(piece, position, gameState) {
    const moves = [];

    // Directions: up, down, left, right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position.x + i * dx;
            const y = position.y + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            // If square is occupied
            if (gameState[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState[y][x].color !== piece.color) {
                    moves.push({ x, y });
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            moves.push({ x, y });
        }
    }

    return moves;
}

function getKnightMoves(piece, position, gameState) {
    const moves = [];

    // Knight move directions
    const directions = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dx, dy] of directions) {
        const x = position.x + dx;
        const y = position.y + dy;

        // Continue if off board
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            continue;
        }

        // If square is occupied by own piece, continue
        if (gameState[y][x] && gameState[y][x].color === piece.color) {
            continue;
        }

        // If square is not occupied or occupied by opponent's piece, it's a valid move
        moves.push({ x, y });
    }

    return moves;
}

function getBishopMoves(piece, position, gameState) {
    const moves = [];

    // Directions: up-left, up-right, down-left, down-right
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position.x + i * dx;
            const y = position.y + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            // If square is occupied
            if (gameState[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState[y][x].color !== piece.color) {
                    moves.push({ x, y });
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            moves.push({ x, y });
        }
    }

    return moves;
}

function getQueenMoves(piece, position, gameState) {
    const moves = [];

    // Directions: up, down, left, right, up-left, up-right, down-left, down-right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position.x + i * dx;
            const y = position.y + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            // If square is occupied
            if (gameState[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState[y][x].color !== piece.color) {
                    moves.push({ x, y });
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            moves.push({ x, y });
        }
    }

    return moves;
}

function getKingMoves(piece, position, gameState) {
    const moves = [];

    // King move directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        const x = position.x + dx;
        const y = position.y + dy;

        // Continue if off board
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            continue;
        }

        // If square is occupied by own piece, continue
        if (gameState[y][x] && gameState[y][x].color === piece.color) {
            continue;
        }

        // If square is not occupied or occupied by opponent's piece, it's a valid move
        moves.push({ x, y });
    }

    return moves;
}

export default getMovesForPiece;