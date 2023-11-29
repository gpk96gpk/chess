import { Position, Piece, GameState, Move } from "../types/clientTypes";

function getMovesForPiece(piece: Piece, position: Position, gameState: GameState): Move[] {
    switch (piece?.type) {
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

function getPawnMoves(piece: {type: string, color: 'white' | 'black'}, position: Position, gameState: GameState){
    const moves: Move[] = [];

    // Pawns can move forward one square, if it's not occupied
    const forward: Position = [position[0], piece.color === 'white' ? position[1] + 1 : position[1] - 1];
    if (!gameState.board[forward[1]][forward[0]]) {
        const move: Move = {
            piece,
            from: position,
            to: forward,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move);
    }
    // If it's the pawn's first move, it can move forward two squares
    const hasMoved = gameState.history.some(move => move.piece === piece);
    if (!hasMoved) {
        const forwardTwo: Position = [position[0], piece.color === 'white' ? position[1] + 2 : position[1] - 2];
        if (!gameState.board[forward[1]][forward[0]] && !gameState.board[forwardTwo[1]][forwardTwo[0]]) {
            const move: Move = {
                piece,
                from: position,
                to: forwardTwo,
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move);
        }
    }

    // Pawns capture diagonally
    const leftCapture: Position = [position[0] - 1, piece.color === 'white' ? position[1] + 1 : position[1] - 1];
    const rightCapture: Position = [position[0] + 1, piece.color === 'white' ? position[1] + 1 : position[1] - 1];

    if (gameState.board[leftCapture[1]] && gameState.board[leftCapture[1]][leftCapture[0]] && gameState.board[leftCapture[1]][leftCapture[0]]?.color !== piece.color) {
        const move: Move = {
            piece,
            from: position,
            to: leftCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move);
    }

    if (gameState.board[rightCapture[1]] && gameState.board[rightCapture[1]][rightCapture[0]] && gameState.board[rightCapture[1]][rightCapture[0]]?.color !== piece.color) {
        const move: Move = {
            piece,
            from: position,
            to: rightCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move);
    }
    return moves;
}

function getRookMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState) {
    const moves: Move[] = [];

    // Directions: up, down, left, right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position[0] + i * dx;
            const y = position[1] + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            if (gameState.board[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState.board[y][x]?.color !== piece.color) {
                    const move: Move = {
                        piece,
                        from: position,
                        to: [x, y],
                        board: gameState.board,
                        turn: piece.color,
                        turnNumber: gameState.history.length
                    };
                    moves.push(move);
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            const move: Move = {
                piece,
                from: position,
                to: [x, y],
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move);
        }
    }

    return moves;
}

function getKnightMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
    const moves: Move[] = [];

    // Knight move directions
    const directions = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dx, dy] of directions) {
        const x = position[0] + dx;
        const y = position[1] + dy;

        // Continue if off board
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            continue;
        }

        // If square is occupied by own piece, continue
        if (gameState.board[y][x] && gameState.board[y][x]?.color === piece.color) {
            continue;
        }

        // If square is not occupied or occupied by opponent's piece, it's a valid move
        const move: Move = {
            piece,
            from: position,
            to: [x, y],
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move);
    }

    return moves;
}

function getBishopMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
    const moves: Move[] = [];

    // Directions: up-left, up-right, down-left, down-right
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position[0] + i * dx;
            const y = position[1] + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            // If square is occupied
            if (gameState.board[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState.board[y][x]?.color !== piece.color) {
                    const move: Move = {
                        piece,
                        from: position,
                        to: [x, y],
                        board: gameState.board,
                        turn: piece.color,
                        turnNumber: gameState.history.length
                    };
                    moves.push(move);
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            const move: Move = {
                piece,
                from: position,
                to: [x, y],
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move);
        }
    }

    return moves;
}

function getQueenMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
    const moves: Move[] = [];

    // Directions: up, down, left, right, up-left, up-right, down-left, down-right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        for (let i = 1; i < 8; i++) {
            const x = position[0] + i * dx;
            const y = position[1] + i * dy;

            // Stop if off board
            if (x < 0 || x > 7 || y < 0 || y > 7) {
                break;
            }

            // If square is occupied
            if (gameState.board[y][x]) {
                // If occupied by opponent's piece, it's a valid move
                if (gameState.board[y][x]?.color !== piece.color) {
                    const move: Move = {
                        piece,
                        from: position,
                        to: [x, y],
                        board: gameState.board,
                        turn: piece.color,
                        turnNumber: gameState.history.length
                    };
                    moves.push(move);
                }
                // Stop looking in this direction (can't jump over pieces)
                break;
            }

            // If square is not occupied, it's a valid move
            const move: Move = {
                piece,
                from: position,
                to: [x, y],
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move);
        }
    }

    return moves;
}

function getKingMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
    const moves: Move[] = [];

    // King move directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dx, dy] of directions) {
        const x = position[0] + dx;
        const y = position[1] + dy;

        // Continue if off board
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            continue;
        }

        // If square is occupied by own piece, continue
        if (gameState.board[y][x] && gameState.board[y][x]?.color === piece.color) {
            continue;
        }

        // If square is not occupied or occupied by opponent's piece, it's a valid move
        const move: Move = {
            piece,
            from: position,
            to: [x, y],
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move);
    }

    return moves;
}

export default getMovesForPiece;