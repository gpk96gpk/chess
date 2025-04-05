import { GameStateType, Position, PieceType } from '../types/clientTypes';
import { evaluatePosition } from './aiEngine';
import validMoves from '../gameLogic/validMoves';
import { evaluatePosition } from './evaluation';


export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type AIMoveResult = {
  piece: PieceType;
  from: Position;
  to: Position;
};

export async function getAIMove(
  gameState: GameStateType, 
  difficulty: AIDifficulty
): Promise<AIMoveResult> {
  switch(difficulty) {
    case 'easy':
      return getRandomMove(gameState);
    case 'medium':
      return getBestMoveOneDepth(gameState);
    case 'hard':
      return await getMinimaxMove(gameState);
    default:
      return getRandomMove(gameState);
  }
}

function getRandomMove(gameState: GameStateType): AIMoveResult {
    const aiColor = gameState.turn;
    const allPieces = gameState.piecePositions[aiColor];
    
    // Collect all legal moves from all pieces
    const allLegalMoves: AIMoveResult[] = [];
    
    allPieces.forEach(piece => {
      // Skip empty positions or non-movable pieces
      if (!piece.position || piece.type === 'empty') return;
      
      // Use your existing validMoves function
      const moves = validMoves(
        piece as PieceType, 
        piece.position, 
        gameState, 
        aiColor === 'black' ? 1 : 2,
        piece.position
      );
      
      // Handle both return types from validMoves
      let validPositions: Position[] = [];
      if (Array.isArray(moves)) {
        validPositions = moves;
      } else if (moves && 'moves' in moves) {
        validPositions = moves.moves || [];
      }
      
      // Convert to AIMoveResult format
      validPositions.forEach(movePos => {
        allLegalMoves.push({
          piece: piece as PieceType,
          from: piece.position,
          to: movePos
        });
      });
    });
    
    // Return a random move, or null if no moves available
    if (allLegalMoves.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allLegalMoves.length);
    return allLegalMoves[randomIndex];
  }
  function getBestMoveOneDepth(gameState: GameStateType): AIMoveResult {
  const aiColor = gameState.turn;
  const allMoves = getAllLegalMoves(gameState, aiColor);
  
  if (allMoves.length === 0) return null;
  
  // Evaluate each move
  const evaluatedMoves = allMoves.map(move => {
    // Create a copy of the game state
    const newState = cloneGameState(gameState);
    
    // Apply the move to the copied state
    applyMoveToState(newState, move);
    
    // Evaluate the resulting position
    const score = evaluatePosition(newState, aiColor);
    
    return { move, score };
  });
  
  // Sort by score descending
  evaluatedMoves.sort((a, b) => b.score - a.score);
  
  // Return the best move
  return evaluatedMoves[0].move;
}

// Helper function to get all legal moves
function getAllLegalMoves(gameState: GameStateType, aiColor: 'white' | 'black'): AIMoveResult[] {
  // Reuse code from getRandomMove, but extracted as a separate function
  // ...similar to previous implementation
}

// Clone game state (deep copy)
function cloneGameState(gameState: GameStateType): GameStateType {
  return JSON.parse(JSON.stringify(gameState));
}

// Apply move to a game state
function applyMoveToState(gameState: GameStateType, move: AIMoveResult): void {
  const { piece, from, to } = move;
  
  // Clear source square
  gameState.board[from[0]][from[1]] = { 
    type: 'empty', 
    color: 'none', 
    position: from,
    hasMoved: false 
  };
  
  // Update destination square
  gameState.board[to[0]][to[1]] = {
    ...piece,
    position: to,
    hasMoved: true
  };
  
  // Update piece positions array
  const pieceIdx = gameState.piecePositions[piece.color].findIndex(
    p => p.position[0] === from[0] && p.position[1] === from[1]
  );
  
  if (pieceIdx !== -1) {
    gameState.piecePositions[piece.color][pieceIdx].position = to;
    gameState.piecePositions[piece.color][pieceIdx].hasMoved = true;
  }
  
  // Handle special cases like castling, en passant if needed
  // This would use your existing logic for special moves
}

