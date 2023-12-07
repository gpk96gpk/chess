import { Position, Piece as PieceType, GameState, Move } from "../types/clientTypes";
//import isCheck from "./isCheck";

const pieceMoveFunctions = {
    'pawn': getPawnMoves,
    'rook': getLinearMoves,
    'knight': getFixedMoves,
    'bishop': getLinearMoves,
    'queen': getLinearMoves,
    'king': getFixedMoves,
};

const linearDirections = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const kingDirections = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

function getMovesForPiece(piece: PieceType, position: Position, gameState: GameState): Move[] {
    if (piece?.type && piece.type in pieceMoveFunctions) {
        return pieceMoveFunctions[piece.type](piece, position, gameState);
    }
    return [];
}

function getPawnMoves(piece: { type: string, color: 'white' | 'black', hasMoved: boolean }, position: Position, gameState: GameState) {
    const moves: Move[] = [];
    const forward: Position = [piece.color === 'black' ? position[0] + 1 : position[0] - 1, position[1]];

    if (forward[0] >= 0 && forward[0] < 8 && forward[1] >= 0 && forward[1] < 8 && gameState.board[forward[0]][forward[1]].type === 'empty') {
        const move: Move = {
            piece: { ...piece, hasMoved: true },
            from: position,
            to: forward,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
    }

    if (!piece.hasMoved) {
        const forwardTwo: Position = [piece.color === 'black' ? position[0] + 2 : position[0] - 2, position[1]];
        if (gameState.board[forwardTwo[0]] && gameState.board[forwardTwo[0]][forwardTwo[1]] && gameState.board[forwardTwo[0]][forwardTwo[1]].type === 'empty') {
            const move: Move = {
                piece: { ...piece, hasMoved: true },
                from: position,
                to: forwardTwo,
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            moves.push(move.to);
        }
    }
    const leftCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] - 1 : position[1] + 1];
    const rightCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] + 1 : position[1] - 1];
    const oppositeColor = piece.color === 'white' ? 'black' : 'white';

    if (gameState.board[leftCapture[0]][leftCapture[1]]?.color === oppositeColor) {
        const move: Move = {
            piece: { ...piece, hasMoved: true },
            from: position,
            to: leftCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
    }

    if (gameState.board[rightCapture[0]][rightCapture[1]]?.color === oppositeColor) {
        const move: Move = {
            piece: { ...piece, hasMoved: true },
            from: position,
            to: rightCapture,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
        moves.push(move.to);
    }

    return moves;
}

function getLinearMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState) {
    const directions = piece.type === 'rook' ? linearDirections.slice(0, 4) : linearDirections;
    return directions.flatMap(([dy, dx]) => getMovesInDirection(piece, position, gameState, dy, dx, 1));
}

function getFixedMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState) {
    if (piece.type !== 'knight' && piece.type !== 'king') {
        throw new Error('This function only supports knights and kings');
    }

    const directions = piece.type === 'knight' ? knightDirections : kingDirections;
    const [y, x] = position;

    const moves = directions.map(([dy, dx]) => {
        const newY = y + dy;
        const newX = x + dx;
        if (newY >= 0 && newY < 8 && newX >= 0 && newX < 8 && (!gameState.board[newY][newX] || gameState.board[newY][newX].color !== piece.color)) {
            return [newY, newX];
        }
        return null;
    });

    return moves.filter(move => move !== null);
}

function getMovesInDirection(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState, dy: number, dx: number, i: number): Move[] {
    const y = position[0] + i * dy;
    const x = position[1] + i * dx;

    // Stop if off board
    if (y < 0 || y > 7 || x < 0 || x > 7) {
        return [];
    }

    // If square is occupied by any piece, stop looking in this direction
    if (gameState.board && gameState.board[y][x]) {
        // Check if the last checked square is occupied by an opponent's piece
        if (gameState.board[y][x]?.color !== piece.color) {
            const move: Move = {
                piece: { ...piece, hasMoved: true },
                from: position,
                to: [y, x],
                board: gameState.board,
                turn: piece.color,
                turnNumber: gameState.history.length
            };
            return [move.to];
        }
        return [];
    }

    // If square is not occupied, it's a valid move
    const move: Move = {
        piece: { ...piece, hasMoved: true },
        from: position,
        to: [y, x],
        board: gameState.board,
        turn: piece.color,
        turnNumber: gameState.history.length
    };

    return [move.to, ...getMovesInDirection(piece, position, gameState, dy, dx, i + 1)];
}
export default getMovesForPiece;








// import { Position, Piece as PieceType, GameState, Move } from "../types/clientTypes";
// import isCheck from "./isCheck";

