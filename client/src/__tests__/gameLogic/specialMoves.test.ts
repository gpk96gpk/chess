//npx jest --preset ts-jest src/__tests__/gameLogic/specialMoves.test.ts
//import { getMovesForPiece } from '../../gameLogic/pieceMoves';
import validMoves from '../../gameLogic/validMoves';
import pawnPromotion from '../../gameLogic/pawnPromotion';
import enPassant from '../../gameLogic/enPassant';
import { createEmptyBoard, createPiece } from '../../testUtils/testBoards';
import calculateThreateningSquares from '../../gameLogic/calculateThreateningSquares';
import { GameStateType, PiecePositions, PieceType, Position, ValidMoveReturn } from '../../types/clientTypes';

// Helper function to create a test board similar to the one in pieceMoves.test.ts
function createTestBoard(pieces: PieceType[]): GameStateType {
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

describe('Special Chess Moves Tests', () => {
  describe('Pawn Promotion', () => {
    test('White pawn detects promotion possibility when reaching the top row', () => {
      // Create a pawn about to promote (one square away from promotion rank)
      const whitePawn = createPiece('pawn', 'white', [1, 3], 2);
      whitePawn.hasMoved = true;
      const gameState = createTestBoard([whitePawn]);
      
      // Get the valid moves for this pawn
      const position = whitePawn.position as Position;
      const targetPosition: Position = [0, 3]; // Position where pawn will promote
      const result = validMoves(whitePawn, position, gameState, 2, targetPosition) as ValidMoveReturn;
      
      // Verify promotion is detected
      expect(result.canPromote).toBe(true);
      expect(result.promotionPosition).toEqual(targetPosition);
    });

    test('Black pawn detects promotion possibility when reaching the bottom row', () => {
      // Create a pawn about to promote (one square away from promotion rank)
      const blackPawn = createPiece('pawn', 'black', [6, 3], 2);
      blackPawn.hasMoved = true;
      const gameState = createTestBoard([blackPawn]);
      
      // Get the valid moves for this pawn
      const position = blackPawn.position as Position;
      const targetPosition: Position = [7, 3]; // Position where pawn will promote
      const result = validMoves(blackPawn, position, gameState, 1, targetPosition) as ValidMoveReturn;
      
      // Verify promotion is detected
      expect(result.canPromote).toBe(true);
      expect(result.promotionPosition).toEqual(targetPosition);
    });

    test('Pawn promotion function transforms pawn to selected piece', () => {
      // Create a pawn at promotion position
      const whitePawn = createPiece('pawn', 'white', [1, 3], 2);
      const gameState = createTestBoard([whitePawn]);
      const promotionPosition: Position = [0, 3];
      
      // Test promotion to different pieces
      const promotionTypes = ['queen', 'rook', 'bishop', 'knight'] as const;
      
      promotionTypes.forEach(promoteTo => {
        // Promote the pawn
        const updatedGameState = pawnPromotion.handlePawnPromotion(
          gameState,
          whitePawn,
          promotionPosition,
          promoteTo
        );
        
        // Check if the pawn was promoted correctly
        const promotedPiece = updatedGameState.board[promotionPosition[0]][promotionPosition[1]];
        expect(promotedPiece.type).toBe(promoteTo);
        expect(promotedPiece.color).toBe('white');
        expect(promotedPiece.hasMoved).toBe(true);
        
        // Check if piece positions array was updated
        const pieceInArray = updatedGameState.piecePositions.white.find(
          p => p.id === whitePawn.id || p.index === whitePawn.index
        );
        expect(pieceInArray?.type).toBe(promoteTo);
      });
    });

    test('isPawnPromotion correctly identifies promotion situations', () => {
      // Create test pawns
      const whitePawnAtPromotionRank = createPiece('pawn', 'white', [1, 3], 2);
      const whitePawnNotAtPromotionRank = createPiece('pawn', 'white', [2, 3], 3);
      const blackPawnAtPromotionRank = createPiece('pawn', 'black', [6, 3], 4);
      const blackPawnNotAtPromotionRank = createPiece('pawn', 'black', [5, 3], 5);
      const notAPawn = createPiece('rook', 'white', [0, 0], 6);
      
      // Test positions
      const whitePromotionPosition: Position = [0, 3];
      const blackPromotionPosition: Position = [7, 3];
      const nonPromotionPosition: Position = [4, 4];
      
      // Test each case
      expect(pawnPromotion.isPawnPromotion(whitePawnAtPromotionRank, whitePromotionPosition)).toBe(true);
      expect(pawnPromotion.isPawnPromotion(whitePawnNotAtPromotionRank, nonPromotionPosition)).toBe(false);
      expect(pawnPromotion.isPawnPromotion(blackPawnAtPromotionRank, blackPromotionPosition)).toBe(true);
      expect(pawnPromotion.isPawnPromotion(blackPawnNotAtPromotionRank, nonPromotionPosition)).toBe(false);
      expect(pawnPromotion.isPawnPromotion(notAPawn, whitePromotionPosition)).toBe(false);
    });
  });

  describe('En Passant', () => {
    test('White pawn can capture en passant', () => {
      // Create a white pawn
      const whitePawn = createPiece('pawn', 'white', [3, 2], 2);
      whitePawn.hasMoved = true;
      
      // Create a black pawn that just moved two squares (eligible for en passant capture)
      const blackPawn = createPiece('pawn', 'black', [3, 3], 3);
      blackPawn.hasMovedTwo = true;
      blackPawn.hasMoved = true;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whitePawn, blackPawn]);
      
      // Add a recent move to history showing the black pawn moved two squares
      gameState.history.push({
        piece: blackPawn,
        from: [1, 3] as Position,
        to: [3, 3] as Position,
        board: gameState.board,
        turn: 'black',
        turnNumber: 1
      });
      
      // Get en passant move for white pawn
      const enPassantTarget: Position = [2, 3]; // The position behind the black pawn
      const result = enPassant(whitePawn, enPassantTarget, gameState);
      
      // Verify en passant is valid
      expect(result).toEqual(enPassantTarget);
    });

    test('Black pawn can capture en passant', () => {
      // Create a black pawn
      const blackPawn = createPiece('pawn', 'black', [4, 2], 2);
      blackPawn.hasMoved = true;
      
      // Create a white pawn that just moved two squares (eligible for en passant capture)
      const whitePawn = createPiece('pawn', 'white', [4, 3], 3);
      whitePawn.hasMovedTwo = true;
      whitePawn.hasMoved = true;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([blackPawn, whitePawn]);
      
      // Add a recent move to history showing the white pawn moved two squares
      gameState.history.push({
        piece: whitePawn,
        from: [6, 3] as Position,
        to: [4, 3] as Position,
        board: gameState.board,
        turn: 'white',
        turnNumber: 1
      });
      
      // Get en passant move for black pawn
      const enPassantTarget: Position = [5, 3]; // The position behind the white pawn
      const result = enPassant(blackPawn, enPassantTarget, gameState);
      
      // Verify en passant is valid
      expect(result).toEqual(enPassantTarget);
    });

    test('En passant cannot be performed if opponent pawn did not just move two squares', () => {
      // Create a white pawn
      const whitePawn = createPiece('pawn', 'white', [3, 2], 2);
      whitePawn.hasMoved = true;
      
      // Create a black pawn that has already moved (not eligible for en passant capture)
      const blackPawn = createPiece('pawn', 'black', [3, 3], 3);
      blackPawn.hasMoved = true;
      blackPawn.hasMovedTwo = false;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whitePawn, blackPawn]);
      
      // Try to get en passant move for white pawn
      const enPassantTarget: Position = [2, 3]; // The position behind the black pawn
      const result = enPassant(whitePawn, enPassantTarget, gameState);
      
      // Verify en passant is not valid
      expect(result).toBeNull();
    });
  });

  describe('Castling', () => {
    test('White king can castle kingside', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = false;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook]);
      
      // Position the king at its starting position
      gameState.kingPositions.white = [7, 4];
      gameState.board[7][4] = whiteKing;
      
      // Ensure the spaces between king and rook are empty
      gameState.board[7][5] = { type: 'empty', color: 'none', position: [7, 5], hasMoved: false };
      gameState.board[7][6] = { type: 'empty', color: 'none', position: [7, 6], hasMoved: false };
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is allowed
      expect(result.canCastle).toBe(true);
    });

    test('White king can castle queenside', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 0], 3);
      whiteRook.hasMoved = false;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook]);
      
      // Position the king at its starting position
      gameState.kingPositions.white = [7, 4];
      gameState.board[7][4] = whiteKing;
      
      // Ensure the spaces between king and rook are empty
      gameState.board[7][1] = { type: 'empty', color: 'none', position: [7, 1], hasMoved: false };
      gameState.board[7][2] = { type: 'empty', color: 'none', position: [7, 2], hasMoved: false };
      gameState.board[7][3] = { type: 'empty', color: 'none', position: [7, 3], hasMoved: false };
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 2]; // Queenside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is allowed
      expect(result.canCastle).toBe(true);
    });

    test('Black king can castle kingside', () => {
      // Create a black king that has not moved
      const blackKing = createPiece('king', 'black', [0, 4], 2);
      blackKing.hasMoved = false;
      
      // Create a black rook that has not moved
      const blackRook = createPiece('rook', 'black', [0, 7], 3);
      blackRook.hasMoved = false;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([blackKing, blackRook]);
      
      // Position the king at its starting position
      gameState.kingPositions.black = [0, 4];
      gameState.board[0][4] = blackKing;
      
      // Ensure the spaces between king and rook are empty
      gameState.board[0][5] = { type: 'empty', color: 'none', position: [0, 5], hasMoved: false };
      gameState.board[0][6] = { type: 'empty', color: 'none', position: [0, 6], hasMoved: false };
      
      // Get valid moves for the king
      const position = blackKing.position as Position;
      const castlePosition: Position = [0, 6]; // Kingside castle destination
      const result = validMoves(blackKing, position, gameState, 1, castlePosition) as ValidMoveReturn;
      
      // Verify castling is allowed
      expect(result.canCastle).toBe(true);
    });

    test('Black king can castle queenside', () => {
        // Create a black king that has not moved
        const blackKing = createPiece('king', 'black', [0, 4], 2);
        blackKing.hasMoved = false;

        // Create a black rook that has not moved
        const blackRook = createPiece('rook', 'black', [0, 0], 3);
        blackRook.hasMoved = false;

        // Create the game state with these pieces
        const gameState = createTestBoard([blackKing, blackRook]);

        // Position the king at its starting position
        gameState.kingPositions.black = [0, 4];
        gameState.board[0][4] = blackKing;

        // Ensure the spaces between king and rook are empty
        gameState.board[0][1] = { type: 'empty', color: 'none', position: [0, 1], hasMoved: false };
        gameState.board[0][2] = { type: 'empty', color: 'none', position: [0, 2], hasMoved: false };
        gameState.board[0][3] = { type: 'empty', color: 'none', position: [0, 3], hasMoved: false };

        // Get valid moves for the king
        const position = blackKing.position as Position;
        const castlePosition: Position = [0, 2]; // Queenside castle destination
        const result = validMoves(blackKing, position, gameState, 1, castlePosition) as ValidMoveReturn;

        // Verify castling is allowed
        expect(result.canCastle).toBe(true);
    });

    test('Black king cannot castle queenside through check', () => {
      // Create a black king that has not moved
      const blackKing = createPiece('king', 'black', [0, 4], 2);
      blackKing.hasMoved = false;

      // Create a black rook that has not moved
      const blackRook = createPiece('rook', 'black', [0, 0], 3);
      blackRook.hasMoved = false;

      // Create an attacking white rook targeting the path
      const whiteRook = createPiece('rook', 'white', [1, 3], 4);

      // Create the game state with these pieces
      const gameState = createTestBoard([blackKing, blackRook, whiteRook]);

      // Ensure the spaces between king and rook are empty
      gameState.board[0][1] = { type: 'empty', color: 'none', position: [0, 1], hasMoved: false };
      gameState.board[0][2] = { type: 'empty', color: 'none', position: [0, 2], hasMoved: false };
      gameState.board[0][3] = { type: 'empty', color: 'none', position: [0, 3], hasMoved: false };

      // Get valid moves for the king
      const position = blackKing.position as Position;
      const castlePosition: Position = [0, 2]; // Queenside castle destination
      const result = validMoves(blackKing, position, gameState, 1, castlePosition) as ValidMoveReturn;

      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });

    test('King cannot castle if it has moved', () => {
      // Create a white king that HAS moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = true;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = false;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook]);
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });

    test('King cannot castle if rook has moved', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that HAS moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = true;
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook]);
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });

    test('King cannot castle through pieces', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = false;
      
      // Create a piece blocking the castling path
      const blockingPiece = createPiece('knight', 'white', [7, 5], 4);
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook, blockingPiece]);
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });

    test('King cannot castle when in check', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = false;
      
      // Create an enemy piece putting the king in check
      const blackRook = createPiece('rook', 'black', [0, 4], 4);
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook, blackRook]);
      
      // Mark the king as being in check
      gameState.checkStatus.white = true;
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });

    test('King cannot castle through a square under attack', () => {
      // Create a white king that has not moved
      const whiteKing = createPiece('king', 'white', [7, 4], 2);
      whiteKing.hasMoved = false;
      
      // Create a white rook that has not moved
      const whiteRook = createPiece('rook', 'white', [7, 7], 3);
      whiteRook.hasMoved = false;
      
      // Create an enemy piece attacking a square in the castling path
      const blackRook = createPiece('rook', 'black', [5, 5], 4);
      
      // Create the game state with these pieces
      const gameState = createTestBoard([whiteKing, whiteRook, blackRook]);
      
      // Manually set up threatening squares to include castle path square [7, 5]
      gameState.threateningPiecesPositions.black[0] = [[7, 5]]; // Attack castling path
      
      // Get valid moves for the king
      const position = whiteKing.position as Position;
      const castlePosition: Position = [7, 6]; // Kingside castle destination
      const result = validMoves(whiteKing, position, gameState, 2, castlePosition) as ValidMoveReturn;
      
      // Verify castling is not allowed
      expect(result.canCastle).toBe(false);
    });
  });
});