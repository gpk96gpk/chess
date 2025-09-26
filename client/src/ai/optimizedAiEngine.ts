import { GameStateType, PieceType, Position } from '../types/clientTypes';
import { evaluatePosition } from './evaluation';
import { getBookMove } from './openingBook';

// Function to detect if AI king is in check and find threatening pieces
function findThreateningPieces(gameState: GameStateType, aiColor: 'white' | 'black'): PieceType[] {
  const threateningPieces: any[] = [];
  const opponentColor = aiColor === 'white' ? 'black' : 'white';
  const aiKingPos = gameState.kingPositions[aiColor];
  
  console.log(`🔍 THREAT DETECTION: AI Color = ${aiColor}, King position = [${aiKingPos}]`);
  
  if (!aiKingPos || aiKingPos.length !== 2) {
    console.log(`❌ THREAT DETECTION: Invalid king position for ${aiColor}`);
    return threateningPieces;
  }
  
  // Get opponent pieces from the board directly instead of piecePositions
  const board = gameState.board;
  console.log(`🔍 THREAT DETECTION: Scanning board for ${opponentColor} pieces`);
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      
      if (!piece || piece.type === 'empty' || piece.color !== opponentColor) continue;
      
      console.log(`🔍 Checking ${piece.type} (${piece.color}) at [${row},${col}] vs AI king at [${aiKingPos}]`);
      
      // Create piece with proper position
      const pieceForCheck = {
        ...piece,
        position: [row, col] as Position
      };
      
      if (canPieceAttackSquare(pieceForCheck, aiKingPos, gameState)) {
        console.log(`⚠️ THREAT FOUND: ${piece.type} at [${row},${col}] can attack AI king!`);
        threateningPieces.push({
          ...piece,
          position: [row, col]
        });
      }
    }
  }
  
  console.log(`🎯 THREAT DETECTION RESULT: Found ${threateningPieces.length} threatening pieces`);
  return threateningPieces;
}

// Function to find moves that capture threatening pieces
function getCaptureThreateningMoves(gameState: GameStateType, aiColor: 'white' | 'black', threateningPieces: PieceType[]): AIMoveResult[] {
  const captureMoves: AIMoveResult[] = [];
  const allMoves = getSimpleLegalMoves(gameState, aiColor);
  
  console.log(`🔍 Checking ${allMoves.length} AI moves to see which capture ${threateningPieces.length} threatening pieces`);
  
  for (const move of allMoves) {
    if (!move.to || move.to.length !== 2) continue;
    
    // Check if this move captures a threatening piece
    for (const threateningPiece of threateningPieces) {
      if (!threateningPiece.position || threateningPiece.position.length !== 2) continue;
      
      const [threatRow, threatCol] = threateningPiece.position as [number, number];
      const [moveRow, moveCol] = move.to as [number, number];
      
      if (threatRow === moveRow && threatCol === moveCol) {
        console.log(`💥 Found capture move: ${move.piece.type} from [${move.from}] can capture ${threateningPiece.type} at [${move.to}]`);
        captureMoves.push(move);
        break;
      }
    }
  }
  
  console.log(`⚔️ Total capture moves found: ${captureMoves.length}`);
  return captureMoves;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';
export interface AIMoveResult {
  piece: PieceType;
  from: Position;
  to: Position;
}

// Validate that a move doesn't put own king in check
function isMoveLegal(move: AIMoveResult, gameState: GameStateType, color: 'white' | 'black'): boolean {
  // Create a copy of the game state to simulate the move
  const tempGameState = JSON.parse(JSON.stringify(gameState));
  const { piece, from, to } = move;
  
  // Validate positions exist and are valid
  if (!from || from.length !== 2 || !to || to.length !== 2) return false;
  
  const [fromRow, fromCol] = from as [number, number];
  const [toRow, toCol] = to as [number, number];
  
  // Validate coordinates are in bounds
  if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
      toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
    return false;
  }
  
  // Make the move on the temporary board
  tempGameState.board[toRow][toCol] = { ...piece, position: to, hasMoved: true };
  tempGameState.board[fromRow][fromCol] = { type: 'empty', color: 'none', hasMoved: false, position: [] };
  
  // Update king position if king moved
  if (piece.type === 'king') {
    tempGameState.kingPositions[color] = to;
  }
  
  // Update piece positions array
  if (tempGameState.piecePositions[color]) {
    const pieceIndex = tempGameState.piecePositions[color].findIndex((p: PieceType) => 
      p.position && p.position.length === 2 && p.position[0] === fromRow && p.position[1] === fromCol && p.type === piece.type
    );
    if (pieceIndex !== -1) {
      tempGameState.piecePositions[color][pieceIndex].position = to;
      tempGameState.piecePositions[color][pieceIndex].hasMoved = true;
    }
  }
  
  // Check if this move puts own king in check
  const kingPos = tempGameState.kingPositions[color];
  if (!kingPos || kingPos.length !== 2) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  const opponentPieces = tempGameState.piecePositions[opponentColor] || [];
  
  // Simple check: see if any opponent piece can attack our king
  for (const opponentPiece of opponentPieces) {
    if (!opponentPiece.position || opponentPiece.type === 'empty') continue;
    
    if (canPieceAttackSquare(opponentPiece, kingPos, tempGameState)) {
      return false; // This move would put our king in check
    }
  }
  
  return true;
}

