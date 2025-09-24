import { GameStateType } from '../types/clientTypes';

// Basic piece values
export const PIECE_VALUES = {
  'pawn': 1,
  'knight': 3,
  'bishop': 3.25, // Slightly higher than knight
  'rook': 5,
  'queen': 9,
  'king': 100 // High value to prioritize king safety
};

// Positional bonuses for central control
const CENTER_SQUARES = [
  [3, 3], [3, 4], [4, 3], [4, 4]  // d4, e4, d5, e5
];

export function evaluatePosition(gameState: GameStateType, aiColor: 'white' | 'black'): number {
  const opponentColor = aiColor === 'white' ? 'black' : 'white';
  let score = 0;
  
  // Material evaluation
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      score += PIECE_VALUES[piece.type];
    }
  });
  
  gameState.piecePositions[opponentColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      score -= PIECE_VALUES[piece.type];
    }
  });
  
  // Positional and strategic evaluation
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.position && piece.position.length === 2) {
      const [y, x] = piece.position;
      
      // Center control bonus
      if (CENTER_SQUARES.some(([cy, cx]) => cy === y && cx === x)) {
        score += 0.3; // Bonus for center control
      }
      
      // Extended center bonus (nearby squares)
      if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
        score += 0.1; // Smaller bonus for extended center
      }
      
      // Piece development bonus (encourage moving from starting positions)
      if (piece.hasMoved) {
        score += 0.1; // Small bonus for developed pieces
      }
      
      // Pawn advancement bonus
      if (piece.type === 'pawn') {
        const advancementRank = aiColor === 'white' ? 7 - y : y;
        score += 0.1 * advancementRank; // Bonus for advanced pawns
      }
      
      // Knight outpost bonus (knights in strong positions)
      if (piece.type === 'knight' && x >= 2 && x <= 5 && y >= 2 && y <= 5) {
        score += 0.25; // Knights are strong in the center
      }
      
      // Bishop pair bonus (if we have both bishops)
      if (piece.type === 'bishop') {
        const bishopCount = gameState.piecePositions[aiColor].filter(p => p.type === 'bishop').length;
        if (bishopCount >= 2) {
          score += 0.15; // Bishop pair bonus
        }
      }
    }
  });
  
  // Add some randomness to prevent identical evaluations
  score += (Math.random() - 0.5) * 0.05; // Small random factor
  
  // Game phase consideration
  const totalPieces = gameState.piecePositions[aiColor].length + gameState.piecePositions[opponentColor].length;
  if (totalPieces < 20) { // Endgame phase
    // In endgame, king activity is important
    const aiKing = gameState.piecePositions[aiColor].find(p => p.type === 'king');
    if (aiKing && aiKing.position && aiKing.position.length === 2) {
      const [ky, kx] = aiKing.position;
      // Bonus for active king in endgame
      const kingActivity = Math.abs(4 - ky) + Math.abs(4 - kx);
      score += (8 - kingActivity) * 0.05; // King closer to center gets bonus
    }
  }
  
  return score;
}