import { GameStateType } from '../types/clientTypes';

// Enhanced piece values
export const PIECE_VALUES = {
  'pawn': 100,
  'knight': 300,
  'bishop': 325, // Slightly higher than knight
  'rook': 500,
  'queen': 900,
  'king': 10000 // Very high value to prioritize king safety
};

// Positional bonuses for central control
const CENTER_SQUARES = [
  [3, 3], [3, 4], [4, 3], [4, 4]  // d4, e4, d5, e5
];

export function evaluatePosition(gameState: GameStateType, aiColor: 'white' | 'black'): number {
  const opponentColor = aiColor === 'white' ? 'black' : 'white';
  let score = 0;
  
  // Material evaluation
  let aiMaterial = 0;
  let opponentMaterial = 0;
  
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      aiMaterial += PIECE_VALUES[piece.type];
      score += PIECE_VALUES[piece.type];
    }
  });
  
  gameState.piecePositions[opponentColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      opponentMaterial += PIECE_VALUES[piece.type];
      score -= PIECE_VALUES[piece.type];
    }
  });
  
  // Debug material difference for significant changes
  const materialDiff = aiMaterial - opponentMaterial;
  if (Math.abs(materialDiff) > 200) {
    console.log(`📊 Material: ${aiColor} ${aiMaterial} vs ${opponentColor} ${opponentMaterial} (diff: ${materialDiff})`);
  }
  
  // Advanced positional and strategic evaluation
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.position && piece.position.length === 2) {
      const [y, x] = piece.position;
      
      // Center control bonus
      if (CENTER_SQUARES.some(([cy, cx]) => cy === y && cx === x)) {
        score += 30; // Increased bonus for center control
      }
      
      // Extended center bonus (nearby squares)
      if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
        score += 10; // Smaller bonus for extended center
      }
      
      // Piece development bonus (encourage moving from starting positions)
      if (piece.hasMoved) {
        score += 15; // Bonus for developed pieces
      }
      
      // Pawn advancement bonus
      if (piece.type === 'pawn') {
        const advancementRank = aiColor === 'white' ? 7 - y : y;
        score += 10 * advancementRank; // Stronger bonus for advanced pawns
        
        // Passed pawn bonus (simplified check)
        if (advancementRank >= 5) {
          score += 20; // Extra bonus for far advanced pawns
        }
      }
      
      // Knight outpost bonus (knights in strong positions)
      if (piece.type === 'knight') {
        if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
          score += 25; // Knights are strong in the center
        }
        // Knight on rim penalty
        if (x === 0 || x === 7 || y === 0 || y === 7) {
          score -= 10; // Knights on the rim are less effective
        }
      }
      
      // Bishop positioning
      if (piece.type === 'bishop') {
        // Bishop pair bonus
        const bishopCount = gameState.piecePositions[aiColor].filter(p => p.type === 'bishop').length;
        if (bishopCount >= 2) {
          score += 25; // Bishop pair bonus
        }
        // Long diagonal bonus
        if ((x === y) || (x + y === 7)) {
          score += 15; // Bonus for bishops on long diagonals
        }
      }
      
      // Rook positioning
      if (piece.type === 'rook') {
        // Rook on open file bonus (simplified)
        const pawnOnFile = gameState.piecePositions[aiColor].some(p => 
          p.type === 'pawn' && p.position && p.position[1] === x
        );
        if (!pawnOnFile) {
          score += 20; // Bonus for rook on semi-open file
        }
        
        // Rook on 7th rank bonus
        const seventhRank = aiColor === 'white' ? 1 : 6;
        if (y === seventhRank) {
          score += 15; // Bonus for rook on 7th rank
        }
      }
      
      // Queen positioning
      if (piece.type === 'queen') {
        // Early queen development penalty
        if (!piece.hasMoved && gameState.history.length < 10) {
          // Check if other pieces are developed
          const developedPieces = gameState.piecePositions[aiColor].filter(p => 
            p.hasMoved && (p.type === 'knight' || p.type === 'bishop')
          ).length;
          if (developedPieces < 2) {
            score -= 30; // Penalty for early queen development
          }
        }
      }
    }
  });
  
  // King safety evaluation
  const aiKing = gameState.piecePositions[aiColor].find(p => p.type === 'king');
  if (aiKing && aiKing.position && aiKing.position.length === 2) {
    const [ky, kx] = aiKing.position;
    
    // Castling bonus
    if (aiKing.hasMoved === false) {
      score += 20; // Bonus for uncastled king (potential to castle)
    } else {
      // King safety after castling
      if ((aiColor === 'white' && ky === 7 && (kx === 2 || kx === 6)) ||
          (aiColor === 'black' && ky === 0 && (kx === 2 || kx === 6))) {
        score += 30; // Bonus for castled king position
      }
    }
    
    // King exposure penalty
    if (ky >= 2 && ky <= 5 && kx >= 2 && kx <= 5) {
      score -= 25; // Penalty for exposed king in center
    }
  }
  
  // Mobility and attack evaluation
  // Count possible moves (simplified mobility)
  let aiMobility = 0;
  let opponentMobility = 0;
  
  gameState.piecePositions[aiColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      aiMobility += getPieceMobility(piece.type);
    }
  });
  
  gameState.piecePositions[opponentColor].forEach(piece => {
    if (piece.type !== 'empty' && piece.type !== 'king') {
      opponentMobility += getPieceMobility(piece.type);
    }
  });
  
  score += (aiMobility - opponentMobility) * 2; // Mobility bonus
  
  // Add small randomness to prevent identical evaluations (reduced for harder play)
  score += (Math.random() - 0.5) * 2; // Small random factor
  
  // Game phase consideration
  const totalPieces = gameState.piecePositions[aiColor].length + gameState.piecePositions[opponentColor].length;
  if (totalPieces < 16) { // Endgame phase
    // In endgame, king activity is important
    const aiKing = gameState.piecePositions[aiColor].find(p => p.type === 'king');
    if (aiKing && aiKing.position && aiKing.position.length === 2) {
      const [ky, kx] = aiKing.position;
      // Bonus for active king in endgame
      const kingActivity = Math.abs(3.5 - ky) + Math.abs(3.5 - kx);
      score += (7 - kingActivity) * 5; // King closer to center gets bonus
    }
    
    // Pawn promotion threats in endgame
    gameState.piecePositions[aiColor].forEach(piece => {
      if (piece.type === 'pawn' && piece.position && piece.position.length === 2) {
        const [py] = piece.position;
        const promotionRank = aiColor === 'white' ? 0 : 7;
        const distance = Math.abs(py - promotionRank);
        if (distance <= 2) {
          score += 50 / Math.max(distance, 1); // Strong bonus for pawns close to promotion
        }
      }
    });
  }
  
  return score;
}

// Helper function to estimate piece mobility
function getPieceMobility(pieceType: string): number {
  switch (pieceType) {
    case 'pawn': return 2;
    case 'knight': return 8;
    case 'bishop': return 14;
    case 'rook': return 14;
    case 'queen': return 27;
    default: return 0;
  }
}