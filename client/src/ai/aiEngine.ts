import { GameStateType, PieceType, Position } from '../types/clientTypes';
import validMoves from '../gameLogic/validMoves';
import { evaluatePosition } from './evaluation';
import { getBookMove } from './openingBook';

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
  // Try opening book first for early game moves (first 8 moves)
  if (gameState.history.length < 8) {
    const bookMove = getBookMove(gameState);
    if (bookMove) {
      console.log('Using opening book move');
      return bookMove;
    }
  }
  
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

// Rest of your AI implementation...
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
  const allPieces = gameState.piecePositions[aiColor];
  const allLegalMoves: AIMoveResult[] = [];
  
  allPieces.forEach(piece => {
    if (!piece.position || piece.type === 'empty') return;
    
    const moves = validMoves(
      piece as PieceType,
      piece.position,
      gameState,
      aiColor === 'black' ? 1 : 2,
      piece.position
    );
    
    let validPositions: Position[] = [];
    if (Array.isArray(moves)) {
      validPositions = moves;
    } else if (moves && 'moves' in moves) {
      validPositions = moves.moves || [];
    }
    
    validPositions.forEach(movePos => {
      allLegalMoves.push({
        piece: piece as PieceType,
        from: piece.position,
        to: movePos
      });
    });
  });
  
  return allLegalMoves;
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
}

// Minimax implementation
async function getMinimaxMove(gameState: GameStateType): Promise<AIMoveResult> {
  const depth = 3; // Search 3 moves ahead
  return findBestMove(gameState, depth);
}

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
    return evaluatePosition(gameState, isMaximizing ? 'white' : 'black');
  }
  
  const currentColor = gameState.turn;
  const moves = getAllLegalMoves(gameState, currentColor);
  
  // Check for game end
  if (moves.length === 0) {
    // Return a very negative/positive score based on whose turn it is
    return isMaximizing ? -1000 : 1000;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newGameState = cloneGameState(gameState);
      applyMoveToState(newGameState, move);
      newGameState.turn = currentColor === 'white' ? 'black' : 'white';
      
      const eval_ = minimax(newGameState, depth - 1, alpha, beta, false);
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
      newGameState.turn = currentColor === 'white' ? 'black' : 'white';
      
      const eval_ = minimax(newGameState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
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
  
  const isMaximizing = gameState.turn === 'white';
  let bestMove = moves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;
  
  for (const move of moves) {
    const newGameState = cloneGameState(gameState);
    applyMoveToState(newGameState, move);
    newGameState.turn = gameState.turn === 'white' ? 'black' : 'white';
    
    const score = minimax(newGameState, depth - 1, -Infinity, Infinity, !isMaximizing);
    
    if ((isMaximizing && score > bestScore) || (!isMaximizing && score < bestScore)) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}