import { GameStateType, PieceType, Position } from '../types/clientTypes';

export interface SimpleMove {
  piece: PieceType;
  from: Position;
  to: Position;
}

// Basic move generation without complex validation to avoid infinite recursion
export function getBasicLegalMoves(gameState: GameStateType, color: 'white' | 'black'): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const pieces = gameState.piecePositions[color];
  
  if (!pieces) return moves;
  
  pieces.forEach(piece => {
    if (!piece.position || piece.type === 'empty') return;
    
    const pieceMoves = getBasicMovesForPiece(piece, gameState, color);
    moves.push(...pieceMoves);
  });
  
  return moves;
}

function getBasicMovesForPiece(piece: PieceType, gameState: GameStateType, color: 'white' | 'black'): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(piece, gameState, color));
      break;
    case 'rook':
      moves.push(...getRookMoves(piece, gameState));
      break;
    case 'knight':
      moves.push(...getKnightMoves(piece, gameState));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(piece, gameState));
      break;
    case 'queen':
      moves.push(...getQueenMoves(piece, gameState));
      break;
    case 'king':
      moves.push(...getKingMoves(piece, gameState));
      break;
  }
  
  return moves;
}

function getPawnMoves(piece: PieceType, gameState: GameStateType, color: 'white' | 'black'): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  
  // Forward move
  const newRow = row + direction;
  if (newRow >= 0 && newRow < 8 && gameState.board[newRow][col].type === 'empty') {
    moves.push({ piece, from: [row, col], to: [newRow, col] });
    
    // Double move from starting position
    if (row === startRow && gameState.board[newRow + direction] && gameState.board[newRow + direction][col].type === 'empty') {
      moves.push({ piece, from: [row, col], to: [newRow + direction, col] });
    }
  }
  
  // Capture moves
  for (const deltaCol of [-1, 1]) {
    const newCol = col + deltaCol;
    if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
      const target = gameState.board[newRow][newCol];
      if (target.type !== 'empty' && target.color !== color) {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      }
    }
  }
  
  return moves;
}

function getRookMoves(piece: PieceType, gameState: GameStateType): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  
  // Horizontal and vertical directions
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      
      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
      
      const target = gameState.board[newRow][newCol];
      if (target.type === 'empty') {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      } else {
        if (target.color !== piece.color) {
          moves.push({ piece, from: [row, col], to: [newRow, newCol] });
        }
        break;
      }
    }
  }
  
  return moves;
}

function getKnightMoves(piece: PieceType, gameState: GameStateType): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dRow, dCol] of knightMoves) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = gameState.board[newRow][newCol];
      if (target.type === 'empty' || target.color !== piece.color) {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      }
    }
  }
  
  return moves;
}

function getBishopMoves(piece: PieceType, gameState: GameStateType): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  
  // Diagonal directions
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      
      if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
      
      const target = gameState.board[newRow][newCol];
      if (target.type === 'empty') {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      } else {
        if (target.color !== piece.color) {
          moves.push({ piece, from: [row, col], to: [newRow, newCol] });
        }
        break;
      }
    }
  }
  
  return moves;
}

function getQueenMoves(piece: PieceType, gameState: GameStateType): SimpleMove[] {
  return [
    ...getRookMoves(piece, gameState),
    ...getBishopMoves(piece, gameState)
  ];
}

function getKingMoves(piece: PieceType, gameState: GameStateType): SimpleMove[] {
  const moves: SimpleMove[] = [];
  const [row, col] = piece.position;
  
  // All 8 directions
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = gameState.board[newRow][newCol];
      if (target.type === 'empty' || target.color !== piece.color) {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      }
    }
  }
  
  return moves;
}
