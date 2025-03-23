import { Position, GameStateType, PieceNameWithoutNone, PieceType, PieceMoveType, PiecePositions } from "../types/clientTypes";

// Helper function to ensure a position is always a valid [number, number] tuple
function ensureValidPosition(pos: Position): [number, number] {
  if (!pos || pos.length === 0) {
    return [0, 0]; // Default position if empty array
  }
  return pos as [number, number];
}

const pieceMoveFunctions = {
    'pawn': getPawnMoves,
    'rook': getLinearMoves,
    'knight': getFixedMoves,
    'bishop': getLinearMoves,
    'queen': getLinearMoves,
    'king': getFixedMoves,
};


const linearDirections = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const kingDirections = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];


function getMovesForPiece(piece: PieceMoveType | PieceType | PiecePositions, position: Position, gameState: GameStateType): Position[] {
  if (piece?.type && piece.type in pieceMoveFunctions) {      
      // Ensure position is a valid [number, number] tuple
      const validPosition = ensureValidPosition(position);
      
      const moves: Position[] = pieceMoveFunctions[piece.type as PieceNameWithoutNone](piece as PieceMoveType, validPosition, gameState).filter((move): move is Position => move !== null);
      
      if (piece.type === 'king') {
          const opponentColor = gameState.playerNumber === 1 ? 'white' : 'black';
          const threatenedSquares = gameState.threateningPiecesPositions && gameState.threateningPiecesPositions[opponentColor];
          return moves.filter((move: Position ) => move && (!threatenedSquares || !threatenedSquares.some(([ty, tx]) => ty === move[0] && tx === move[1])));
      }
      return moves;
  }
  return [];
}
function getPawnMoves(piece: PieceType, position: Position, gameState: GameStateType) {
    const moves: Position[] = [];
  
    // Determine forward direction based on pawn color.
    const isBlack = gameState.board[position[0]!][position[1]!].color === 'black';
    const forwardRow = isBlack ? position[0]! + 1 : position[0]! - 1;
    const forward: Position = [forwardRow, position[1]!];
  
  
    // Check that forwardRow is within bounds before accessing board.
    if (
      forward[0]! >= 0 &&
      forward[0]! < gameState.board.length &&
      forward[1]! >= 0 &&
      forward[1]! < gameState.board[0].length &&
      gameState.board[forward[0]!][forward[1]!].type === 'empty'
    ) {
      moves.push(forward);
    }
  
    // If pawn hasn't moved, test the two-square forward move.
    if (piece.hasMoved === false) {
      const forwardTwoRow = isBlack ? position[0]! + 2 : position[0]! - 2;
      const forwardTwo: Position = [forwardTwoRow, position[1]!];
      // Ensure both forward squares are within bounds.
      if (
        forward[0]! >= 0 &&
        forward[0]! < gameState.board.length &&
        forwardTwo[0]! >= 0 &&
        forwardTwo[0]! < gameState.board.length &&
        gameState.board[forward[0]!][forward[1]!].type === 'empty' &&
        gameState.board[forwardTwo[0]!][forwardTwo[1]!].type === 'empty'
      ) {
        moves.push(forwardTwo);
      }
    }
  
    // Diagonal captures:
    const leftCapture: Position = [
      isBlack ? position[0]! + 1 : position[0]! - 1,
      isBlack ? position[1]! + 1 : position[1]! - 1
    ];
    const rightCapture: Position = [
      isBlack ? position[0]! + 1 : position[0]! - 1,
      isBlack ? position[1]! - 1 : position[1]! + 1
    ];
    const oppositeColor = gameState.board[position[0]!][position[1]!].color === 'white' ? 'black' : 'white';
  
    // Check bounds before verifying the capture square.
    if (
      leftCapture[0] >= 0 &&
      leftCapture[0] < gameState.board.length &&
      leftCapture[1] >= 0 &&
      leftCapture[1] < gameState.board[0].length &&
      gameState.board[leftCapture[0]][leftCapture[1]]?.color === oppositeColor
    ) {
      moves.push(leftCapture);
    }
    if (
      rightCapture[0] >= 0 &&
      rightCapture[0] < gameState.board.length &&
      rightCapture[1] >= 0 &&
      rightCapture[1] < gameState.board[0].length &&
      gameState.board[rightCapture[0]][rightCapture[1]]?.color === oppositeColor
    ) {
      moves.push(rightCapture);
    }
    return moves;
  }
  export { getPawnMoves, getMovesForPiece, getLinearMoves, getFixedMoves };

function getLinearMoves(piece: PieceMoveType, position: [number, number], gameState: GameStateType) {
    let directions;
    if (piece.type === 'rook') {
        directions = linearDirections.slice(0, 4); // up, down, left, right
    } else if (piece.type === 'bishop') {
        if (piece.color === 'black') {
            directions = bishopDirections; 
        } else {
            directions = bishopDirections; 
        }
    } else {
        directions = linearDirections; // all eight directions
    }
    const linearMoves = directions.flatMap(([dy, dx]) => {
        const positions = [];
        for (let i = 0; i < 7; i++) {
            const newPosition = [position[0] + dy * (i + 1), position[1] + dx * (i + 1)];
            if (newPosition[0] < 0 || newPosition[0] > 7 || newPosition[1] < 0 || newPosition[1] > 7) {
                break; // guard clause to stop further iteration in this direction
            } 
            positions.push(newPosition);
            const pieceAtNewPosition = gameState.board[newPosition[0]][newPosition[1]];
            if (pieceAtNewPosition.type !== 'empty') {
                if (pieceAtNewPosition.color === piece.color) {
                    // Remove the last position if the piece at the new position is a friendly piece
                    positions.pop();
                    break; // guard clause to stop further iteration in this direction
                }
                break;
            }
        }
        return positions;
    });
    
    // Only flatten the array if it's a 2D array
    // Remove the flattening operation
    const flattenedMoves = linearMoves;
    return flattenedMoves;
}

function getFixedMoves(piece: PieceMoveType, position: Position, gameState: GameStateType) {
    if (piece.type !== 'knight' && piece.type !== 'king') {
        throw new Error('This function only supports knights and kings');
    }

    const directions = piece.type === 'knight' ? knightDirections : kingDirections;
    const [y, x] = position;

    const moves = directions.map(([dy, dx]) => {
        const newY = y! + dy;
        const newX = x! + dx;
        if (
            newY >= 0 &&
            newY < 8 &&
            newX >= 0 &&
            newX < 8 &&
            (!gameState.board[newY][newX] || gameState.board[newY][newX].color !== piece.color)
        ) {
            return [newY, newX];
        }
        return null;
    });
    let validMoves = moves.filter(move => move !== null) as Position[];

    if (piece.type === 'king') {
        // Prevent king from moving adjacent to the opposing king.
        const opponentColor = piece.color === 'white' ? 'black' : 'white';
        const oppKingPos = gameState.kingPositions[opponentColor];
        validMoves = validMoves.filter(move => {
            return Math.abs(move[0]! - oppKingPos[0]!) > 1 || Math.abs(move[1]! - oppKingPos[1]!) > 1;
        });
    }
    return validMoves;
}

export default getMovesForPiece;