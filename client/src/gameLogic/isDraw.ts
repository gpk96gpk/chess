import isStalemate from './isStalemate';
import isInsufficientMaterial from './isInsufficientMaterial';
import isThreefoldRepetition from './isThreefoldRepetition';
import isFivefoldRepetition from './isFivefoldRepetition';
import { GameStateType } from '../types/clientTypes';

function isDraw(gameState: GameStateType, currentPlayer: number) {
  // Check if it's not the first turn
  if (gameState.history.length < 1) {
    return false;
  }
  // Check for stalemate (no legal moves for the current player)
  if (isStalemate(gameState, currentPlayer)) {
      
      return true;
  }
  if (isInsufficientMaterial(gameState)) {
      
      return true;
  }
  if (isThreefoldRepetition(gameState.history)) {
      
      return true;
  }
  if (isFivefoldRepetition(gameState.history)) {
      
      return true;
  }

  // If none of the above conditions are met, it's not a draw
  return false;
}

export default isDraw;