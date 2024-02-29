import { GameState, Move, Position } from "../types/clientTypes";

function enPassant(piece: { type: string; color: 'white' | 'black'; }, lastPosition: Position, gameState: GameState, playerNumber: number) {
    console.log("Running enPassant function with piece:", piece, "and lastPosition:", lastPosition);

    if (piece.type !== 'pawn') {
        console.log("Piece is not a pawn, returning null");
        return null;
    }

    const [toX, toY] = lastPosition;
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    const enPassantDirection: number = piece.color === 'white' ? -1 : 1;

    const enPassantCondition = toY - 1 >= 0 && gameState.board[toX][toY].type === 'empty' 
    && gameState.board[toX - enPassantDirection][toY].type === 'pawn' && gameState.board[toX - enPassantDirection][toY].color === opponentColor
    && gameState.board[toX - enPassantDirection][toY].hasMovedTwo === true;

    console.log("enPassantCondition:", enPassantCondition, "enPassantDirection:", enPassantDirection, "toX:", toX, "toY:", toY, "opponentColor:", opponentColor);

    let move: Move | null = null;

    if (enPassantCondition) {
        move = {
            piece: {...piece, hasMoved: true},
            from: lastPosition,
            to: [toX, toY] as Position,
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history[gameState.history.length - 1]?.turnNumber + 1
        };
        console.log("En passant move:", move);
    }

    console.log("Returning move.to:", move?.to);
    return move?.to;
}

export default enPassant;