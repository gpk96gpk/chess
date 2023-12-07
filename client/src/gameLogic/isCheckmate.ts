import { GameState, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';
import validMoves from './validMoves';

function getAttackPositions(position: Position): Position[] {
  const [x, y] = position;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

  const positions = directions.flatMap(([dx, dy]) =>
      Array.from({ length: 7 }, (_, i) => [x + dx * (i + 1), y + dy * (i + 1)])
  ).concat(
      knightMoves.map(([dx, dy]) => [x + dx, y + dy])
  );

  return positions.filter(([i, j]) => i >= 0 && i < 8 && j >= 0 && j < 8);
}

function findThreateningPieces(gameState: GameState, kingPosition: Position, currentPlayerColor: string) {
  const attackPositions = getAttackPositions(kingPosition);

  const threateningPieces = attackPositions
      .map(([i, j]) => ({ piece: gameState.board[i][j] as PieceType, position: [i, j] as Position }))
      .filter(({ piece }) => piece && piece.color !== currentPlayerColor)
      .filter(({ piece, position }) => {
          const pieceMoves = getMovesForPiece(piece, position, gameState);
          return pieceMoves.some(move => {
            if (!move || !kingPosition) {
                return false;
            }
            return move[0] === kingPosition[0] && move[1] === kingPosition[1];
          });
      })
      .map(({ piece, position }) => ({ ...piece, position }));

  return threateningPieces;
}

function getPositionsBetween(pos1: Position, pos2: Position) {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;

  const xStep = x1 < x2 ? 1 : x1 > x2 ? -1 : 0;
  const yStep = y1 < y2 ? 1 : y1 > y2 ? -1 : 0;

  const xLength = Math.abs(x2 - x1);
  const yLength = Math.abs(y2 - y1);
  const length = Math.max(xLength, yLength);

  return Array.from({ length }, (_, i) => [x1 + xStep * (i + 1), y1 + yStep * (i + 1)] as Position)
      .filter(([x, y]) => x !== x2 || y !== y2);
}

function canBlock(gameState: GameState, kingPosition: Position, threateningPiecePosition: Position, currentPlayerColor: string) {
  const positionsBetween = getPositionsBetween(kingPosition, threateningPiecePosition);

  const pieces = gameState.board.flat().map((piece, index) => ({ piece, position: [Math.floor(index / 8), index % 8] as Position }));
  const currentPlayerPieces = pieces.filter(({ piece }) => piece && piece.color === currentPlayerColor && piece.type !== 'king');

  const canBlock = currentPlayerPieces.some(({ piece, position }) => {
      const pieceMoves = getMovesForPiece(piece, position, gameState);
      return pieceMoves.some(move => positionsBetween.some(pos => pos[0] === move[0] && pos[1] === move[1]));
  });

  if (canBlock) {
      return true;
  } else {
      return false;
  }
}

function canCapture(gameState: GameState, threateningPiece, currentPlayerColor) {
  const pieces = gameState.board.flat().map((piece, index) => ({ piece, position: [Math.floor(index / 8), index % 8] as Position }));
  const currentPlayerPieces = pieces.filter(({ piece }) => piece && piece.color === currentPlayerColor);

  return currentPlayerPieces.some(({ piece, position }) => {
      const moves = getMovesForPiece(piece, position, gameState);
      return moves.some(move => {
          if (!move) {
              return false;
          }
          if (move[0] === threateningPiece.position[0] && move[1] === threateningPiece.position[1]) {
              // Create a hypothetical game state where the piece captures the threatening piece
              const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));
              hypotheticalGameState.board[threateningPiece.position[0]][threateningPiece.position[1]] = piece;
              hypotheticalGameState.board[position[0]][position[1]] = null;

              // Check if the hypothetical game state would be in check
              return !isCheck(hypotheticalGameState, currentPlayerColor);
          }
          return false;
      });
  });
}

function isAdjacent(pos1: Position, pos2: Position): boolean {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;

  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

function isCheckmate(gameState: GameState, kingPosition: [number, number], currentPlayerColor: string ) {
  const threateningPieces = findThreateningPieces(gameState, kingPosition, currentPlayerColor);

  // Store the valid moves for each piece in a map
  const validMovesMap = new Map();

  const canCurrentPlayerCapture = threateningPieces.some(threateningPiece => {
      const moves = validMovesMap.get(threateningPiece) || getMovesForPiece(threateningPiece, threateningPiece.position, gameState);
      validMovesMap.set(threateningPiece, moves);
      return canCapture(gameState, threateningPiece, currentPlayerColor, moves);
  });

  if (canCurrentPlayerCapture) {
      return { isCheckmate: false, loser: null };
  }

  const canCurrentPlayerBlock = threateningPieces.some(threateningPiece => {
      if ((threateningPiece.type !== 'knight' && threateningPiece.type !== 'king') && !isAdjacent(kingPosition, threateningPiece.position)) {
          const moves = validMovesMap.get(threateningPiece) || getMovesForPiece(threateningPiece, threateningPiece.position, gameState);
          validMovesMap.set(threateningPiece, moves);
          return canBlock(gameState, kingPosition, threateningPiece.position, currentPlayerColor, moves);
      }
      return false;
  });

  if (canCurrentPlayerBlock) {
      return { isCheckmate: false, loser: null };
  }

  if (kingPosition) {
    const king: PieceType = gameState.board[kingPosition[0]][kingPosition[1]];
    const kingValidMoves = validMoves(king, kingPosition, gameState, currentPlayerColor);
    const canKingCapture = kingValidMoves.some(move => {
        const tempGameState = JSON.parse(JSON.stringify(gameState));
        tempGameState.board[kingPosition[0]][kingPosition[1]] = null;
        tempGameState.board[move[0]][move[1]] = king;
        const attackPositions = getAttackPositions(tempGameState, move, currentPlayerColor);
        // If there are no opponent pieces that can threaten the king, no need to call isCheck
        if (attackPositions.length === 0) {
            return true;
        }
        return !isCheck(tempGameState);
    });
    if (!canKingCapture && kingValidMoves.length > 0) {
        return { isInCheckmate: true, loser: currentPlayerColor };
    } else {
        return { isInCheckmate: false, loser: null };
    }
}

return { isInCheckmate: true, loser: currentPlayerColor };
}

export default isCheckmate;