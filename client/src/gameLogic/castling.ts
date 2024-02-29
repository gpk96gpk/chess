import { GameState, Piece as PieceType, Position, Move } from "../types/clientTypes";

function getCastlingMove(gameState: GameState, piece: PieceType, position: Position): Move | null {
    const kingRow = position[0];
    const kingColumn = position[1];
    let castlingMove: Move | null = null;

    // Check the squares between the king and the rooks
    if (!gameState.board) {
        return null;
    }

    const leftRook = gameState.board[kingRow][0] as PieceType;
    const rightRook = gameState.board[kingRow][7] as PieceType;

    if (leftRook && leftRook.type === 'rook' && !leftRook.hasMoved && 
        !gameState.board[kingRow][1] && !gameState.board[kingRow][2] && !gameState.board[kingRow][3]) {
        castlingMove = {
            piece,
            from: position,
            to: [kingRow, kingColumn - 2],
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
    } else if (rightRook && rightRook.type === 'rook' && !rightRook.hasMoved && 
               !gameState.board[kingRow][5] && !gameState.board[kingRow][6]) {
        castlingMove = {
            piece,
            from: position,
            to: [kingRow, kingColumn + 2],
            board: gameState.board,
            turn: piece.color,
            turnNumber: gameState.history.length
        };
    }

    return castlingMove ? castlingMove.to : null;
}
export default getCastlingMove;