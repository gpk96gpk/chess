import { GameStateType, PieceType, Position } from '../types/clientTypes';
import { evaluatePosition } from './evaluation';
import { getBookMove } from './openingBook';

export type AIDifficulty = 'easy' | 'medium' | 'hard';
export interface AIMoveResult {
  piece: PieceType;
  from: Position;
  to: Position;
}

// Basic move generation without complex validation to avoid infinite recursion
function getSimpleLegalMoves(gameState: GameStateType, color: 'white' | 'black'): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  const pieces = gameState.piecePositions[color];
  
  if (!pieces) return moves;
  
  pieces.forEach(piece => {
    if (!piece.position || piece.type === 'empty') return;
    
    const pieceMoves = getMovesForPiece(piece as PieceType, gameState);
    moves.push(...pieceMoves);
  });
  
  return moves;
}

function getMovesForPiece(piece: PieceType, gameState: GameStateType): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  
  // Ensure piece has a valid position
  if (!piece.position || piece.position.length !== 2) return moves;
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(piece, gameState));
      break;
    case 'rook':
      moves.push(...getSlidingMoves(piece, gameState, [[0, 1], [0, -1], [1, 0], [-1, 0]]));
      break;
    case 'knight':
      moves.push(...getKnightMoves(piece, gameState));
      break;
    case 'bishop':
      moves.push(...getSlidingMoves(piece, gameState, [[1, 1], [1, -1], [-1, 1], [-1, -1]]));
      break;
    case 'queen':
      moves.push(...getSlidingMoves(piece, gameState, [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]));
      break;
    case 'king':
      moves.push(...getKingMoves(piece, gameState));
      break;
  }
  
  return moves;
}

function getPawnMoves(piece: PieceType, gameState: GameStateType): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  
  if (!piece.position || piece.position.length !== 2) return moves;
  
  const [row, col] = piece.position as [number, number];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // Forward move
  const newRow = row + direction;
  if (newRow >= 0 && newRow < 8 && gameState.board[newRow][col].type === 'empty') {
    moves.push({ piece, from: [row, col], to: [newRow, col] });
    
    // Double move from starting position
    if (row === startRow && newRow + direction >= 0 && newRow + direction < 8 && 
        gameState.board[newRow + direction][col].type === 'empty') {
      moves.push({ piece, from: [row, col], to: [newRow + direction, col] });
    }
  }
  
  // Capture moves
  for (const deltaCol of [-1, 1]) {
    const newCol = col + deltaCol;
    if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
      const target = gameState.board[newRow][newCol];
      if (target.type !== 'empty' && target.color !== piece.color) {
        moves.push({ piece, from: [row, col], to: [newRow, newCol] });
      }
    }
  }
  
  return moves;
}

function getSlidingMoves(piece: PieceType, gameState: GameStateType, directions: number[][]): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  
  if (!piece.position || piece.position.length !== 2) return moves;
  
  const [row, col] = piece.position as [number, number];
  
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

function getKnightMoves(piece: PieceType, gameState: GameStateType): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  
  if (!piece.position || piece.position.length !== 2) return moves;
  
  const [row, col] = piece.position as [number, number];
  
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

