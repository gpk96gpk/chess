import { GameStateType, Position } from '../types/clientTypes';

// Simplified representation - in a real implementation you might 
// use FEN strings or board hashes as keys
export interface OpeningMove {
  from: Position;
  to: Position;
}

export const openingBook: Record<string, OpeningMove[]> = {
  // Starting position
  'initial': [
    { from: [6, 4], to: [4, 4] }, // e4
    { from: [6, 3], to: [4, 3] }, // d4
    { from: [7, 1], to: [5, 2] }, // Nf3
  ],
  
  // After 1.e4
  'e4': [
    { from: [1, 4], to: [3, 4] }, // e5
    { from: [1, 2], to: [3, 2] }, // c5 (Sicilian)
  ],
  
  // After 1.d4
  'd4': [
    { from: [1, 3], to: [3, 3] }, // d5
    { from: [1, 6], to: [3, 6] }, // Nf6 (Indian defense)
  ],
  
  // Add more common openings as needed
};

// Get board signature for lookup
export function getBoardSignature(gameState: GameStateType): string {
  // For simplicity, use move history length
  if (gameState.history.length === 0) return 'initial';
  
  // Otherwise use the last move
  const lastMove = gameState.history[gameState.history.length - 1];
  if (lastMove.from[0] === 6 && lastMove.from[1] === 4 && 
      lastMove.to[0] === 4 && lastMove.to[1] === 4) {
    return 'e4';
  }
  if (lastMove.from[0] === 6 && lastMove.from[1] === 3 && 
      lastMove.to[0] === 4 && lastMove.to[1] === 3) {
    return 'd4';
  }
  
  // No match in book
  return '';
}

export interface AIMoveResult {
  piece: any;
  from: Position;
  to: Position;
}

export function getBookMove(gameState: GameStateType): AIMoveResult | null {
  const signature = getBoardSignature(gameState);
  if (!signature || !openingBook[signature]) return null;
  
  const possibleMoves = openingBook[signature];
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  const bookMove = possibleMoves[randomIndex];
  
  // Convert to AIMoveResult format
  const { from, to } = bookMove;
  const piece = gameState.board[from[0]][from[1]];
  
  return {
    piece,
    from,
    to
  };
}