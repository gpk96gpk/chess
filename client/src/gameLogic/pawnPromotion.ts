import { GameStateType, PieceType, Position, PieceColor, PieceNameWithoutNone } from "../types/clientTypes";

/**
 * Checks if a pawn is eligible for promotion (has reached the opposite end of the board)
 */
function isPawnPromotion(piece: PieceType, toPosition: Position): boolean {
  if (piece.type !== 'pawn') {
    return false;
  }
  
  const [y] = toPosition;
  
  // White pawns promote at row 0, black pawns at row 7
  return (piece.color === 'white' && y === 0) || (piece.color === 'black' && y === 7);
}

/**
 * Handles pawn promotion and updates game state
 * @param gameState Current game state
 * @param piece The pawn being promoted
 * @param toPosition Position where the pawn is being promoted
 * @param promoteTo Type of piece to promote to
 */
function handlePawnPromotion(
  gameState: GameStateType,
  piece: PieceType, 
  toPosition: Position,
  promoteTo: PieceNameWithoutNone = 'queen'
): GameStateType {
  // Validate that this is actually a valid promotion
  if (!isPawnPromotion(piece, toPosition) || piece.type !== 'pawn') {
    console.log("Invalid promotion attempt");
    return gameState;
  }
  
  console.log(`Promoting pawn at ${toPosition} to ${promoteTo}`);
  
  // Deep copy the game state to avoid mutations
  const newGameState: GameStateType = JSON.parse(JSON.stringify(gameState));
  
  // Create promoted piece
  const promotedPiece: PieceType = {
    ...piece,
    type: promoteTo,
    position: toPosition,
    hasMoved: true
  };
  
  // Update board
  const [toY, toX] = toPosition;
  newGameState.board[toY!][toX!] = promotedPiece;
  
  // Update piece positions
  const color = piece.color as PieceColor;
  const pieceIndex = newGameState.piecePositions[color].findIndex(
    p => p.id === piece.id || p.index === piece.index
  );
  
  if (pieceIndex !== -1) {
    newGameState.piecePositions[color][pieceIndex] = {
      ...newGameState.piecePositions[color][pieceIndex],
      type: promoteTo,
      position: toPosition
    };
  }
  
  // Create a move record for history
  const move = {
    piece: promotedPiece,
    from: piece.position,
    to: toPosition,
    board: newGameState.board,
    turn: color,
    turnNumber: newGameState.history.length + 1,
    isPromotion: true,
    promotedTo: promoteTo
  };
  
  // Add move to history
  newGameState.history.push(move);
  
  return newGameState;
}

/**
 * Gets valid promotion choices
 * @returns Array of valid piece types for pawn promotion
 */
function getPromotionChoices(): PieceNameWithoutNone[] {
  return ['queen', 'rook', 'bishop', 'knight'];
}

export default {
  isPawnPromotion,
  handlePawnPromotion,
  getPromotionChoices
};