// Helper function to check if a piece can attack a square
function canPieceAttackSquare(piece: PieceType, targetSquare: Position, gameState: GameStateType): boolean {
  if (!piece.position || piece.position.length !== 2 || !targetSquare || targetSquare.length !== 2) {
    console.log(`❌ Attack check failed: Invalid positions - piece at [${piece.position}], target at [${targetSquare}]`);
    return false;
  }
  
  const [pieceRow, pieceCol] = piece.position as [number, number];
  const [targetRow, targetCol] = targetSquare as [number, number];
  
  console.log(`🎯 Checking if ${piece.type} (${piece.color}) at [${pieceRow},${pieceCol}] can attack [${targetRow},${targetCol}]`);
  
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const attackRows = [pieceRow + direction];
      const attackCols = [pieceCol - 1, pieceCol + 1];
      const canAttack = attackRows.includes(targetRow) && attackCols.includes(targetCol);
      console.log(`   Pawn attack check: direction=${direction}, attackRows=[${attackRows}], attackCols=[${attackCols}], result=${canAttack}`);
      return canAttack;
    }
    case 'rook': {
      const sameLine = (pieceRow === targetRow || pieceCol === targetCol);
      const pathClear = sameLine ? isPathClear(piece.position, targetSquare, gameState) : false;
      const canAttack = sameLine && pathClear;
      console.log(`   Rook attack check: sameLine=${sameLine}, pathClear=${pathClear}, result=${canAttack}`);
      return canAttack;
    }
    case 'bishop': {
      const rowDiff = Math.abs(pieceRow - targetRow);
      const colDiff = Math.abs(pieceCol - targetCol);
      const diagonal = rowDiff === colDiff;
      const pathClear = diagonal ? isPathClear(piece.position, targetSquare, gameState) : false;
      const canAttack = diagonal && pathClear;
      console.log(`   Bishop attack check: diagonal=${diagonal} (rowDiff=${rowDiff}, colDiff=${colDiff}), pathClear=${pathClear}, result=${canAttack}`);
      return canAttack;
    }
    case 'queen': {
      const sameLine = (pieceRow === targetRow || pieceCol === targetCol);
      const diagonal = Math.abs(pieceRow - targetRow) === Math.abs(pieceCol - targetCol);
      const inRange = sameLine || diagonal;
      const pathClear = inRange ? isPathClear(piece.position, targetSquare, gameState) : false;
      const canAttack = inRange && pathClear;
      console.log(`   Queen attack check: sameLine=${sameLine}, diagonal=${diagonal}, pathClear=${pathClear}, result=${canAttack}`);
      return canAttack;
    }
    case 'knight': {
      const rowDiff = Math.abs(pieceRow - targetRow);
      const colDiff = Math.abs(pieceCol - targetCol);
      const canAttack = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      console.log(`   Knight attack check: rowDiff=${rowDiff}, colDiff=${colDiff}, result=${canAttack}`);
      return canAttack;
    }
    case 'king': {
      const rowDiff = Math.abs(pieceRow - targetRow);
      const colDiff = Math.abs(pieceCol - targetCol);
      const canAttack = rowDiff <= 1 && colDiff <= 1;
      console.log(`   King attack check: rowDiff=${rowDiff}, colDiff=${colDiff}, result=${canAttack}`);
      return canAttack;
    }
    default:
      console.log(`   Unknown piece type: ${piece.type}`);
      return false;
  }
}

