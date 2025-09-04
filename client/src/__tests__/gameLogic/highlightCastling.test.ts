import validMoves from '../../gameLogic/validMoves';
import { createEmptyBoard, createPiece } from '../../testUtils/testBoards';
import { GameStateType, PiecePositions, PieceType, Position, ValidMoveReturn } from '../../types/clientTypes';

describe('highlight castling moves', () => {
  test('king highlights castling squares', () => {
    const board = createEmptyBoard();

    // Create pieces needed for castling
    const whiteKing = createPiece('king', 'white', [7, 4], 0);
    const rookQueenside = createPiece('rook', 'white', [7, 0], 1);
    const rookKingside = createPiece('rook', 'white', [7, 7], 2);

    board[7][4] = whiteKing;
    board[7][0] = rookQueenside;
    board[7][7] = rookKingside;

    const piecePositions = {
      white: [whiteKing, rookQueenside, rookKingside] as PiecePositions[],
      black: [] as PiecePositions[],
    };

    const gameState: GameStateType = {
      board,
      history: [],
      turn: 'white',
      kingPositions: { black: [0, 4], white: [7, 4] },
      threateningPiecesPositions: { black: [], white: [] },
      piecePositions,
      checkStatus: { black: false, white: false, direction: -1 },
      checkmateStatus: { black: false, white: false },
      username1: '',
      username2: '',
    };

    const playerNumber = 2; // white

    const basicResult = validMoves(whiteKing, whiteKing.position as Position, gameState, playerNumber, whiteKing.position as Position) as ValidMoveReturn;
    let moves = basicResult.moves || [];

    // Manually check castling destinations
    const castleTargets: Position[] = [
      [7, 6],
      [7, 2],
    ];

    castleTargets.forEach(target => {
      const castleResult = validMoves(whiteKing, whiteKing.position as Position, gameState, playerNumber, target) as ValidMoveReturn;
      if (castleResult.canCastle) {
        moves.push(target);
      }
    });

    expect(moves).toEqual(expect.arrayContaining([[7, 6], [7, 2]]));
  });
});

