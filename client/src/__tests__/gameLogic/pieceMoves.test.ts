import { getMovesForPiece, getPawnMoves, getLinearMoves, getFixedMoves } from '../../gameLogic/pieceMoves';
import { createEmptyBoard, createPiece } from '../../testUtils/testBoards';
import calculateThreateningSquares from '../../gameLogic/calculateThreateningSquares';
import { GameStateType, PiecePositions, PieceType, Position, PieceMoveType, PieceNameWithoutNone, TestPieceMoveAdapter, MovePosition } from '../../types/clientTypes';

// Helper function to adapt PieceType to the format expected by move functions

function adaptForMoveFunction(piece: PieceType, gameState: GameStateType): TestPieceMoveAdapter {
  return {
    ...piece,
    gameState,
    piece: piece,
    color: piece.color || 'none', // Ensure color is always defined
    type: piece.type as PieceNameWithoutNone
  };
}


// Helper wrapper functions to match the test expectations
function ensurePositionArray(moves: number[][]): Position[] {
  return moves.map(move => {
    if (move.length === 2) {
      return move as Position;
    }
    // Handle invalid moves - return a default or skip
    return [0, 0]; // or throw error if this should never happen
  });
}
// Helper to convert a list of expected positions into a comparable format

function expectMovesToContain(moves: number[][] | Position[], expectedPositions: number[][] | Position[] | number[]) {
  const positionMoves = ensurePositionArray(moves as number[][]);
  const positionExpected = ensurePositionArray(expectedPositions as number[][]);
  
  positionExpected.forEach(pos => {
    expect(positionMoves).toContainEqual(pos);
  });
}

function expectMovesToExclude(moves: number[][] | Position[], excludedPositions: number[][] | Position[]) {
  const positionMoves = ensurePositionArray(moves as number[][]);
  const positionExcluded = ensurePositionArray(excludedPositions as number[][]);
  
  positionExcluded.forEach(pos => {
    expect(positionMoves).not.toContainEqual(pos);
  });
}
// Utility function to create a minimal test board state with proper threatening squares
function createTestBoard(pieces: PieceType[]): GameStateType {
    const board = createEmptyBoard();
    // Add pieces to the board
    const whiteKing = createPiece('king', 'white', [7, 4], 0);
    const blackKing = createPiece('king', 'black', [0, 4], 1);
    
    // Default kings positions
    board[7][4] = whiteKing;
    board[0][4] = blackKing;
    
    // Add the additional test pieces to the board
    const piecePositions = {
        white: [whiteKing] as PiecePositions[],
        black: [blackKing] as PiecePositions[]
    };

    // Add all pieces to the board and piece positions
    pieces.forEach(piece => {
        if (piece.position as Position) {
            const [y, x] = piece.position as Position;
            board[y!][x!] = piece;
            if (piece.color === 'white') {
                piecePositions.white.push(piece as PiecePositions);
            } else if (piece.color === 'black') {
                piecePositions.black.push(piece as PiecePositions);
            }
        }
    });

    // Create basic game state
    const gameState: GameStateType = {
        board,
        history: [],
        turn: 'white',
        kingPositions: { white: [7, 4], black: [0, 4] },
        piecePositions,
        threateningPiecesPositions: { white: [], black: [] },
        checkStatus: { white: false, black: false, direction: -1 },
        checkmateStatus: { white: false, black: false },
        username1: 'TestUser1',
        username2: 'TestUser2'
    };

    // Calculate threatening squares for both sides
    if (whiteKing.position && whiteKing.position.length === 2) {
        gameState.threateningPiecesPositions.white = calculateThreateningSquares(
            gameState, 'black', whiteKing, whiteKing.position as Position
        );
    }
    if (blackKing.position && blackKing.position.length === 2) {
        gameState.threateningPiecesPositions.black = calculateThreateningSquares(
            gameState, 'white', blackKing, blackKing.position as Position
        );
    }

    return gameState;
}