// function getMovesForPiece(piece: PieceType, position: Position, gameState: GameState): Move[] {
//     console.log('getMovesForPiecePropsCheck', piece, position, gameState);
//     switch (piece?.type) {
//         case 'pawn':
//             return getPawnMoves(piece, position, gameState);
//         case 'rook':
//             return getRookMoves(piece, position, gameState);
//         case 'knight':
//             return getKnightMoves(piece, position, gameState);
//         case 'bishop':
//             return getBishopMoves(piece, position, gameState);
//         case 'queen':
//             return getQueenMoves(piece, position, gameState);
//         case 'king':
//             return getKingMoves(piece, position, gameState);
//         default:
//             return [];
//     }
// }

// function getPawnMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState) {
//     console.log('PawnPropsCheck', piece, position, gameState);
//     const moves: Move[] = [];
//     // Pawns can move forward one square, if it's not occupied
//     const forward: Position = [piece.color === 'black' ? position[0] + 1 : position[0] - 1, position[1]];
//     if (!forward) {
//         return;
//     }
//     if (forward[0] >= 0 && forward[0] < 8 && forward[1] >= 0 && forward[1] < 8 && gameState.board[forward[0]][forward[1]].type === 'empty') {
//         const move: Move = {
//             piece: { ...piece, hasMoved: true },
//             from: position,
//             to: forward,
//             board: gameState.board,
//             turn: piece.color,
//             turnNumber: gameState.history.length
//         };
//         moves.push(move.to);
//         console.log('PawnMovesCheckForward1', moves);
//     }
//     //If it's the pawn's first move, it can move forward two squares
//     const hasMoved = gameState.history.some(move => {
//         console.log('move.piece', move.piece);
//         console.log('piece', piece);
//         return move.piece === { ...piece };
//     });
//     console.log('hasMoved!!!', hasMoved);
//     console.log('gameState.history!!!', gameState.history);
//     console.log('piece!!!', piece);
//     console.log('PawnGameStateCheck', gameState);
//     if (piece.hasMoved === false && gameState.board[forward[0]][forward[1]].type === 'empty') {
//         const forwardTwo: Position = [piece.color === 'black' ? position[0] + 2 : position[0] - 2, position[1]];
//         console.log('PawnMovesForwards', forward, forward[0], forwardTwo[1]);
//         console.log('PawnMovesForwards2', forwardTwo, forwardTwo[0], forwardTwo[1]);
//         if (forwardTwo[0] && forwardTwo[1] && forward[0] && forward[1] && gameState.board[forwardTwo[0]]) {
//             console.log('gameState.board[forwardTwo[0]][forwardTwo[1]]', gameState.board[forwardTwo[0]][forwardTwo[1]], forwardTwo[0], forwardTwo[1]);
//             console.log('gameState.board[forward[0]]', gameState.board[forward[0]][forward[1]], forward[0], forward[1]);
//         }
//         if (gameState.board[forwardTwo[0]][forwardTwo[1]].type === 'empty') {
//             const move: Move = {
//                 piece: { ...piece, hasMoved: true },
//                 from: position,
//                 to: forwardTwo,
//                 board: gameState.board,
//                 turn: piece.color,
//                 turnNumber: gameState.history.length
//             };
//             moves.push(move.to);
//             console.log('PawnMovesCheckForwardTwo', moves);
//         }
//     }

//     // Pawns capture diagonally
//     if (!position[0]) {
//         return;
//     }
//     const leftCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] - 1 : position[1] + 1];
//     const rightCapture: Position = [piece.color === 'white' ? position[0] - 1 : position[0] + 1, piece.color === 'white' ? position[1] + 1 : position[1] - 1];
//     console.log('gameState.board[leftCapture[0]][leftCapture[1]].color!!', gameState.board[leftCapture[0]][leftCapture[1]], leftCapture[0], leftCapture[1]);
//     console.log('piece.color!!', piece.color);
//     const oppositeColor = piece.color === 'white' ? 'black' : 'white';

//     if (gameState.board && gameState.board[leftCapture[1]] && gameState.board[leftCapture[0]][leftCapture[1]] && gameState.board[leftCapture[0]][leftCapture[1]].color === oppositeColor) {
//         const move: Move = {
//             piece: { ...piece, hasMoved: true },
//             from: position,
//             to: leftCapture,
//             board: gameState.board,
//             turn: piece.color,
//             turnNumber: gameState.history.length
//         };
//         moves.push(move.to);
//         console.log('PawnMovesCheckLeft', moves);

//     }

//     if (gameState.board[rightCapture[1]] && gameState.board[rightCapture[0]][rightCapture[1]] && gameState.board[rightCapture[0]][rightCapture[1]]?.color === oppositeColor) {
//         const move: Move = {
//             piece: { ...piece, hasMoved: true },
//             from: position,
//             to: rightCapture,
//             board: gameState.board,
//             turn: piece.color,
//             turnNumber: gameState.history.length
//         };
//         moves.push(move.to);
//         console.log('PawnMovesCheckRight', moves);

