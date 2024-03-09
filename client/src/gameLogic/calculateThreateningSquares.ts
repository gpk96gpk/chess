import { GameStateType, PieceType, Position } from "../types/clientTypes";

export function calculateThreateningSquares(gameState: GameStateType, opponentColor: 'black' | 'white', piece: PieceType, lastPosition: Position ) {
    let kingPosition: Position;
    if (piece.type === 'king') {
        kingPosition = lastPosition;
    } else {
        kingPosition = gameState.kingPositions[opponentColor]
    }
    console.log('999King position:', kingPosition, lastPosition, gameState.kingPositions[opponentColor]);

    const directions = [
        [0, -1], [0, 1], // horizontal
        [-1, 0], [1, 0], // vertical
        [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
        [-2, -1], [-2, 1], [2, -1], [2, 1], // knight vertical
        [-1, -2], [-1, 2], [1, -2], [1, 2], // knight horizontal
    ];
    
    if (!kingPosition) {
        console.log('999King position is not defined');
        return directions;
    }  

    const squares = directions.map(([dy, dx]) => {
        console.log('999Current direction:', [dy, dx]);
    
        // If this is a knight move, return an array with a single position
        if (Math.abs(dy) === 2 || Math.abs(dx) === 2) {
            const y = kingPosition[0] + dy; // reversed
            const x = kingPosition[1] + dx; // reversed
            console.log('999New position:', [y, x]);
    
            // If the square is within the board, return its coordinates
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                return [[y, x]]; // reversed
            }
    
            return [];
        }
    
        // For other moves, return an array with multiple positions
        const positions = [];
        for (let i = 0; i < 7; i++) {
            const y = kingPosition[0] + dy * (i + 1); // reversed
            const x = kingPosition[1] + dx * (i + 1); // reversed
            console.log('999New position:', [y, x]);
    
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                positions.push([y, x]); // reversed
            } else {
                break;
            }
        }
    
        return positions;
    });
    console.log('999Calculated squares:', squares);
    return squares;
}

export default calculateThreateningSquares;