describe('Piece Movement Tests', () => {
  console.log('Running SimuBoard 3000');
  describe('Pawn Movement', () => {
    
    test('White pawn moves forward one square from starting position', () => {
      const pawn = createPiece('pawn', 'white', [6, 3], 2);
      const gameState = createTestBoard([pawn]);
      
      const pawnForMove: PieceMoveType = {
        ...pawn,
        gameState,   // include gameState from your test
        piece: pawn, // explicitly set the piece property to the pawn
    };
    
    const moves = getPawnMoves(pawnForMove, pawn.position as Position, gameState);      
      expectMovesToContain(moves, [[5, 3], [4, 3]]);
    });
    
    test('White pawn moves only one square after first move', () => {
      const pawn = createPiece('pawn', 'white', [5, 3], 2);
      pawn.hasMoved = true;
      const gameState = createTestBoard([pawn]);
      
      const moves = getPawnMoves(pawn, pawn.position as Position, gameState);
      
      expectMovesToContain(moves, [[4, 3]]);
      expectMovesToExclude(moves, [[3, 3]]);
    });
    
    test('Black pawn moves forward one square', () => {
      const pawn = createPiece('pawn', 'black', [1, 3], 2);
      const gameState = createTestBoard([pawn]);
      
      const moves = getPawnMoves(pawn, pawn.position as Position, gameState);
      
      expectMovesToContain(moves, [[2, 3], [3, 3]]);
    });
    
    test('Pawn cannot move forward when blocked', () => {
      const whitePawn = createPiece('pawn', 'white', [6, 3], 2);
      const blockingPiece = createPiece('pawn', 'black', [5, 3], 3);
      const gameState = createTestBoard([whitePawn, blockingPiece]);
      
      const moves = getPawnMoves(whitePawn, whitePawn.position as Position, gameState);
      
      expectMovesToExclude(moves, [[5, 3], [4, 3]]);
    });
    
    test('Pawn captures diagonally', () => {
      const whitePawn = createPiece('pawn', 'white', [6, 3], 2);
      const blackPawn1 = createPiece('pawn', 'black', [5, 2], 3);
      const blackPawn2 = createPiece('pawn', 'black', [5, 4], 4);
      const gameState = createTestBoard([whitePawn, blackPawn1, blackPawn2]);
      
      const moves = getPawnMoves(whitePawn, whitePawn.position as Position, gameState);
      
      expectMovesToContain(moves, [[5, 2], [5, 4], [5, 3], [4, 3]]);
    });
    
    test('Pawn cannot capture friendly pieces diagonally', () => {
      const whitePawn1 = createPiece('pawn', 'white', [6, 3], 2);
      const whitePawn2 = createPiece('pawn', 'white', [5, 2], 3);
      const gameState = createTestBoard([whitePawn1, whitePawn2]);
      
      const moves = getPawnMoves(whitePawn1, whitePawn1.position as Position, gameState);
      
      expectMovesToExclude(moves, [[5, 2]]);
    });
    
    test('Pawn cannot go off the board', () => {
      const whitePawn = createPiece('pawn', 'white', [0, 0], 2);
      whitePawn.hasMoved = true;
      const gameState = createTestBoard([whitePawn]);
      
      const moves = getPawnMoves(whitePawn, whitePawn.position as Position, gameState);
      
      expect(moves.length).toBe(0);
    });
  });

  describe('Knight Movement', () => {
    
    test('Knight moves in L-shape pattern', () => {
      const knight = createPiece('knight', 'white', [4, 4], 2);
      const gameState = createTestBoard([knight]);
    
      // Create an adapted object that matches what getFixedMoves expects
      
      const knightForMove = adaptForMoveFunction(knight, gameState);
      
      const moves = getFixedMoves(knightForMove, knight.position as Position, gameState);
      
      expectMovesToContain(moves, [
        [2, 3], [2, 5], // Up 2, left/right 1
        [3, 2], [3, 6], // Up 1, left/right 2
        [5, 2], [5, 6], // Down 1, left/right 2
        [6, 3], [6, 5]  // Down 2, left/right 1
      ]);
    });
    
    test('Knight captures opponent pieces', () => {
      const whiteKnight = createPiece('knight', 'white', [4, 4], 2);
      const blackPawn = createPiece('pawn', 'black', [2, 3], 3);
      const gameState = createTestBoard([whiteKnight, blackPawn]);
    
      // Create an adapted object for move function
      
      const knightForMove = adaptForMoveFunction(whiteKnight, gameState);
    
      const moves = getFixedMoves(knightForMove, whiteKnight.position as Position, gameState);
      
        expectMovesToContain(moves, [
          [2, 3], [2, 5], // Up 2, left/right 1
          [3, 2], [3, 6], // Up 1, left/right 2
          [5, 2], [5, 6], // Down 1, left/right 2
          [6, 3], [6, 5]  // Down 2, left/right 1
        ]);
      }
    );
    
    test('Knight captures opponent pieces', () => {
      const whiteKnight = createPiece('knight', 'white', [4, 4], 2);
      const blackPawn = createPiece('pawn', 'black', [2, 3], 3);
      const gameState = createTestBoard([whiteKnight, blackPawn]);
    
      // Create an object matching PieceMoveType
      
      const knightForMove = adaptForMoveFunction(whiteKnight, gameState);

      const moves = getFixedMoves(knightForMove, whiteKnight.position as Position, gameState);
      
      expectMovesToContain(moves, [[2, 3]]);
    });
    
    test('Knight cannot capture friendly pieces', () => {
      const whiteKnight = createPiece('knight', 'white', [4, 4], 2);
      const whitePawn = createPiece('pawn', 'white', [2, 3], 3);
      const gameState = createTestBoard([whiteKnight, whitePawn]);
    
      // Create an object matching PieceMoveType
      
      const knightForMove = adaptForMoveFunction(whiteKnight, gameState);

    
      const moves = getFixedMoves(knightForMove, whiteKnight.position as Position, gameState);
      
      expectMovesToExclude(moves, [[2, 3]]);
    });
    
    test('Knight jumps over other pieces', () => {
      const whiteKnight = createPiece('knight', 'white', [7, 1], 2);
      const whitePawn1 = createPiece('pawn', 'white', [6, 0], 3);
      const whitePawn2 = createPiece('pawn', 'white', [6, 1], 4);
      const whitePawn3 = createPiece('pawn', 'white', [6, 2], 5);
      const gameState = createTestBoard([whiteKnight, whitePawn1, whitePawn2, whitePawn3]);
      
    
      const knightForMove = adaptForMoveFunction(whiteKnight, gameState);
    
      const moves = getFixedMoves(knightForMove, whiteKnight.position as Position, gameState);
      
      expectMovesToContain(moves, [[5, 0], [5, 2]]);
    });
    test('Knight respects board boundaries', () => {
      const whiteKnight = createPiece('knight', 'white', [0, 0], 2);
      const gameState = createTestBoard([whiteKnight]);
      
      const knightForMove = adaptForMoveFunction(whiteKnight, gameState);

      const moves = getFixedMoves(knightForMove, whiteKnight.position as Position, gameState);
      
      expectMovesToContain(moves, [[1, 2], [2, 1]]);
      expectMovesToExclude(moves, [
        [-1, -2], [-2, -1],
        [-1, 2], [-2, 1],
        [1, -2], [2, -1]
      ]);
      expect(moves.length).toBe(2);
    });
  });
  
  describe('Bishop Movement', () => {
    
    test('Bishop moves diagonally', () => {
      const bishop = createPiece('bishop', 'white', [4, 4], 2);
      const gameState = createTestBoard([bishop]);
      
      const bishopForMove = adaptForMoveFunction(bishop, gameState);
      const moves = getLinearMoves(bishopForMove, bishopForMove.position as MovePosition, gameState);
      expectMovesToContain(moves, [
        [3, 3], [2, 2], [1, 1], [0, 0],
        [3, 5], [2, 6], [1, 7],
        [5, 3], [6, 2], [7, 1],
        [5, 5], [6, 6], [7, 7]
      ]);
    });
    
    test('Bishop captures opponent pieces', () => {
      const whiteBishop = createPiece('bishop', 'white', [4, 4], 2);
      const blackPawn = createPiece('pawn', 'black', [2, 2], 3);
      const gameState = createTestBoard([whiteBishop, blackPawn]);
      const bishopForMove = adaptForMoveFunction(whiteBishop, gameState);
      
      const moves = getLinearMoves(bishopForMove, bishopForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[3, 3], [2, 2]]);
      expectMovesToExclude(moves, [[1, 1], [0, 0]]);
    });
    
    test('Bishop cannot move through pieces', () => {
      const whiteBishop = createPiece('bishop', 'white', [4, 4], 2);
      const blockingPiece = createPiece('pawn', 'white', [2, 2], 3);
      const gameState = createTestBoard([whiteBishop, blockingPiece]);
      
      const bishopForMove = adaptForMoveFunction(whiteBishop, gameState);
      const moves = getLinearMoves(bishopForMove, bishopForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[3, 3]]);
      expectMovesToExclude(moves, [[2, 2], [1, 1], [0, 0]]);
    });
    
    test('Bishop respects board boundaries', () => {
      const whiteBishop = createPiece('bishop', 'white', [0, 0], 2);
      const gameState = createTestBoard([whiteBishop]);
      const bishopForMove = adaptForMoveFunction(whiteBishop, gameState);
      
      const moves = getLinearMoves(bishopForMove, bishopForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]);
      expectMovesToExclude(moves, [[-1, -1], [0, -1], [-1, 0]]);
    });
  });

  describe('Rook Movement', () => {
    test('Rook moves horizontally and vertically', () => {
      const rook = createPiece('rook', 'white', [4, 4], 2);
      const gameState = createTestBoard([rook]);
      const rookForMove = adaptForMoveFunction(rook, gameState);
      
      const moves = getLinearMoves(rookForMove, rookForMove.position as MovePosition, gameState);
      
      // Replace toEqual with individual checks
      const expectedMoves = [
        [0, 4], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4],
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 5], [4, 6], [4, 7]
      ];
      
      // Check each expected move individually
      expectedMoves.forEach(move => {
        expect(moves).toContainEqual(move);
      });
    });
    
    test('Rook captures opponent pieces', () => {
      const whiteRook = createPiece('rook', 'white', [4, 4], 2);
      const blackPawn = createPiece('pawn', 'black', [4, 7], 3);
      const gameState = createTestBoard([whiteRook, blackPawn]);
      
      const rookForMove = adaptForMoveFunction(whiteRook, gameState);

      const moves = getLinearMoves(rookForMove, rookForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[4, 5], [4, 6], [4, 7]]);
      expectMovesToExclude(moves, [[4, 8]]);
    });
    
    test('Rook cannot move through pieces', () => {
      const whiteRook = createPiece('rook', 'white', [4, 4], 2);
      const blockingPiece1 = createPiece('pawn', 'white', [4, 6], 3);
      const blockingPiece2 = createPiece('pawn', 'white', [2, 4], 4);
      const gameState = createTestBoard([whiteRook, blockingPiece1, blockingPiece2]);
      
      const rookForMove = adaptForMoveFunction(whiteRook, gameState);
      const moves = getLinearMoves(rookForMove, rookForMove.position as MovePosition, gameState);
      
      // Should be able to move up to the blocking pieces, but not through or beyond them
      expectMovesToContain(moves, [
        [3, 4], // Can move up to the blocking piece at [2, 4]
        [4, 5]  // Can move right up to the blocking piece at [4, 6]
      ]);
      
      expectMovesToExclude(moves, [
        [2, 4], [1, 4], [0, 4], // Cannot move through or beyond the blocking piece
        [4, 6], [4, 7]          // Cannot move through or beyond the blocking piece
      ]);
    });

    test('Rook respects board boundaries', () => {
      const whiteRook = createPiece('rook', 'white', [0, 0], 2);
      const gameState = createTestBoard([whiteRook]);
      
      const rookForMove = adaptForMoveFunction(whiteRook, gameState);
      const moves = getLinearMoves(rookForMove, rookForMove.position as MovePosition, gameState);
      
      // Replace toEqual with individual checks
      const expectedMoves = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]
      ];
      
      // Check each expected move individually
      expectedMoves.forEach(move => {
        expect(moves).toContainEqual(move);
      });
      
      // Check invalid moves separately
      const invalidMoves = [[-1, 0], [0, -1], [8, 0], [0, 8]];
      invalidMoves.forEach(pos => {
        expect(moves).not.toContainEqual(pos);
      });
    });
  });

  describe('Queen Movement', () => {
    test('Queen moves horizontally, vertically and diagonally', () => {
      const queen = createPiece('queen', 'white', [4, 4], 2);
      const gameState = createTestBoard([queen]);
      
      const queenForMove = adaptForMoveFunction(queen, gameState);
      const moves = getLinearMoves(queenForMove, queenForMove.position as MovePosition, gameState);
      
      // Replace toEqual with individual checks
      const expectedMoves = [
        // Horizontal and vertical moves
        [0, 4], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4],
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 5], [4, 6], [4, 7],
        // Diagonal moves
        [3, 3], [2, 2], [1, 1], [0, 0],
        [3, 5], [2, 6], [1, 7],
        [5, 3], [6, 2], [7, 1],
        [5, 5], [6, 6], [7, 7]
      ];
      
      // Check each expected move individually
      expectedMoves.forEach(move => {
        expect(moves).toContainEqual(move);
      });
    });
    
    test('Queen captures opponent pieces', () => {
      const whiteQueen = createPiece('queen', 'white', [4, 4], 2);
      const blackPawn1 = createPiece('pawn', 'black', [4, 7], 3);
      const blackPawn2 = createPiece('pawn', 'black', [7, 7], 4);
      const gameState = createTestBoard([whiteQueen, blackPawn1, blackPawn2]);
      
      const queenForMove = adaptForMoveFunction(whiteQueen, gameState);

      const moves = getLinearMoves(queenForMove, queenForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[4, 7], [7, 7]]);
    });
    
    test('Queen cannot move through pieces', () => {
      const whiteQueen = createPiece('queen', 'white', [4, 4], 2);
      const blockingPiece1 = createPiece('pawn', 'white', [4, 6], 3);
      const blockingPiece2 = createPiece('pawn', 'white', [6, 6], 4);
      const gameState = createTestBoard([whiteQueen, blockingPiece1, blockingPiece2]);
      
      const queenForMove = adaptForMoveFunction(whiteQueen, gameState);

      const moves = getLinearMoves(queenForMove, queenForMove.position as MovePosition, gameState);
      
      expectMovesToContain(moves, [[4, 5]]);
      expectMovesToExclude(moves, [[4, 6], [4, 7]]);
      
      expectMovesToContain(moves, [[5, 5]]);
      expectMovesToExclude(moves, [[6, 6], [7, 7]]);
    });
    
    test('Queen respects board boundaries', () => {
      const whiteQueen = createPiece('queen', 'white', [0, 0], 2);
      const gameState = createTestBoard([whiteQueen]);
      
      const queenForMove = adaptForMoveFunction(whiteQueen, gameState);
      const moves = getLinearMoves(queenForMove, queenForMove.position as MovePosition, gameState);
      
      // Replace toEqual with individual checks
      const expectedMoves = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
        [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]
      ];
      
      // Check each expected move individually
      expectedMoves.forEach(move => {
        expect(moves).toContainEqual(move);
      });
      
      // Check invalid moves separately
      const invalidMoves = [[-1, 0], [0, -1], [-1, -1], [8, 0], [0, 8]];
      invalidMoves.forEach(pos => {
        expect(moves).not.toContainEqual(pos);
      });
    });
  });

  describe('King Movement', () => {
    
    test('King moves one square in any direction', () => {
      const king = createPiece('king', 'white', [4, 4], 2);
      const gameState = createTestBoard([king]);
      
      // Replace the king with our test king
      gameState.kingPositions.white = [4, 4];
      gameState.piecePositions.white = [king as unknown as PiecePositions];
      gameState.board[7][4] = { type: 'empty', color: 'none', position: [7, 4] as Position, hasMoved: false, index: 99 };
      gameState.board[4][4] = king;
      
      const kingForMove = adaptForMoveFunction(king, gameState);

      
      const moves = getFixedMoves(kingForMove, kingForMove.position as Position, gameState);
      
      // King can move one square in any direction
      expectMovesToContain(moves, [
        [3, 3], [3, 4], [3, 5], // above
        [4, 3], [4, 5],         // sides
        [5, 3], [5, 4], [5, 5]  // below
      ]);
    });
    
    test('King captures opponent pieces', () => {
      const whiteKing = createPiece('king', 'white', [4, 4], 2);
      const blackPawn = createPiece('pawn', 'black', [3, 3], 3);
      const gameState = createTestBoard([whiteKing, blackPawn]);
      
      // Replace the king
      gameState.kingPositions.white = [4, 4];
      gameState.piecePositions.white = [whiteKing as unknown as PiecePositions];
      gameState.board[7][4] = { type: 'empty', color: 'none', position: [7, 4] as Position, hasMoved: false, index: 99 };
      gameState.board[4][4] = whiteKing;
      
      const kingForMove = adaptForMoveFunction(whiteKing, gameState);
      
      const moves = getFixedMoves(kingForMove, kingForMove.position as Position, gameState);
      
      expectMovesToContain(moves, [[3, 3]]);
    });
    
    test('King cannot capture friendly pieces', () => {
      const whiteKing = createPiece('king', 'white', [4, 4], 2);
      const whitePawn = createPiece('pawn', 'white', [3, 3], 3);
      const gameState = createTestBoard([whiteKing, whitePawn]);
      // Replace the king
      gameState.kingPositions.white = [4, 4];
      gameState.piecePositions.white = [whiteKing as unknown as PiecePositions, whitePawn as unknown as PiecePositions];
      gameState.board[7][4] = { type: 'empty', color: 'none', position: [7, 4] as Position, hasMoved: false, index: 99 };
      gameState.board[4][4] = whiteKing;
      
      const kingForMove = adaptForMoveFunction(whiteKing, gameState);
      
      const moves = getFixedMoves(kingForMove, kingForMove.position as Position, gameState);
      
      expectMovesToExclude(moves, [[3, 3]]);
    });
    
    test('King respects board boundaries', () => {
      const whiteKing = createPiece('king', 'white', [0, 0], 2);
      const gameState = createTestBoard([whiteKing]);
      // Replace the king
      gameState.kingPositions.white = [0, 0];
      gameState.piecePositions.white = [whiteKing as unknown as PiecePositions];
      gameState.board[7][4] = { type: 'empty', color: 'none', position: [7, 4] as Position, hasMoved: false, index: 99 };
      gameState.board[0][0] = whiteKing;
      
      const kingForMove = adaptForMoveFunction(whiteKing, gameState);
      
      const moves = getFixedMoves(kingForMove, kingForMove.position as Position, gameState);
      
      expectMovesToContain(moves, [[0, 1], [1, 0], [1, 1]]);
      expectMovesToExclude(moves, [[-1, -1], [-1, 0], [0, -1], [-1, 1], [1, -1]]);
      expect(moves.length).toBe(3);
    });
  });

  describe('getMovesForPiece integration', () => {
    test('getMovesForPiece correctly delegates to specific piece move generators', () => {
      const pieces = [
        { piece: createPiece('pawn', 'white', [6, 3], 2), expected: [[5, 3], [4, 3]] },
        { piece: createPiece('knight', 'white', [4, 4], 3), expected: [[2, 3], [2, 5], [3, 2], [3, 6], [5, 2], [5, 6], [6, 3], [6, 5]] },
        { piece: createPiece('bishop', 'white', [4, 4], 4), expected: [[3, 3], [2, 2], [1, 1], [0, 0]] },
        { piece: createPiece('rook', 'white', [4, 4], 5), expected: [[3, 4], [2, 4], [1, 4], [0, 4]] },
        { piece: createPiece('queen', 'white', [4, 4], 6), expected: [[3, 3], [3, 4], [3, 5]] },
      ];
      
      pieces.forEach(({ piece, expected }) => {
        const gameState = createTestBoard([piece]);
        
        const moves = getMovesForPiece(piece, piece.position as Position, gameState);
        
        // Just check a subset of expected moves for each piece type
        expectMovesToContain(moves, expected);
      });
    });
  });
});