function getKingMoves(piece: PieceType, gameState: GameStateType): AIMoveResult[] {
  const moves: AIMoveResult[] = [];
  
  if (!piece.position || piece.position.length !== 2) return moves;
  
  const [row, col] = piece.position as [number, number];
  
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

// Clone game state (deep copy)
function cloneGameState(gameState: GameStateType): GameStateType {
  return JSON.parse(JSON.stringify(gameState));
}

// Apply move to a game state (simplified version)
function applyMoveToState(gameState: GameStateType, move: AIMoveResult): void {
  const { piece, from, to } = move;
  
  // Ensure valid positions
  if (!from || from.length !== 2 || !to || to.length !== 2) return;
  
  const [fromRow, fromCol] = from as [number, number];
  const [toRow, toCol] = to as [number, number];
  
  // Clear source square
  gameState.board[fromRow][fromCol] = { 
    type: 'empty', 
    color: 'none', 
    position: from,
    hasMoved: false 
  };
  
  // Update destination square
  gameState.board[toRow][toCol] = {
    ...piece,
    position: to,
    hasMoved: true
  };
  
  // Switch turn
  gameState.turn = gameState.turn === 'white' ? 'black' : 'white';
}

export async function getAIMove(
  gameState: GameStateType, 
  difficulty: AIDifficulty
): Promise<AIMoveResult | null> {
  // Add thinking time based on difficulty
  const thinkingTime = difficulty === 'easy' ? 500 : difficulty === 'medium' ? 1000 : 1500;
  
  // Try opening book first for early game moves (first 8 moves)
  if (gameState.history.length < 8) {
    const bookMove = getBookMove(gameState);
    if (bookMove) {
      console.log('Using opening book move');
      // Still add a small delay for opening moves
      await new Promise(resolve => setTimeout(resolve, 300));
      return bookMove;
    }
  }
  
  const aiColor = gameState.turn as 'white' | 'black';
  if (!aiColor || (aiColor !== 'white' && aiColor !== 'black')) {
    console.error('Invalid AI color:', aiColor);
    return null;
  }
  
  // Add thinking delay
  await new Promise(resolve => setTimeout(resolve, thinkingTime));
  
  switch(difficulty) {
    case 'easy':
      return getRandomMoveAntiRepetition(gameState, aiColor);
    case 'medium':
      return getBestMoveOneDepthAntiRepetition(gameState, aiColor);
    case 'hard':
      return getMinimaxMoveAntiRepetition(gameState, aiColor, 4); // Increased depth for stronger play
    default:
      return getRandomMoveAntiRepetition(gameState, aiColor);
  }
}

// Helper function to check if a move would repeat a recent position
function isRepetitiveMove(gameState: GameStateType, move: AIMoveResult): boolean {
  if (gameState.history.length < 4) return false; // Need at least 4 moves to detect repetition
  
  // Check if this move would reverse the last move
  const lastMove = gameState.history[gameState.history.length - 1];
  if (lastMove && 
      move.from[0] === lastMove.to[0] && move.from[1] === lastMove.to[1] &&
      move.to[0] === lastMove.from[0] && move.to[1] === lastMove.from[1]) {
    return true;
  }
  
  // Check for 3-fold repetition pattern (simple version)
  const recentMoves = gameState.history.slice(-6); // Look at last 6 moves
  let repetitionCount = 0;
  
  for (let i = 0; i < recentMoves.length; i += 2) {
    const move1 = recentMoves[i];
    const move2 = recentMoves[i + 1];
    
    if (move1 && move2 &&
        move.from[0] === move1.from[0] && move.from[1] === move1.from[1] &&
        move.to[0] === move1.to[0] && move.to[1] === move1.to[1]) {
      repetitionCount++;
    }
  }
  
  return repetitionCount >= 2; // Avoid if we've seen this move pattern twice recently
}

function getRandomMoveAntiRepetition(gameState: GameStateType, aiColor: 'white' | 'black'): AIMoveResult | null {
  const allLegalMoves = getSimpleLegalMoves(gameState, aiColor);
  
  if (allLegalMoves.length === 0) return null;
  
  // Filter out repetitive moves
  const nonRepetitiveMoves = allLegalMoves.filter(move => !isRepetitiveMove(gameState, move));
  
  // If we have non-repetitive moves, prefer them
  const movesToChooseFrom = nonRepetitiveMoves.length > 0 ? nonRepetitiveMoves : allLegalMoves;
  
  const randomIndex = Math.floor(Math.random() * movesToChooseFrom.length);
  return movesToChooseFrom[randomIndex];
}

function getBestMoveOneDepthAntiRepetition(gameState: GameStateType, aiColor: 'white' | 'black'): AIMoveResult | null {
  const allMoves = getSimpleLegalMoves(gameState, aiColor);
  
  if (allMoves.length === 0) return null;
  
  let bestMove = allMoves[0];
  let bestScore = -Infinity;
  
  for (const move of allMoves) {
    const newState = cloneGameState(gameState);
    applyMoveToState(newState, move);
    
    let score = evaluatePosition(newState, aiColor);
    
    // Penalize repetitive moves
    if (isRepetitiveMove(gameState, move)) {
      score -= 50; // Significant penalty for repetitive moves
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function getMinimaxMoveAntiRepetition(gameState: GameStateType, aiColor: 'white' | 'black', maxDepth: number): AIMoveResult | null {
  const moves = getSimpleLegalMoves(gameState, aiColor);
  
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];
  
  let bestMove = moves[0];
  let bestScore = -Infinity;
  
  for (const move of moves) {
    const newState = cloneGameState(gameState);
    applyMoveToState(newState, move);
    
    let score = minimax(newState, maxDepth - 1, -Infinity, Infinity, false, aiColor);
    
    // Penalize repetitive moves more heavily in hard mode
    if (isRepetitiveMove(gameState, move)) {
      score -= 100; // Heavy penalty for repetitive moves in hard mode
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function minimax(
  gameState: GameStateType, 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean,
  aiColor: 'white' | 'black'
): number {
  // Base case: leaf node or depth limit reached
  if (depth === 0) {
    return evaluatePosition(gameState, aiColor);
  }
  
  const currentColor = gameState.turn as 'white' | 'black';
  if (!currentColor || (currentColor !== 'white' && currentColor !== 'black')) {
    return evaluatePosition(gameState, aiColor);
  }
  
  const moves = getSimpleLegalMoves(gameState, currentColor);
  
  // Check for game end
  if (moves.length === 0) {
    return isMaximizing ? -1000 : 1000;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newGameState = cloneGameState(gameState);
      applyMoveToState(newGameState, move);
      
      const eval_ = minimax(newGameState, depth - 1, alpha, beta, false, aiColor);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newGameState = cloneGameState(gameState);
      applyMoveToState(newGameState, move);
      
      const eval_ = minimax(newGameState, depth - 1, alpha, beta, true, aiColor);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}
