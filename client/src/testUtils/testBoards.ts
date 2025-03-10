import { GameStateType, PieceType, Position, PieceColor, PieceNameWithoutNone, PiecePositions } from "../types/clientTypes";

// Helper to create an empty square piece.
export function emptySquare(y: number, x: number, index: number): PieceType {
  return { type: 'empty', color: 'none', position: [y, x], hasMoved: false, index };
}

// Helper to create a piece.
export function createPiece(type: PieceNameWithoutNone, color: PieceColor, position: Position, index: number): PieceType {
  return { 
    id: index,
    type,
    color,
    position,
    hasMoved: false,
    index, 
  };
}

export function generateThreateningSquares(y: number, x: number): number[][][] {
    const boardSize = 8;
    const threateningSquares: number[][][] = [];
  
    // 1. Sliding moves in 8 directions.
    const slidingOffsets: number[][] = [
      [-1, 0],  // up
      [1, 0],   // down
      [0, -1],  // left
      [0, 1],   // right
      [-1, -1], // up-left
      [-1, 1],  // up-right
      [1, -1],  // down-left
      [1, 1]    // down-right
    ];
    for (const [dy, dx] of slidingOffsets) {
      const path: number[][] = [];
      for (let t = 1; t < boardSize; t++) {
        const newY = y + dy * t;
        const newX = x + dx * t;
        if (newY < 0 || newY >= boardSize || newX < 0 || newX >= boardSize) {
          break; // off board, stop this direction
        }
        path.push([newY, newX]);
      }
      threateningSquares.push(path);
    }
  
    // 2. Knight moves in 8 possible offsets.
    const knightOffsets: number[][] = [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2],  [1, 2],
      [2, -1],  [2, 1]
    ];
    for (const [dy, dx] of knightOffsets) {
      const newY = y + dy;
      const newX = x + dx;
      if (newY >= 0 && newY < boardSize && newX >= 0 && newX < boardSize) {
        // Wrap the knight move in its own array to match the format.
        threateningSquares.push([[newY, newX]]);
      } else {
        threateningSquares.push([]);
      }
    }
  
    return threateningSquares;
  }

// Create an 8x8 board full of empty squares.
export function createEmptyBoard(): PieceType[][] {
  const board: PieceType[][] = [];
  let idx = 0;
  for (let y = 0; y < 8; y++) {
    const row: PieceType[] = [];
    for (let x = 0; x < 8; x++) {
      row.push(emptySquare(y, x, idx++));
    }
    board.push(row);
  }
  return board;
}

/*
  TEST BOARD 1: Knight Checkmate Scenario
  Scenario:
    - Black king is trapped in the corner (at position [0,7]).
    - White knight delivers check from [2,6] (a knight move of (-2,+1)).
    - White king is positioned at [1,6] so that all escape squares for the black king are covered.
    - No other pieces are present.
*/

