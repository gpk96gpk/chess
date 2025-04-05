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