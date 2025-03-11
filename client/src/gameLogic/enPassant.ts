import { GameStateType, Move, PieceType, Position } from "../types/clientTypes";

function enPassant(piece: PieceType, lastPosition: Position, gameState: GameStateType) {
    console.log("Running enPassant function with piece:", piece, "and lastPosition:", lastPosition);

    // If not a pawn, return null (not undefined)
    if (piece.type !== 'pawn') {
        console.log("Piece is not a pawn, returning null");
        return null;
    }

    const [toX, toY] = lastPosition;
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    const enPassantDirection: number = piece.color === 'white' ? -1 : 1;

    // Check if the target position is valid for en passant
    const enPassantCondition = 
        // Make sure we're not trying to go off the board
        toY! - 1 >= 0 && 
        // Target position must be empty
        gameState.board[toX!][toY!].type === 'empty' &&
        // There must be an opponent's pawn in the adjacent position
        gameState.board[toX! - enPassantDirection][toY!].type === 'pawn' && 
        gameState.board[toX! - enPassantDirection][toY!].color === opponentColor &&
        // The pawn must have just moved two squares
        gameState.board[toX! - enPassantDirection][toY!].hasMovedTwo === true;

    console.log("enPassantCondition:", enPassantCondition, "enPassantDirection:", enPassantDirection, 
                "toX:", toX, "toY:", toY, "opponentColor:", opponentColor);

    // Additional check to verify this was the last move
    let wasLastMove = false;
    if (gameState.history.length > 0) {
        const lastMove = gameState.history[gameState.history.length - 1];
        if (lastMove.piece?.type === 'pawn' && 
            lastMove.piece?.color === opponentColor &&
            lastMove.to[0] === toX! - enPassantDirection &&
            lastMove.to[1] === toY &&
            Math.abs(lastMove.from[0]! - lastMove.to[0]) === 2) {
            wasLastMove = true;
        }
    }

    console.log("Was this the opponent's last move?", wasLastMove);

    // Only create an en passant move if all conditions are met
    if (enPassantCondition && wasLastMove) {
        const move: Move = {
            piece: {...piece, hasMoved: true},
            from: lastPosition,
            to: [toX, toY] as Position,
            board: gameState.board,
            turn: piece.color!,
            turnNumber: gameState.history[gameState.history.length - 1]?.turnNumber + 1,
        };
        console.log("En passant move:", move);
        return move.to;
    }

    // Explicitly return null if en passant is not valid
    return null;
}

export default enPassant;