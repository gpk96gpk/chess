import { GameState, Piece as PieceType, Position } from '../types/clientTypes';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';
import validMoves from './validMoves';

function findThreateningPieces(gameState: GameState, kingPosition: Position, currentPlayerColor: string) {
  const threateningPieces = [];

  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.color !== currentPlayerColor) {
        const piecePosition: Position = [i, j];
        const pieceMoves = getMovesForPiece(piece, piecePosition, gameState);
        if (pieceMoves.some(move => move[0] === kingPosition[0] && move[1] === kingPosition[1])) {
          threateningPieces.push({ ...piece, position: piecePosition });
        }
      }
    }
  }

  return threateningPieces;
}

function getPositionsBetween(pos1: Position, pos2: Position) {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;

  const positions = [];

  const xStep = x1 < x2 ? 1 : x1 > x2 ? -1 : 0;
  const yStep = y1 < y2 ? 1 : y1 > y2 ? -1 : 0;

  let x = x1 + xStep;
  let y = y1 + yStep;

  while (x !== x2 || y !== y2) {
    positions.push([x, y]);
    x += xStep;
    y += yStep;
  }

  return positions;
}

function canBlock(gameState: GameState, kingPosition: Position, threateningPiecePosition: Position, currentPlayerColor: string) {
  const positionsBetween = getPositionsBetween(kingPosition, threateningPiecePosition);
  console.log("88Positions between king and threatening piece:", positionsBetween);

  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.color === currentPlayerColor && piece.type !== 'king' && !positionsBetween.some(pos => pos[0] === i && pos[1] === j)) {
        console.log("88Checking piece at position", [i, j], "which is a", piece.type);
        const piecePosition: Position = [i, j];
        const pieceMoves = getMovesForPiece(piece, piecePosition, gameState);
        console.log("88Possible moves for this piece are", pieceMoves);
        if (pieceMoves.some(move => positionsBetween.some(pos => pos[0] === move[0] && pos[1] === move[1]))) {
          console.log("88This piece can block the threatening piece");
          return true;
        }
      }
    }
  }

  console.log("88No piece can block the threatening piece");
  return false;
}

function canCapture(gameState, threateningPiece, currentPlayerColor) {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = gameState.board[x][y];
      if (piece && piece.color === currentPlayerColor) {
        const moves = getMovesForPiece(piece, [x, y], gameState);
        if (moves.some(move => move[0] === threateningPiece.position[0] && move[1] === threateningPiece.position[1])) {
          // If the piece is a king, check if it would be in check after the capture
          if (piece.type === 'king') {
            const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));
            hypotheticalGameState.board[threateningPiece.position[0]][threateningPiece.position[1]] = piece;
            hypotheticalGameState.board[x][y] = null;
            if (!isCheck(hypotheticalGameState, currentPlayerColor)) {
              return true;
            }
          } else {
            // If the piece is not a king, only allow it to capture the threatening piece if the square is not threatened
            const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));
            hypotheticalGameState.board[threateningPiece.position[0]][threateningPiece.position[1]] = piece;
            hypotheticalGameState.board[x][y] = null;
            if (!isCheck(hypotheticalGameState, currentPlayerColor)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}
function isAdjacent(pos1: Position, pos2: Position) {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;

  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

function isCheckmate(gameState: GameState, currentPlayerColor: number) {
  console.log('isCheck99', isCheck(gameState, currentPlayerColor))
  // console.log('playerNumber99:', playerNumber);
  console.log('currentPlayerColor99:', currentPlayerColor);
  if (!isCheck(gameState, currentPlayerColor)) {
    console.log('isCheckmateFalse99')
    return false; // Not in check, can't be checkmate
  }

  // Find the king's position
  let kingPosition: Position | null = null;
  //console.log('playerNumberCheckMate', playerNumber)
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const piece: PieceType | null = gameState.board[i][j];
      if (piece && piece.type === 'king' && piece.color === currentPlayerColor) {
        kingPosition = [i, j];
        break;
      }
    }
    if (kingPosition) break;
  }

  // Find the positions of all pieces that are threatening the king
  const threateningPieces = findThreateningPieces(gameState, kingPosition, currentPlayerColor);

  for (const threateningPiece of threateningPieces) {
    console.log("77Checking if", currentPlayerColor, "can capture", threateningPiece.type);

    // Check if any of the current player's pieces can capture the threatening piece
    const canCurrentPlayerCapture = canCapture(gameState, threateningPiece, currentPlayerColor);
    console.log("77Can current player capture?", canCurrentPlayerCapture);


    if (canCurrentPlayerCapture) {
      console.log("77Current player can capture, not checkmate");
      return { isCheckmate: false, loser: null };
    }

    // If the threatening piece is not a knight and is not adjacent to the king,
    // check if any of the current player's pieces can move between the king and the threatening piece
    if ((threateningPiece.type !== 'knight' && threateningPiece.type !== 'king') && !isAdjacent(kingPosition, threateningPiece.position)) {
      const canCurrentPlayerBlock = canBlock(gameState, kingPosition, threateningPiece.position, currentPlayerColor);
      console.log("77Can current player block?", canCurrentPlayerBlock);

      if (canCurrentPlayerBlock) {
        console.log("77Current player can block, not checkmate");
        return { isCheckmate: false, loser: null };
      }
    }
    console.log("77Current player can't capture or block, continuing to next piece");
  }

  // Check if the king can move to any safe square
  if (kingPosition) {
    console.log("77Checking if the king can move to a safe square");
    const king: PieceType = gameState.board[kingPosition[0]][kingPosition[1]];
    const kingValidMoves = validMoves(king, kingPosition, gameState, currentPlayerColor);
    const canCapture = kingValidMoves.some(move => {
      const tempGameState = JSON.parse(JSON.stringify(gameState)); // Create a copy of the game state
      tempGameState.board[kingPosition[0]][kingPosition[1]] = null; // Remove the king from its current position
      tempGameState.board[move[0]][move[1]] = king; // Place the king at the new position
      return !isCheck(tempGameState, currentPlayerColor); // If the new position is not in check, the king can capture
    });
    console.log("77Can the king capture?", canCapture);
    if (!canCapture && kingValidMoves.length > 0) {
      // If the king cannot capture a piece without being in check, it's checkmate
      console.log("77No safe moves for the king. It's checkmate.");
      return { isInCheckmate: true, loser: currentPlayerColor };
    } else {
      console.log("77King can move to a safe square. Not checkmate.");
      return { isInCheckmate: false, loser: null };
    }
  } else {
    console.log("77King position not found");
  }

  // If none of the above conditions are met, it's checkmate
  console.log("77No safe moves for the king. It's checkmate.");

  return { isInCheckmate: true, loser: currentPlayerColor };
}

export default isCheckmate;