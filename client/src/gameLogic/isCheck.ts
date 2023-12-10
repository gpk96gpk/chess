import { GameStateType, Position, Piece as PieceType, Move } from '../types/clientTypes';
import isCheckmate from './isCheckmate';

interface CheckResult {
    isKingInCheck: boolean;
    isKingInCheckmate: boolean;
    loser: string;
}
function isCheck(gameState, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition): CheckResult {
    if (!gameState || !playerNumber || !gameState.kingPositions) {
        return { isKingInCheck: false, isKingInCheckmate: false, loser: '' };
    }

    const currentPlayerColor = playerNumber === 2 ? 'white' : 'black';
    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';

    const kingPosition = lastPosition ? lastPosition : gameState.kingPositions[currentPlayerColor];

    let isKingInCheck = false;

    function isAdjacent(position1: [number, number], position2: [number, number]): boolean {
        const [y1, x1] = position1;
        const [y2, x2] = position2;

        const dy = Math.abs(y1 - y2);
        const dx = Math.abs(x1 - x2);
        console.log('isAdjacent', dy, dx, position1, position2);
        return (dy <= 1 && dx <= 1);
    }
    function isDiagonal(position1: [number, number], position2: [number, number]): boolean {
        const [y1, x1] = position1;
        const [y2, x2] = position2;
    
        // Two positions are diagonal if the absolute difference between their x-coordinates
        // is equal to the absolute difference between their y-coordinates
        return Math.abs(y1 - y2) === Math.abs(x1 - x2);
    }
    function isKnightAttackingPosition(kingPosition: [number, number], gameState: GameStateType, opponentColor: string): boolean {
        const [kingY, kingX] = kingPosition;
        const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

        for (let [dy, dx] of knightDirections) {
            const newY = kingY + dy;
            const newX = kingX + dx;

            // Check if the new position is within the board
            if (newY >= 0 && newY < 8 && newX >= 0 && newX < 8) {
                const piece = gameState.board[newY][newX];

                // Check if the piece at the new position is an opponent's knight
                if (piece !== null && piece.type === 'knight' && piece.color === opponentColor) {
                    return true;
                }
            }
        }

        return false;
    }
    for (let row of threateningSquares) {
        for (let square of row) {
            const [y, x] = square;
            const piece = gameState.board[y][x];
            console.log('piece', piece, 'square', square);
            if (piece === null) {
                continue; // Skip empty squares
            }

            if (piece.color === currentPlayerColor) {
                break; // Stop processing this row if we encounter a friendly piece
            }
            // Special condition for kings
            if (piece.type === 'king') {
                if (!isAdjacent(kingPosition, square)) {
                    continue; // Skip this square if the king is not adjacent to the other king
                }
            }
            // Special condition for bishops
            if (piece.type === 'bishop') {
                if (!isDiagonal(kingPosition, square)) {
                    continue; // Skip this square if the bishop is not on a diagonal to the king
                }
            }
            // Special condition for knights
            if (piece.type === 'knight') {
                if (!isKnightAttackingPosition(kingPosition, gameState, opponentColor)) {
                    continue; // Skip this square if the knight is not in an attacking position
                }
            }

            // Special condition for pawns
            if (piece.type === 'pawn') {
                if (!isAdjacent(kingPosition, square)) {
                    continue; // Skip this square if the pawn is not adjacent to the king
                }
            }

            // If we've reached this point, the piece is an opponent piece
            isKingInCheck = true;
            break;
        }

        if (isKingInCheck) {
            break; // Stop processing further rows if the king is in check
        }
    }

    let isKingInCheckMate = false;
    if (isKingInCheck) {
        const isCheckmateResult = isCheckmate(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, playerNumber, lastPosition);
        isKingInCheckMate = isCheckmateResult.isInCheckmate;
        if (isKingInCheckMate) {
            console.log('King is in checkmate.');
        } else {
            console.log('King is in check but not in checkmate.');
        }
    } else {
        console.log('King is not in check or checkmate.');
    }

    return { isKingInCheck, isKingInCheckMate, loser: currentPlayerColor };
}

export default isCheck;