export const knightCheckmateBoard: GameStateType = (() => {
    const board = createEmptyBoard();
    let idx = 0;
  
    // Place white king at top-right corner: [0,7] (will be checkmated)
    const whiteKing = createPiece('king', 'white', [0, 7], idx++);
    board[0][7] = whiteKing;
  
    // Block escape squares for the white king using white pawns:
    // Escape squares: [0,6], [1,7], and [1,6]
    const whitePawn1 = createPiece('pawn', 'white', [0, 6], idx++);
    board[0][6] = whitePawn1;
    const whitePawn2 = createPiece('pawn', 'white', [1, 7], idx++);
    board[1][7] = whitePawn2;
    const whitePawn3 = createPiece('pawn', 'white', [1, 6], idx++);
    board[1][6] = whitePawn3;
  
    // Place black knight at [2,6] that can deliver mate (via move: [2,6] + (-2, +1) = [0,7])
    const blackKnight = createPiece('knight', 'black', [2, 6], idx++);
    board[4][7] = blackKnight;
  
    // Place black king away from the action (e.g., at [7,0])
    const blackKing = createPiece('king', 'black', [7, 0], idx++);
    board[7][0] = blackKing;
  
    // Build piecePositions for each side.
    const piecePositions = {
      white: [whiteKing, whitePawn1, whitePawn2, whitePawn3] as PiecePositions[],
      black: [blackKing, blackKnight] as PiecePositions[]
    };
  
    // For white, leave the threateningPiecesPositions array empty.
    const threateningPiecesPositionsWhite: Position[][] = [
        // // 0: Horizontal left from [0,7]: king and leftwards
        // [[0,7], [0,6], [0,5], [0,4], [0,3], [0,2], [0,1]],
        // // 1: Horizontal right: none (already at right edge)
        // [],
        // // 2: Vertical up: none (king is at top row)
        // [],
        // // 3: Vertical down from [0,7]: [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7]
        // [[1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7]],
        // // 4: Diagonal up-left: none (top row)
        // [],
        // // 5: Diagonal up-right: none (right edge)
        // [],
        // // 6: Diagonal down-left from [0,7]: [1,6], [2,5], [3,4], [4,3], [5,2], [6,1], [7,0]
        // [[1,6], [2,5], [3,4], [4,3], [5,2], [6,1], [7,0]],
        // // 7: Diagonal down-right: from [0,7] only [1,7] fits here (duplicative of vertical down but provided for template completeness)
        // [[1,7]],
        // // 8: Knight move [-2,-1] from [0,7]: would be off board
        // [],
        // // 9: Knight move [-2,+1]: off board
        // [],
        // // 10: Knight move [2,-1] from [0,7]: would normally yield [2,6]; here we fill a dummy array (unused in white’s defense)
        // [[2,6]],
        // // 11: Knight move [2,+1] from [0,7]: off board
        // [],
        // // 12: Knight move [-1,-2] from [0,7]: off board
        // [],
        // // 13: Knight move [-1,+2]: off board
        // [],
        // // 14: Knight move [1,-2] from [0,7]: gives [1,5]
        // [[1,5]],
        // // 15: Knight move [1,+2]: off board
        // []
      ];
  
    // For black, manually specify a 16-element array.
    // Here, index 10 represents the knight move delivering mate from [2,6] to [0,7].
    const threateningPiecesPositionsBlack: Position[][] = [
      // 0:
      [[1,6], [1,5], [1,4], [1,3], [1,2], [1,1], [1,0]],
      // 1:
      [[1,7]],
      // 2:
      [[0,7]],
      // 3:
      [[2,6], [3,6], [4,6], [5,6], [6,6], [7,6]],
      // 4:
      [[0,5]],
      // 5:
      [[0,7]],
      // 6:
      [[2,5], [3,4], [4,3], [5,2], [6,1], [7,0]],
      // 7:
      [[2,7]],
      // 8:
      [],
      // 9:
      [],
      // 10: Knight move delivering mate from [2,6] to [0,7]
      [[2,6], [0,7]],
      // 11:
      [],
      // 12:
      [[0,4]],
      // 13:
      [],
      // 14:
      [[2,4]],
      // 15:
      []
    ];
    
    const threateningPiecesPositions = {
      white: threateningPiecesPositionsWhite,
      black: threateningPiecesPositionsBlack,
    };
  
    // Set king positions manually.
    const kingPositions = {
      white: whiteKing.position,
      black: blackKing.position,
    };
  
    // Mark that white is in check and checkmated;
    // here index 10 corresponds to the checking knight move.
    const checkStatus = { white: true, black: false, direction: 10 };
    const checkmateStatus = { white: true, black: false };
  
    return {
      board,
      history: [],
      turn: 'black', // Black moves first (and white is checkmated)
      kingPositions,
      threateningPiecesPositions,
      piecePositions,
      checkStatus,
      checkmateStatus,
      username1: 'BlackTester', // roles reversed
      username2: 'WhiteTester'
    };
  })();

/*
  TEST BOARD 2: Pawn Advance & En Passant Scenario (simplified)
  (For example, a board with only a pawn about to do a two–square move)
*/
export const pawnTestBoard: GameStateType = (() => {
  const board = createEmptyBoard();
  let idx = 0;

  // Place kings (needed for valid GameState), far apart to not interfere.
  const blackKing = createPiece('king', 'black', [0, 4], idx++);
  board[0][4] = blackKing;
  const whiteKing = createPiece('king', 'white', [7, 4], idx++);
  board[7][4] = whiteKing;

  // Place a black pawn at row1 to test one– or two–square advance
  const blackPawn = createPiece('pawn', 'black', [1, 3], idx++);
  board[1][3] = blackPawn;

  // Build piecePositions
  const piecePositions = {
    black: [blackKing, blackPawn] as PiecePositions[],
    white: [whiteKing] as PiecePositions[]
  };

  return {
    board,
    history: [],
    turn: 'black',
    kingPositions: { black: blackKing.position, white: whiteKing.position },
    threateningPiecesPositions: { black: generateThreateningSquares(0,4), white: generateThreateningSquares(7,4) },
    piecePositions,
    checkStatus: { black: false, white: false, direction: -1 },
    checkmateStatus: { black: false, white: false },
    username1: 'Tester1',
    username2: 'Tester2'
  };
})();

/*
  Additional test boards for other pieces (rook, bishop, castling logic, etc.)
  can be defined similarly.
*/

export const basicMoveBoard: GameStateType = (() => {
  const board = createEmptyBoard();
  let idx = 0;
  // Place kings for legality.
  const blackKing = createPiece('king', 'black', [0, 4], idx++);
  board[0][4] = blackKing;
  const whiteKing = createPiece('king', 'white', [7, 4], idx++);
  board[7][4] = whiteKing;
  // Place a white rook at [7,0] to test linear moves.
  const whiteRook = createPiece('rook', 'white', [7, 0], idx++);
  board[7][0] = whiteRook;

  const piecePositions = {
    black: [blackKing] as PiecePositions[],
    white: [whiteKing, whiteRook] as PiecePositions[]
  };

  return {
    board,
    history: [],
    turn: 'black',
    kingPositions: { black: blackKing.position, white: whiteKing.position },
    threateningPiecesPositions: { black: generateThreateningSquares(0,4), white: generateThreateningSquares(7,4) },
    piecePositions,
    checkStatus: { black: false, white: false, direction: -1 },
    checkmateStatus: { black: false, white: false },
    username1: 'WhitePlayer',
    username2: 'BlackPlayer'
  };
})();