// Helper function to check if path is clear for sliding pieces
function isPathClear(from: Position, to: Position, gameState: GameStateType): boolean {
  if (!from || from.length !== 2 || !to || to.length !== 2) return false;
  
  const [fromRow, fromCol] = from as [number, number];
  const [toRow, toCol] = to as [number, number];
  
  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
  
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  
  while (currentRow !== toRow || currentCol !== toCol) {
    if (currentRow < 0 || currentRow >= 8 || currentCol < 0 || currentCol >= 8) return false;
    if (gameState.board[currentRow][currentCol].type !== 'empty') {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
}

// Basic move generation with legal move validation
function getSimpleLegalMoves(gameState: GameStateType, color: 'white' | 'black'): AIMoveResult[] {
  const allMoves: AIMoveResult[] = [];
  const pieces = gameState.piecePositions[color];
  
  if (!pieces) return allMoves;
  
  // Generate all possible moves
  pieces.forEach(piece => {
    if (!piece.position || piece.type === 'empty') return;
    
    const pieceMoves = getMovesForPiece(piece as PieceType, gameState);
    allMoves.push(...pieceMoves);
  });
  
  // Filter out illegal moves (those that put king in check)
  const legalMoves = allMoves.filter(move => isMoveLegal(move, gameState, color));
  
  console.log(`🔍 AI Generated ${allMoves.length} moves, ${legalMoves.length} are legal for ${color}`);
  
  // Debug: Log some moves to see what's being generated
  if (legalMoves.length > 0) {
    console.log('🎯 Sample legal moves:', legalMoves.slice(0, 5).map(move => 
      `${move.piece.type} from [${move.from}] to [${move.to}]`
    ));
    
    // Check for captures specifically
    const captures = legalMoves.filter(move => {
      if (!move.to || move.to.length !== 2) return false;
      const [toRow, toCol] = move.to as [number, number];
      return gameState.board[toRow][toCol].type !== 'empty';
    });
    
    if (captures.length > 0) {
      console.log('💥 Capture moves available:', captures.map(move => {
        if (!move.to || move.to.length !== 2) return 'invalid move';
        const [toRow, toCol] = move.to as [number, number];
        return `${move.piece.type} captures ${gameState.board[toRow][toCol].type} at [${move.to}]`;
      }));
    }
  }
  
  return legalMoves;
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
  
  // Check if this is a capture
  const capturedPiece = gameState.board[toRow][toCol];
  const isCapture = capturedPiece.type !== 'empty';
  
  // Update piecePositions arrays
  if (gameState.piecePositions) {
    // Remove captured piece from opponent's pieces
    if (isCapture && capturedPiece.color !== 'none' && (capturedPiece.color === 'white' || capturedPiece.color === 'black')) {
      const opponentColor = capturedPiece.color;
      if (gameState.piecePositions[opponentColor]) {
        // @ts-expect-error - Complex type inference issue with piecePositions
        gameState.piecePositions[opponentColor] = gameState.piecePositions[opponentColor].filter((p) => 
          !(p.position && p.position.length === 2 && p.position[0] === toRow && p.position[1] === toCol)
        );
      }
    }
    
    // Update moving piece's position
    if (piece.color !== 'none' && (piece.color === 'white' || piece.color === 'black')) {
      if (gameState.piecePositions[piece.color]) {
        const pieceToUpdate = gameState.piecePositions[piece.color].find((p) =>
          p.position && p.position.length === 2 && p.position[0] === fromRow && p.position[1] === fromCol && p.type === piece.type
        );
        if (pieceToUpdate) {
          pieceToUpdate.position = to;
          pieceToUpdate.hasMoved = true;
        }
      }
    }
  }
  
  // Update king positions if king moved
  if (piece.type === 'king' && gameState.kingPositions && piece.color !== 'none' && (piece.color === 'white' || piece.color === 'black')) {
    gameState.kingPositions[piece.color] = to;
  }
  
  // Clear source square
  gameState.board[fromRow][fromCol] = { 
    type: 'empty', 
    color: 'none', 
    position: [fromRow, fromCol],
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
  console.log(`🤖 AI MOVE REQUEST: Difficulty = ${difficulty}, AI Color = ${gameState.turn}`);
  
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
      console.log('🎲 Using EASY AI (random moves)');
      return getRandomMoveAntiRepetition(gameState, aiColor);
    case 'medium':
      console.log('🧠 Using MEDIUM AI (threat-aware one-depth)');
      return getBestMoveOneDepthAntiRepetition(gameState, aiColor);
    case 'hard':
      console.log('🔥 Using HARD AI (threat-aware minimax depth 4)');
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
  console.log(`💻 MEDIUM AI: Starting threat detection for ${aiColor} AI`);
  console.log(`💻 GameState king positions:`, gameState.kingPositions);
  console.log(`💻 GameState piece positions:`, gameState.piecePositions);
  
  // FIRST PRIORITY: Check if AI king is in check and prioritize capturing threatening pieces
  const threateningPieces = findThreateningPieces(gameState, aiColor);
  
  if (threateningPieces.length > 0) {
    console.log(`🚨 Medium AI: King in CHECK! Found ${threateningPieces.length} threatening pieces`);
    
    const captureMoves = getCaptureThreateningMoves(gameState, aiColor, threateningPieces);
    
    if (captureMoves.length > 0) {
      console.log(`⚔️ Medium AI: PRIORITIZING capture of threatening pieces!`);
      
      // Evaluate only the threat-capturing moves
      let bestMove = captureMoves[0];
      let bestScore = -Infinity;
      
      for (const move of captureMoves) {
        const newState = cloneGameState(gameState);
        applyMoveToState(newState, move);
        
        let score = evaluatePosition(newState, aiColor);
        score += 1000; // Massive bonus for capturing threats
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      
      return bestMove;
    }
  }

  // SECOND PRIORITY: Normal move evaluation
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
  // FIRST PRIORITY: Check if AI king is in check and prioritize capturing threatening pieces
  const threateningPieces = findThreateningPieces(gameState, aiColor);
  
  if (threateningPieces.length > 0) {
    console.log(`🚨 AI King in CHECK! Found ${threateningPieces.length} threatening pieces`);
    
    // Get all possible capture moves that eliminate threats
    const captureMoves = getCaptureThreateningMoves(gameState, aiColor, threateningPieces);
    
    if (captureMoves.length > 0) {
      console.log(`⚔️ Found ${captureMoves.length} moves to capture threatening pieces - PRIORITIZING THESE!`);
      
      // ONLY consider threat-capturing moves - evaluate them with minimax
      let bestMove = captureMoves[0];
      let bestScore = -Infinity;
      
      for (const move of captureMoves) {
        const newState = cloneGameState(gameState);
        applyMoveToState(newState, move);
        
        let score = minimax(newState, maxDepth - 1, -Infinity, Infinity, false, aiColor);
        
        // Massive bonus for capturing threatening pieces
        score += 1000;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      
      console.log(`🎯 AI choosing to capture threatening piece at [${bestMove.to}]`);
      return bestMove;
    } else {
      console.log(`🛡️ No direct captures available - must find other escape moves`);
    }
  }
  
  // SECOND PRIORITY: Normal move evaluation (only if not in check or no capture moves available)
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
