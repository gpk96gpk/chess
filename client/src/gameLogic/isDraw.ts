import isStalemate from './isStalemate';
import isInsufficientMaterial from './isInsufficientMaterial';
import isThreefoldRepetition from './isThreefoldRepetition';
import isFivefoldRepetition from './isFivefoldRepetition';
import { GameState } from '../types/clientTypes';

function isDraw(gameState: GameState, currentPlayer: number) {
  // Check if it's not the first turn
  if (gameState.history.length < 1) {
    return false;
  }
  // Check for stalemate (no legal moves for the current player)
  if (isStalemate(gameState, currentPlayer)) {
      console.log('Game is in stalemate');
      return true;
  }
  if (isInsufficientMaterial(gameState)) {
      console.log('Game has insufficient material');
      return true;
  }
  if (isThreefoldRepetition(gameState.history)) {
      console.log('Game has threefold repetition');
      return true;
  }
  if (isFivefoldRepetition(gameState.history)) {
      console.log('Game has fivefold repetition');
      return true;
  }

  // If none of the above conditions are met, it's not a draw
  return false;
}

export default isDraw;