// Add to the file


function getBestMoveOneDepth(gameState: GameStateType): AIMoveResult {
  const aiColor = gameState.turn;
  const allMoves = getAllLegalMoves(gameState, aiColor);
  
  if (allMoves.length === 0) return null;
  
  // Evaluate each move
  const evaluatedMoves = allMoves.map(move => {
    // Create a copy of the game state
    const newState = cloneGameState(gameState);
    
    // Apply the move to the copied state
    applyMoveToState(newState, move);
    
    // Evaluate the resulting position
    const score = evaluatePosition(newState, aiColor);
    
    return { move, score };
  });
  
  // Sort by score descending
  evaluatedMoves.sort((a, b) => b.score - a.score);
  
  // Return the best move
  return evaluatedMoves[0].move;
}

import { GameStateType, AIMoveResult } from './aiEngine';
import { evaluatePosition } from './evaluation';

// Minimax with alpha-beta pruning
function minimax(
  gameState: GameStateType, 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean
): number {
  // Base case: leaf node
  if (depth === 0) {
    return evaluatePosition(gameState, isMaximizing ? gameState.turn : (gameState.turn === 'white' ? 'black' : 'white'));
  }
  
  const currentColor = gameState.turn;
  const moves = getAllLegalMoves(gameState, currentColor);
  
  // Check for game end
  if (moves.length === 0) {
    // Check if it's checkmate or stalemate
    const inCheck = currentColor === 'white' 
      ? gameState.checkStatus.white 
      : gameState.checkStatus.black;
      
    if (inCheck) {
      // Checkmate, worst outcome for current player
      return isMaximizing ? -1000 - depth : 1000 + depth; // Add depth to prefer faster mates
    } else {
      // Stalemate
      return 0;
    }
  }
  
  // Sort moves by a quick evaluation for better alpha-beta performance
  moves.sort((a, b) => {
    const stateA = cloneGameState(gameState);
    const stateB = cloneGameState(gameState);
    applyMoveToState(stateA, a);
    applyMoveToState(stateB, b);
    
    const scoreA = evaluatePosition(stateA, currentColor);
    const scoreB = evaluatePosition(stateB, currentColor);
    
    return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
  });
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = cloneGameState(gameState);
      applyMoveToState(newState, move);
      newState.turn = newState.turn === 'white' ? 'black' : 'white';
      
      const evalScore = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = cloneGameState(gameState);
      applyMoveToState(newState, move);
      newState.turn = newState.turn === 'white' ? 'black' : 'white';
      
      const evalScore = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

// Find best move using minimax
function findBestMove(gameState: GameStateType, depth: number): AIMoveResult {
  const moves = getAllLegalMoves(gameState, gameState.turn);
  
  // Handle edge cases
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];
  
  let bestMove = moves[0];
  let bestScore = -Infinity;
  
  for (const move of moves) {
    const newState = cloneGameState(gameState);
    applyMoveToState(newState, move);
    newState.turn = newState.turn === 'white' ? 'black' : 'white';
    
    const moveScore = minimax(newState, depth - 1, -Infinity, Infinity, false);
    
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }
  
  return bestMove;
}

// Web worker entry point
self.onmessage = function(event) {
  const { gameState, depth } = event.data;
  const bestMove = findBestMove(gameState, depth || 3);
  self.postMessage(bestMove);
};

// Add to the file

import { getBookMove } from './openingBook';

// For Hard difficulty
async function getMinimaxMove(gameState: GameStateType): Promise<AIMoveResult> {
  // First check if we have a book move
  const bookMove = getBookMove(gameState);
  if (bookMove) return bookMove;
  
  // Create a web worker for heavy computation
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    
    worker.onmessage = (event) => {
      const bestMove = event.data;
      worker.terminate();
      resolve(bestMove);
    };
    
    // Start computation with depth 3
    worker.postMessage({ gameState, depth: 3 });
  });
}