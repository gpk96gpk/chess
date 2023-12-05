import { GameState, Move, Position } from "../types/clientTypes";

function enPassant(piece: { type: string; color: 'white' | 'black'; }, position: Position, gameState: GameState, playerNumber: number) {
    console.log('enPassantPropsCheckReceived!!!', piece, position, gameState, playerNumber);
    // Check if the piece is a pawn
    console.log('gameStateCheck!!!', gameState, gameState.history);
    // if (!gameState || !gameState.history) {
    //     return null;
    // }
    console.log('pieceCheck!!!', piece.type);
    if (piece.type !== 'pawn') {
        return null;
    }

    // Check if the last move was a pawn moving two squares
    console.log('gameStateCheckLastMove!!!', gameState, gameState.history)
    console.log('lastMoveCheckNum!!!', gameState.history[gameState.history.length - 1]);
    const lastMoveTo: Move = gameState.history[gameState.history.length - 1]?.to;
    const lastMoveFrom: Move = gameState.history[gameState.history.length - 1]?.from;
    const isLastPiecePawn = gameState.history[gameState.history.length - 1]?.piece.type === 'pawn';
    let lastMoveTo0;
    let lastMoveFrom0;
    let lastMoveTo1;
    let lastMoveFrom1;
    let lastMoveDistance;
    if (lastMoveTo && lastMoveFrom) {
        lastMoveTo0 = lastMoveTo[0];
        lastMoveFrom0 = lastMoveFrom[0];
        lastMoveTo1 = lastMoveTo[1];
        lastMoveFrom1 = lastMoveFrom[1];
        console.log('lastMoveCheck!!!', lastMoveTo0, lastMoveFrom0, lastMoveTo1, lastMoveFrom1);
        lastMoveDistance = Math.abs(lastMoveTo0 - lastMoveFrom0);
        console.log('lastMoveCheckDistance!!!', lastMoveDistance);
    }

    const didPawnMoveTwoSquares = lastMoveDistance === 2;
    const isPawnAdjacent = Math.abs(lastMoveTo1 - position[1]) === 1;
    
    console.log('positionCheck!!!', position, lastMoveTo, lastMoveFrom)
    console.log('lastMoveCheck!!!', isLastPiecePawn, didPawnMoveTwoSquares, isPawnAdjacent);
    if ( !isLastPiecePawn || !didPawnMoveTwoSquares || !isPawnAdjacent) {
        return null;
    }

    // Check if the current piece is a pawn on its fifth rank
    const rank = playerNumber === 1 ? 4 : 3;
    console.log('rankCheck!!!', lastMoveTo0, rank);
    if (lastMoveTo0 !== rank) {
        return null;
    }

    const file = lastMoveTo1;
    console.log('fileCheck!!!', lastMoveTo1, file - 1, file + 1);
    console.log('positionCheck!!!', position[0], lastMoveTo, lastMoveFrom)
    if (position[0] !== file - 1 && position[0] !== file + 1) {
        return null;
    }

    // Modify the gameState to reflect the en passant capture
    const to: Position = [lastMoveTo1, playerNumber === 1 ? rank + 1 : rank - 1] as Position;
    console.log('toCheck!!!', to);
    const move: Move = {
        piece: {...piece, hasMoved: true},
        from: position,
        to,
        board: gameState.board,
        turn: piece.color,
        turnNumber: gameState.history[gameState.history.length - 1]?.turnNumber + 1
    };
    console.log('moveCheck!!!', move);


    return move.to;
}

export default enPassant;