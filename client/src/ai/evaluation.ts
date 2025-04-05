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
  
  // Center control bonus
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.position) {
      const [y, x] = piece.position;
      
      // Check if piece is in the center
      if (CENTER_SQUARES.some(([cy, cx]) => cy === y && cx === x)) {
        score += 0.2; // Small bonus for center control
      }
      
      // Pawn advancement bonus (for pawns only)
      if (piece.type === 'pawn') {
        const advancementRank = aiColor === 'white' ? 7 - y : y;
        score += 0.05 * advancementRank; // Small bonus for advanced pawns
      }
    }
  });
  
  return score;
}