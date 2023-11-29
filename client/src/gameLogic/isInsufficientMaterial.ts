import { GameState } from "../types/clientTypes";

function isInsufficientMaterial(gameState: GameState) {
  const pieces = gameState.board.flat().filter(piece => piece);
  const whitePieces = pieces.filter(piece => piece?.color === 'white');
  const blackPieces = pieces.filter(piece => piece?.color === 'black');

  // Both players only have a king
  if (whitePieces.length === 1 && blackPieces.length === 1) {
      return true;
  }

  // One player only has a king and the other player has a king and a knight
  if ((whitePieces.length === 1 && blackPieces.length === 2 && blackPieces.some(piece => piece?.type === 'knight')) ||
      (blackPieces.length === 1 && whitePieces.length === 2 && whitePieces.some(piece => piece?.type === 'knight'))) {
      return true;
  }

  // One player only has a king and the other player has a king and a bishop
  if ((whitePieces.length === 1 && blackPieces.length === 2 && blackPieces.some(piece => piece?.type === 'bishop')) ||
      (blackPieces.length === 1 && whitePieces.length === 2 && whitePieces.some(piece => piece?.type === 'bishop'))) {
      return true;
  }

  // Both players only have a king and a bishop, and the bishops are on the same color squares
  if (whitePieces.length === 2 && blackPieces.length === 2 &&
      whitePieces.some(piece => piece?.type === 'bishop') && blackPieces.some(piece => piece?.type === 'bishop')) {
      const whiteBishop = whitePieces.find(piece => piece?.type === 'bishop');
      const blackBishop = blackPieces.find(piece => piece?.type === 'bishop');
      if (whiteBishop && blackBishop && 
        (whiteBishop.position[0] + whiteBishop.position[1]) % 2 === 
        (blackBishop.position[0] + blackBishop.position[1]) % 2) {
        return true;
    }
  }

  return false;
}
export default isInsufficientMaterial;