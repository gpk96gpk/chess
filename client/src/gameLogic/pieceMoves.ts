import { Position, Piece as PieceType, GameState, Move } from "../types/clientTypes";

function getMovesForPiece(piece: PieceType, position: Position, gameState: GameState): Move[] {
    console.log('getMovesForPiecePropsCheck', piece, position, gameState);
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
    console.log('getPawnMovesPropsCheck', piece, position, gameState);
    // Pawns can move forward one square, if it's not occupied
    console.log('MovesFileposition', position)
    console.log('MovesFilepiece', piece)
    const forward: Position = [piece.color === 'black' ? position[0] + 1 : position[0] - 1, position[1] ];
    if (!forward) {
        return;
    }
    if (forward[0] >= 0 && forward[0] < 8 && forward[1] >= 0 && forward[1] < 8) {
        const move: Move = {
            piece,
            from: position,
            to: forward,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
        console.log('PawnMovesCheckForward1', moves);
    }
    // If it's the pawn's first move, it can move forward two squares
    const hasMoved = gameState.history.some(move => move.piece === piece);
    console.log('PawnMovesHasMoved', hasMoved);
    console.log('PawnGameStateCheck', gameState);
    if (!hasMoved) {
        const forwardTwo: Position = [piece.color === 'black' ? position[0] + 2 : position[0] - 2, position[1]];
        console.log('PawnMovesForwards', forward, forward[0], forwardTwo[1]);
        console.log('PawnMovesForwards2', forwardTwo, forwardTwo[0], forwardTwo[1]);
        if (forwardTwo[0] && forwardTwo[1] && forward[0] && forward[1] && gameState.board[forwardTwo[0]]) {
            console.log('gameState.board[forwardTwo[0]][forwardTwo[1]]',  gameState.board[forwardTwo[0]][forwardTwo[1]], forwardTwo[0], forwardTwo[1]);
            console.log('gameState.board[forward[0]]',  gameState.board[forward[0]][forward[1]], forward[0], forward[1]);
        }
        if (gameState.board[forwardTwo[0]][forwardTwo[1]].type === 'empty') {
            const move: Move = {
                piece,
                from: position,
                to: forwardTwo,
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move.to);
            console.log('PawnMovesCheckForwardTwo', moves);
        }
    }

    // Pawns capture diagonally
    const leftCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] - 1 : position[1] + 1];
    const rightCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] + 1 : position[1] - 1];

    if (gameState.board[leftCapture[1]] && gameState.board[leftCapture[0],leftCapture[1]] && gameState.board[leftCapture[0],leftCapture[1]]?.color !== piece.color) {
        const move: Move = {
            piece,
            from: position,
            to: leftCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
        console.log('PawnMovesCheckLeft', moves);

    }

    if (gameState.board[rightCapture[1]] && gameState.board[rightCapture[0]][rightCapture[1]] && gameState.board[rightCapture[0]][rightCapture[1]]?.color !== piece.color) {
        const move: Move = {
            piece,
            from: position,
            to: rightCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
        console.log('PawnMovesCheckRight', moves);

    }
    console.log('PawnMovesSent', moves);
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