//     }
//     console.log('PawnMovesSent', moves);
//     return moves;
// }

// function getRookMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState) {
//     // Directions: up, down, left, right
//     const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

//     const moves: Move[] = directions.flatMap(([dy, dx]) => getMovesInDirection(piece, position, gameState, dy, dx, 1));

//     console.log('Returning moves:', moves);
//     return moves;
// }

// function getMovesInDirection(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState, dy: number, dx: number, i: number): Move[] {
//     const y = position[0] + i * dy;
//     const x = position[1] + i * dx;
//     console.log('Checking position:', [y, x]);

//     // Stop if off board
//     if (y < 0 || y > 7 || x < 0 || x > 7) {
//         return [];
//     }

//     // If square is occupied by any piece, stop looking in this direction
//     if (gameState.board && gameState.board[y][x]?.type !== 'empty') {
//         // Check if the last checked square is occupied by an opponent's piece
//         if (gameState.board[y][x]?.color !== piece.color) {
//             const move: Move = {
//                 piece: { ...piece, hasMoved: true },
//                 from: position,
//                 to: [y, x],
//                 board: gameState.board,
//                 turn: piece.color,
//                 turnNumber: gameState.history.length
//             };
//             return [move.to];
//         }
//         return [];
//     }

//     // If square is not occupied, it's a valid move
//     const move: Move = {
//         piece: { ...piece, hasMoved: true },
//         from: position,
//         to: [y, x],
//         board: gameState.board,
//         turn: piece.color,
//         turnNumber: gameState.history.length
//     };

//     return [move.to, ...getMovesInDirection(piece, position, gameState, dy, dx, i + 1)];
// }

// function getKnightMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
//     // Knight move directions
//     const directions = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

//     const moves: Move[] = directions.flatMap(([dy, dx]) => {
//         const y = position[0] + dy;
//         const x = position[1] + dx;

//         // Continue if off board
//         if (y < 0 || y > 7 || x < 0 || x > 7) {
//             return [];
//         }

//         // Create a temporary game state to test the move
//         const tempGameState = JSON.parse(JSON.stringify(gameState));
//         tempGameState.board[position[0]][position[1]] = null; // Remove the king from its current position
//         tempGameState.board[y][x] = piece; // Place the king at the new position

//         // If the piece is a king and the move would result in a check, skip this move
//         if (piece.type === 'king' && isInCheck(tempGameState, piece.color)) {
//             return [];
//         }

//         // If square is occupied by own piece, continue
//         if (gameState.board[y][x] && gameState.board[y][x]?.color === piece.color) {
//             return [];
//         }

//         // If square is not occupied or occupied by opponent's piece, it's a valid move
//         const move: Move = {
//             piece: { ...piece, hasMoved: true },
//             from: position,
//             to: [y, x],
//             board: gameState.board,
//             turn: piece.color,
//             turnNumber: gameState.history.length
//         };
//         return [move.to];
//     });

//     return moves;
// }

// function getBishopMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
//     // Directions: up-left, up-right, down-left, down-right
//     const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

//     const moves: Move[] = directions.flatMap(([dy, dx]) => getMovesInDirection(piece, position, gameState, dy, dx, 1));

//     return moves;
// }



// function getQueenMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
//     // Directions: up, down, left, right, up-left, up-right, down-left, down-right
//     const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

//     const moves: Move[] = directions.flatMap(([dy, dx]) => getMovesInDirection(piece, position, gameState, dy, dx, 1));

//     return moves;
// }
// function getKingMoves(piece: { type: string, color: 'white' | 'black' }, position: Position, gameState: GameState): Move[] {
//     // Directions: up, down, left, right, up-left, up-right, down-left, down-right
//     const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

//     const moves: Move[] = directions.flatMap(([dy, dx]) => {
//         const y = position[0] + dy;
//         const x = position[1] + dx;

//         // Continue if off board
//         if (y < 0 || y > 7 || x < 0 || x > 7) {
//             return [];
//         }

//         // If square is occupied by own piece, continue
//         if (gameState.board[y][x] && gameState.board[y][x]?.type !== 'empty' && gameState.board[y][x]?.color === piece.color) {
//             return [];
//         }

//         // If square is not occupied or occupied by opponent's piece, it's a valid move
//         const move: Move = {
//             piece: { ...piece, hasMoved: true },
//             from: position,
//             to: [y, x],
//             board: gameState.board,
//             turn: piece.color,
//             turnNumber: gameState.history.length
//         };
//         return [move.to];
//     });

//     return moves;
// }

// export default getMovesForPiece;









