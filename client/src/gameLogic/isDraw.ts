import isStalemate from './isStalemate';
import isInsufficientMaterial from './isInsufficientMaterial';
import isThreefoldRepetition from './isThreefoldRepetition';
import isFivefoldRepetition from './isFivefoldRepetition';

function isDraw(gameState) {
  // Check for stalemate (no legal moves for the current player)
  // You may need to modify this based on your specific stalemate conditions
    if (isStalemate(gameState)) {
        return true;
    }
    if (isInsufficientMaterial(gameState)) {
        return true;
    }
    if (isThreefoldRepetition(gameState)) {
        return true;
    }
    if (isFivefoldRepetition(gameState)) {
        return true;
    }

    // If none of the above conditions are met, it's not a draw

  return false;
}

export default isDraw;