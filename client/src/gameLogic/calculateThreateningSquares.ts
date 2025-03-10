import { GameStateType, PieceType, Position } from "../types/clientTypes";

export function calculateThreateningSquares(
  gameState: GameStateType,
  opponentColor: 'black' | 'white',
  piece: PieceType,
  lastPosition: Position
) {
  let kingPosition: Position;
  if (piece.type === 'king') {
    kingPosition = lastPosition;
  } else {
    kingPosition = gameState.kingPositions[opponentColor];
  }
  console.log('999King position:', kingPosition, lastPosition, gameState.kingPositions[opponentColor]);

  const directions = [
    [0, -1], [0, 1],       // horizontal
    [-1, 0], [1, 0],       // vertical
    [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
    [-2, -1], [-2, 1], [2, -1], [2, 1],   // knight moves (vertical style)
    [-1, -2], [-1, 2], [1, -2], [1, 2],     // knight moves (horizontal style)
  ];
  
  if (!kingPosition) {
    console.log('999King position is not defined');
    return directions;
  }  

  const squares = directions.map(([dy, dx]) => {
    console.log('999Current direction:', [dy, dx]);
    
    // For knight moves, use only valid knight offsets
    if ((Math.abs(dy) === 2 && Math.abs(dx) === 1) || (Math.abs(dy) === 1 && Math.abs(dx) === 2)) {
      const y = kingPosition[0]! + dy;
      const x = kingPosition[1]! + dx;
      console.log('999New position:', [y, x]);
      if (y >= 0 && y < 8 && x >= 0 && x < 8) {
        return [[y, x]];
      }
      return [];
    }
    
    // For sliding moves, calculate all valid positions in this direction
    const positions: number[][] = [];
    for (let i = 0; i < 7; i++) {
      const y = kingPosition[0]! + dy * (i + 1);
      const x = kingPosition[1]! + dx * (i + 1);
      console.log('999New position:', [y, x]);
      if (y >= 0 && y < 8 && x >= 0 && x < 8) {
        positions.push([y, x]);
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