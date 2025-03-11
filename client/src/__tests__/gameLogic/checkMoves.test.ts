//npx jest --preset ts-jest src/__tests__/gameLogic/checkMoves.test.ts
import validMoves from '../../gameLogic/validMoves';
import { createEmptyBoard, createPiece } from '../../testUtils/testBoards';
import calculateThreateningSquares from '../../gameLogic/calculateThreateningSquares';
import { GameStateType, PiecePositions, PieceType, Position, ValidMoveReturn } from '../../types/clientTypes';

// Helper function to create test boards for check scenarios
function createCheckTestBoard(pieces: PieceType[]): GameStateType {
  const board = createEmptyBoard();
  
  // Add default kings
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

describe('Chess Check and Checkmate Tests', () => {
  describe('Pieces Delivering Check', () => {
    test('Queen puts king in check', () => {
      // Create a white queen that can check the black king
      const whiteQueen = createPiece('queen', 'white', [3, 4], 2);
      const gameState = createCheckTestBoard([whiteQueen]);
      
      // From this position, the queen can check the black king vertically
      const position = whiteQueen.position as Position;
      const targetPosition: Position = [1, 4]; // Move queen closer to black king
      const result = validMoves(whiteQueen, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify check is detected
      expect(result.isOpponentKingInCheck).toBe(true);
    });

    test('Rook puts king in check', () => {
      // Create a white rook that can check the black king
      const whiteRook = createPiece('rook', 'white', [3, 4], 2);
      const gameState = createCheckTestBoard([whiteRook]);
      
      // From this position, the rook can check the black king vertically
      const position = whiteRook.position as Position;
      const targetPosition: Position = [1, 4]; // Move rook closer to black king
      const result = validMoves(whiteRook, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify check is detected
      expect(result.isOpponentKingInCheck).toBe(true);
    });

    test('Bishop puts king in check', () => {
      // Create a white bishop that can check the black king
      const whiteBishop = createPiece('bishop', 'white', [3, 1], 2);
      const gameState = createCheckTestBoard([whiteBishop]);
      
      // From this position, the bishop can check the black king diagonally
      const position = whiteBishop.position as Position;
      const targetPosition: Position = [1, 3]; // Move bishop to check black king
      const result = validMoves(whiteBishop, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify check is detected
      expect(result.isOpponentKingInCheck).toBe(true);
    });

    test('Knight puts king in check', () => {
        // Create a white knight that can check the black king
        const whiteKnight = createPiece('knight', 'white', [2, 3], 2);
        const gameState = createCheckTestBoard([whiteKnight]);
        
        // From this position, the knight can check the black king with L-shaped move
        const position = whiteKnight.position as Position;
        const targetPosition: Position = [2, 5]; // Correct position to check king at [0,4]
        const result = validMoves(whiteKnight, position, gameState, 2, targetPosition) as ValidMoveReturn;
        
        // Verify check is detected
        expect(result.isOpponentKingInCheck).toBe(true);
      });

    test('Pawn puts king in check', () => {
      // Create a white pawn that can check the black king
      const whitePawn = createPiece('pawn', 'white', [2, 3], 2);
      const gameState = createCheckTestBoard([whitePawn]);
      
      // From this position, the pawn can check the black king diagonally
      const position = whitePawn.position as Position;
      const targetPosition: Position = [1, 3]; // Move pawn forward
      const result = validMoves(whitePawn, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify check is detected (pawn at [1,3] will check king at [0,4] diagonally)
      expect(result.isOpponentKingInCheck).toBe(true);
    });
  });

  describe('King Escaping Check', () => {
    test('King can move out of check', () => {
      // Set up a scenario where the king is in check but can move away
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const whiteRook = createPiece('rook', 'white', [1, 4], 2); // Rook putting king in check
      
      const gameState = createCheckTestBoard([blackKing, whiteRook]);
      gameState.checkStatus.black = true; // Mark black king as in check
      
      // Generate valid moves for the king
      const position = blackKing.position as Position;
      const targetPosition: Position = [0, 3]; // Move king to the left
      const result = validMoves(blackKing, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify king can move to escape check
      expect(result.moves).toContainEqual([0, 3]);
      expect(result.moves).toContainEqual([0, 5]);
      expect(result.moves).not.toContainEqual([0, 4]); // Cannot stay in current position
    });

    test('King cannot move into check', () => {
        // Set up a scenario where some moves would put king in check
        const blackKing = createPiece('king', 'black', [0, 4], 1);
        const whiteRook = createPiece('rook', 'white', [2, 3], 2); // Rook controlling some squares
        
        const gameState = createCheckTestBoard([blackKing, whiteRook]);
        
        // Generate valid moves for the king
        const position = blackKing.position as Position;
        const targetPosition: Position = [1, 3]; // This would move king into check
        const result = validMoves(blackKing, position, gameState, 1, targetPosition) as ValidMoveReturn;
        
        // Verify king cannot move into a checked position
        expect(result.moves).not.toContainEqual([1, 3]);
        expect(result.moves).not.toContainEqual([0, 3]);
        console.log(result.moves);
        
        // But can move to safe squares
        expect(result.moves).toContainEqual([1, 5]);
        expect(result.moves).toContainEqual([1, 4]);
        expect(result.moves).toContainEqual([0, 5]); 
        
      });
  });

  describe('Blocking Check', () => {
    test('Piece can block check to king', () => {
      // Set up a scenario where a piece can block check
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const blackQueen = createPiece('queen', 'black', [2, 2], 3);
      const whiteRook = createPiece('rook', 'white', [7, 4], 2); // Rook putting king in check
      
      const gameState = createCheckTestBoard([blackKing, blackQueen, whiteRook]);
      gameState.checkStatus.black = true; // Mark black king as in check
      
      // Generate valid moves for the queen to block the rook's check
      const position = blackQueen.position as Position;
      const targetPosition: Position = [2, 4]; // Move queen to block check
      const result = validMoves(blackQueen, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify queen can move to block check
      expect(result.moves).toContainEqual([2, 4]);
    });

    test('Piece cannot block knight check', () => {
      // Set up a scenario where a piece cannot block a knight's check
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const blackQueen = createPiece('queen', 'black', [2, 2], 3);
      const whiteKnight = createPiece('knight', 'white', [2, 5], 2); // Knight putting king in check
      
      const gameState = createCheckTestBoard([blackKing, blackQueen, whiteKnight]);
      gameState.checkStatus.black = true; // Mark black king as in check
      
      // Generate valid moves for the queen
      const position = blackQueen.position as Position;
      const targetPosition: Position = [2, 5]; // Try to capture the knight
      const result = validMoves(blackQueen, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify queen can capture the knight (only way to stop knight check)
      expect(result.moves).toContainEqual([2, 5]);
      // No blocking is possible with a knight
    });
  });

  describe('Checkmate Scenarios', () => {
    test('King is in checkmate', () => {
        // Create pieces in the correct positions FOR CHECKMATE
        const blackKing = createPiece('king', 'black', [0, 4], 1);
        // Add pieces that block the king's escape
        const blackPawn1 = createPiece('pawn', 'black', [1, 3], 3);
        const blackPawn2 = createPiece('pawn', 'black', [1, 4], 4);
        const blackPawn3 = createPiece('pawn', 'black', [1, 5], 5);
        // Add attacking piece - PLACE IT AWAY FROM THE KING INITIALLY
        const whiteRook = createPiece('rook', 'white', [7, 7], 2); // Not giving check yet
        
        const gameState = createCheckTestBoard([blackKing, blackPawn1, blackPawn2, blackPawn3, whiteRook]);
        gameState.turn = 'white'; // Important: set turn explicitly
        
        // Move rook to deliver checkmate
        const position = whiteRook.position as Position;
        const targetPosition: Position = [0, 7]; // Rook to back rank
        
        const result = validMoves(whiteRook, position, gameState, 2, targetPosition) as ValidMoveReturn;
        
        // Check result structure and isOpponentKingInCheck first to debug
        console.log('Move result structure:', Object.keys(result));
        console.log('Is opponent in check:', result.isOpponentKingInCheck);
        
        // Verify checkmate is detected
        expect(result.isOpponentKingInCheck).toBe(true);
        expect(result.isKingInCheckMate).toBe(true);
    });

    test('King is in check but not checkmate', () => {
      // Set up a check that can be escaped
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const whiteRook = createPiece('rook', 'white', [1, 4], 2); // Rook putting king in check
      
      const gameState = createCheckTestBoard([blackKing, whiteRook]);
      
      // Move rook to deliver check
      const position = whiteRook.position as Position;
      const targetPosition: Position = [1, 4]; // Rook checking king
      const result = validMoves(whiteRook, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify check is detected but not checkmate (king can move sideways)
      expect(result.isOpponentKingInCheck).toBe(true);
      expect(result.isKingInCheckMate).toBe(false);
    });

    test('Scholar\'s mate checkmate pattern', () => {
      // Set up the Scholar's mate position
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const whiteBishop = createPiece('bishop', 'white', [3, 5], 2);
      const whiteQueen = createPiece('queen', 'white', [4, 7], 3);
      
      const gameState = createCheckTestBoard([blackKing, whiteBishop, whiteQueen]);
      
      // Move queen to deliver checkmate
      const position = whiteQueen.position as Position;
      const targetPosition: Position = [0, 7]; // Queen to h8, delivering mate
      const result = validMoves(whiteQueen, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify checkmate is detected
      expect(result.isOpponentKingInCheck).toBe(true);
      expect(result.isKingInCheckMate).toBe(true);
    });
  });

  describe('Check Prevention', () => {
    test('Piece is pinned to king and cannot move', () => {
      // Set up a position where a piece is pinned to its king
      const blackKing = createPiece('king', 'black', [0, 4], 1);
      const blackBishop = createPiece('bishop', 'black', [1, 5], 3); // Bishop is pinned
      const whiteQueen = createPiece('queen', 'white', [2, 6], 2); // Queen pins bishop to king
      
      const gameState = createCheckTestBoard([blackKing, blackBishop, whiteQueen]);
      
      // Try to move the bishop
      const position = blackBishop.position as Position;
      const targetPosition: Position = [2, 4]; // Try to move bishop away from pin
      const result = validMoves(blackBishop, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify bishop cannot move due to pin (would expose king)
      expect(result.moves).not.toContainEqual([2, 4]);
      // But can move along the pin line
      expect(result.moves).toContainEqual([2, 6]); // Can capture the pinning piece
    });

    test('Piece must capture checking piece to prevent checkmate', () => {
      // Set up a position where a piece must capture to prevent checkmate
      const blackKing = createPiece('king', 'black', [0, 0], 1); // King in corner
      const blackRook = createPiece('rook', 'black', [1, 1], 3);
      const whiteQueen = createPiece('queen', 'white', [0, 7], 2); // Queen checking king
      
      const gameState = createCheckTestBoard([blackKing, blackRook, whiteQueen]);
      gameState.kingPositions.black = [0, 0]; // Update king position
      gameState.checkStatus.black = true;
      
      // Try to move the rook to capture the queen
      const position = blackRook.position as Position;
      const targetPosition: Position = [0, 7]; // Rook captures queen
      const result = validMoves(blackRook, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify rook can capture the queen
      expect(result.moves).toContainEqual([0, 7]);
      // And other moves are not allowed because king is in check
      expect(result.moves.length).toBe(1);
    });
  });
});