export function calculateThreateningSquares(kingPosition: [number, number], gameState: any, position) {
    console.log('843calculateThreateningSquares kingPosition', kingPosition, '887gameState', gameState, 'position', position);
    gameState && console.log('gameState.turn', gameState.turn);
    const turnColor = gameState.history.length % 2 === 0 ? 'white' : 'black';    
    const directions = [
        [-1, 0], [1, 0], // vertical
        [0, -1], [0, 1], // horizontal
        [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
        [-2, -1], [-2, 1], [2, -1], [2, 1], // knight vertical
        [-1, -2], [-1, 2], [1, -2], [1, 2], // knight horizontal
    ];
    
    // If the king's position is null, return the original array
    if (!kingPosition) {
        return directions;
    }  

    console.log('843gameState.kingPositions[turnColor]', gameState.kingPositions[turnColor])
    const squares = directions.map(([dx, dy]) => {
        return Array.from({ length: 7 }, (_, i) => {
            const y = gameState.kingPositions[turnColor][0] + dy * (i + 1); // reversed
            const x = gameState.kingPositions[turnColor][1] + dx * (i + 1); // reversed
            
            // If the square is within the board, return its coordinates
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                console.log('coordinates', [y, x] );
                return [y, x]; // reversed
            }
            
            // If this is a knight move, return null after the first iteration
            if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
                return null;
            }
            return null;
        }).filter(Boolean); // Remove null values
    });
    console.log('843squares', squares);

    return squares;
}

export default calculateThreateningSquares;