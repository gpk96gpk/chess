import { GameState, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import validMoves from './validMoves';
import calculateThreateningSquares from './calculateThreateningSquares';



function getPositionsBetween(pos1: Position, pos2: Position) {
    console.log('getPositionsBetween', pos1, pos2);
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;

    const xStep = x1 < x2 ? 1 : x1 > x2 ? -1 : 0;
    const yStep = y1 < y2 ? 1 : y1 > y2 ? -1 : 0;

    const xLength = Math.abs(x2 - x1);
    const yLength = Math.abs(y2 - y1);
    const length = Math.max(xLength, yLength);

    return Array.from({ length }, (_, i) => [x1 + xStep * (i + 1), y1 + yStep * (i + 1)] as Position)
        .filter(([x, y]) => x !== x2 || y !== y2);
}

function canCapture(gameState: GameState, threateningPieces, currentPlayerColor) {
    const currentPlayerPieces = gameState.board.flat().filter(piece => piece && piece.color === currentPlayerColor);

    return currentPlayerPieces.some(piece => {
        const kingPosition = gameState.kingPositions[currentPlayerColor];
        console.log('kingPosition', kingPosition);
        const moves = calculateThreateningSquares(kingPosition, gameState, piece.position);
        return moves.some(move => {
            return threateningPieces.some(threateningPiece => move[0] === threateningPiece[0] && move[1] === threateningPiece[1]);
        });
    });
}

function canBlock(gameState: GameState, kingPosition: Position, threateningPieces: Position[], currentPlayerColor: string) {
    return threateningPieces.some(threateningPiece => {
        const positionsBetween = getPositionsBetween(kingPosition, threateningPiece);
        const currentPlayerPieces = gameState.board.flat().filter(piece => piece && piece.color === currentPlayerColor && piece.type !== 'king');

        return currentPlayerPieces.some(piece => {
            return positionsBetween.some(pos => pos[0] === piece.position[0] && pos[1] === piece.position[1]);
        });
    });
}

function isCheckmate(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, playerNumber, lastPosition) {
    const kingPosition = gameState.kingPositions[currentPlayerColor];
    const threateningPieces = gameState.threateningPiecesPositions[currentPlayerColor === 'white' ? 'black' : 'white'];

    if (canCapture(gameState, threateningPieces, currentPlayerColor)) {
        return { isCheckmate: false, loser: null };
    }

    if (canBlock(gameState, kingPosition, threateningPieces, currentPlayerColor)) {
        return { isCheckmate: false, loser: null };
    }

    if (!kingPosition) {
        return { isCheckmate: false, loser: null };
    }
    
    const king = gameState.board[kingPosition[0]][kingPosition[1]];    
    const kingValidMoves = validMoves(piece, position, gameState, playerNumber, lastPosition);

    const canKingEscape = kingValidMoves.some(move => {
        const tempGameState = JSON.parse(JSON.stringify(gameState));
        tempGameState.board[kingPosition[0]][kingPosition[1]] = null;
        tempGameState.board[move[0]][move[1]] = king;
        return !isCheck(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, playerNumber, lastPosition);
    });
    console.log('canKingEscape', canKingEscape);
    if (canKingEscape) {
        return { isCheckmate: false, loser: null };
    }

    return { isCheckmate: true, loser: currentPlayerColor };
}

export default isCheckmate;