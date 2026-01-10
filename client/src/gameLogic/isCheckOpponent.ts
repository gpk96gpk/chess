import { GameStateType, Position, PieceType, ThreateningSquares, PlayerNumber, PieceColor, PiecePositions } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
//import isCheckmate from './isCheckmate';

interface CheckResult {
  isKingInCheck?: boolean;
  isKingInCheckMate: boolean;
  loser: string;
  isOpponentKingInCheck?: boolean;
  slicedThreateningSquares?: number[][] | number[] | number;
  checkDirection?: number;
  firstTriggeringOpponentPiece?: PieceType | undefined;
  firstTriggeringOpponentPieceIndex?: number;
}

function getKnightAttackerPosition(
  kingPosition: Position,
  gameState: GameStateType,
  attackingColor: PieceColor
): Position | null {
  const knightOffsets: Position[] = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1]
  ];

  for (const [dy, dx] of knightOffsets) {
    const y = kingPosition[0]! + dy!;
    const x = kingPosition[1]! + dx!;
    if (y >= 0 && y < 8 && x >= 0 && x < 8) {
      const piece = gameState.board[y][x];
      if (piece.type === 'knight' && piece.color === attackingColor) {
        return [y, x];
      }
    }
  }
  return null;
}

function isPawnAttackingKing(kingPosition: Position, gameState: GameStateType, attackingColor: PieceColor): boolean {
  const [ky, kx] = kingPosition;
  
  // Check diagonal positions from king's perspective
  // These are the directions where pawns could be attacking from
  const pawnAttackDirections = attackingColor === 'white' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
  
  for (const [dy, dx] of pawnAttackDirections) {
    const y = ky! + dy;
    const x = kx! + dx;
    
    // Check if position is on board
    if (y >= 0 && y < 8 && x >= 0 && x < 8) {
      const piece = gameState.board[y][x];
      if (piece && piece.type === 'pawn' && piece.color === attackingColor) {
        return true;
      }
    }
  }
  
  return false;
}

function isCheckOpponent(gameState: GameStateType, threateningSquares: ThreateningSquares, opponentPlayerNumber: PlayerNumber, checkPosition: Position, piece: PieceType | PiecePositions, position: Position, playerNumber: PlayerNumber, lastPosition: Position, matchFoundInDirection: number, currentPlayerColor: PieceColor): CheckResult {
  if (!gameState) {
    console.error(opponentPlayerNumber, position, matchFoundInDirection)
  }
  const pieceColor = piece.color;
  const pieceType = piece.type;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  const color = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  let firstTriggeringCurrentPiece: PieceType | undefined;
  let directionIndex: number;
  let slicedThreateningSquares!: number[];
  if (pieceLastPosition) {
    const [lastY, lastX] = pieceLastPosition;
    gameState.board[lastY!][lastX!] = {
        type: pieceType,
        color: pieceColor!,
        position: pieceLastPosition,
        hasMoved: true,
        isHighlighted: false,
        index: pieceIndex
    };
  }
  if (!gameState || !playerNumber || !gameState.kingPositions) {
    return { isOpponentKingInCheck: false, isKingInCheckMate: false, loser: '' };
  }

  // Initialize check status
  let isKingInCheck = false;
  const kingPosition: Position = gameState.kingPositions[opponentColor];
  
  // Check for knight attacks
  let threateningSquaresCopy: ThreateningSquares;
  const knightAttackPos = getKnightAttackerPosition(
    gameState.kingPositions[opponentColor],
    gameState,
    currentPlayerColor
  );

  if (knightAttackPos) {
    // Special handling for knights - they don't have a linear direction
    threateningSquaresCopy = [...threateningSquares] as ThreateningSquares;
    if (!threateningSquaresCopy[8]) {
      threateningSquaresCopy[8] = [];
    }
    threateningSquaresCopy[8].push(knightAttackPos as number & number[]);
    gameState.checkStatus.direction = 8;
    isKingInCheck = true;
  } else {
    // For non-knight checks, use normal threatening squares
    threateningSquaresCopy = calculateThreateningSquares(
      gameState,
      currentPlayerColor,
      piece as PieceType,
      lastPosition
    );
  }

  
  // Check for pawn attacks
  if (isPawnAttackingKing(kingPosition, gameState, currentPlayerColor)) {
    isKingInCheck = true;
  }

  // Check for rook and queen attacks (horizontal and vertical)
  const rookDirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
  for (const [dy, dx] of rookDirs) {
    let y = kingPosition[0]! + dy;
    let x = kingPosition[1]! + dx;
    
    while (y >= 0 && y < 8 && x >= 0 && x < 8) {
      if (gameState.board[y][x].type !== 'empty') {
        if (gameState.board[y][x].color === currentPlayerColor && 
            (gameState.board[y][x].type === 'rook' || gameState.board[y][x].type === 'queen')) {
          isKingInCheck = true;
        }
        break; // Stop at first piece
      }
      y += dy;
      x += dx;
    }
  }
  
  // Check for bishop and queen attacks (diagonal)
  const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // diagonal directions
  for (const [dy, dx] of bishopDirs) {
    let y = kingPosition[0]! + dy;
    let x = kingPosition[1]! + dx;
    
    while (y >= 0 && y < 8 && x >= 0 && x < 8) {
      if (gameState.board[y][x].type !== 'empty') {
        if (gameState.board[y][x].color === currentPlayerColor && 
            (gameState.board[y][x].type === 'bishop' || gameState.board[y][x].type === 'queen')) {
          isKingInCheck = true;
        }
        break; // Stop at first piece
      }
      y += dy;
      x += dx;
    }
  }
  
  // Check for king attacks (adjacent squares)
  const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  for (const [dy, dx] of kingMoves) {
    const y = kingPosition[0]! + dy;
    const x = kingPosition[1]! + dx;
    
    if (y >= 0 && y < 8 && x >= 0 && x < 8) {
      if (gameState.board[y][x].color === currentPlayerColor && gameState.board[y][x].type === 'king') {
        isKingInCheck = true;
      }
    }
  }


  function canBlock(
    gameState: GameStateType,
    threateningSquares: ThreateningSquares,
    checkingPiecePosition: Position,
    currentPlayerColor: string,
    piece: PieceType
  ): boolean {
    if (!gameState){
      console.error('7322canBlockParams', threateningSquares, checkingPiecePosition, currentPlayerColor); 
    }
    
    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
    let squarePiece;

    let threateningSquaresCopy: ThreateningSquares = threateningSquares;
        
    if (piece.type === 'king' && lastPosition[0] !== gameState.kingPositions[opponentColor][0] && lastPosition[1] !== gameState.kingPositions[opponentColor][1]) {
      threateningSquaresCopy = calculateThreateningSquares(gameState, opponentColor, piece, lastPosition);
      
    }
    for (directionIndex = 0; directionIndex < threateningSquaresCopy.length; directionIndex++) {
      if (threateningSquaresCopy[directionIndex].length === 0) {
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }

      let breakOuterLoop = false; // Flag to break the outer loop
      for (const square of threateningSquaresCopy[directionIndex]) {
        if (!Array.isArray(square)) continue;
        const [y, x] = square as number[];
        squarePiece = gameState.board[y][x];
        // Skip empties
        if (!squarePiece || squarePiece.color === 'none') continue;
        // Defender piece blocks the ray immediately
        if (squarePiece.color === opponentColor) break;

        // From here, first non-empty must be an attacking piece (currentPlayerColor)
        // Pawn: only valid if it attacks the king from the first diagonal square
        if (directionIndex >= 4 && directionIndex < 8 && squarePiece.type === 'pawn') {
          const pawnY = y;
          const pawnX = x;
          const pawnAttacks = squarePiece.color === 'black'
            ? [[pawnY + 1, pawnX - 1], [pawnY + 1, pawnX + 1]]
            : [[pawnY - 1, pawnX - 1], [pawnY - 1, pawnX + 1]];
          if (pawnAttacks.some(([py, px]) => py === checkingPiecePosition[0] && px === checkingPiecePosition[1])) {
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex;
            breakOuterLoop = true;
          }
          break; // Do not scan past a pawn
        }

        // Orthogonal rays: rook or queen
        if (directionIndex < 4) {
          if (squarePiece.color === currentPlayerColor && (squarePiece.type === 'rook' || squarePiece.type === 'queen')) {
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex;
            breakOuterLoop = true;
          }
          break; // First piece blocks this ray
        }

        // Diagonal rays: bishop or queen
        if (directionIndex >= 4 && directionIndex < 8) {
          if (squarePiece.color === currentPlayerColor && (squarePiece.type === 'bishop' || squarePiece.type === 'queen')) {
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex;
            breakOuterLoop = true;
          }
          break; // First piece blocks this ray
        }

        // Knight rays: only knights
        if (directionIndex >= 8) {
          if (squarePiece.color === currentPlayerColor && squarePiece.type === 'knight') {
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex;
            breakOuterLoop = true;
          }
          break; // First piece blocks this ray
        }

        const currentPlayerPieces = gameState.piecePositions[currentPlayerColor as PieceColor].map((existingPiece) => {
            if (existingPiece.id === pieceIndex) {        
                return {
                    ...existingPiece,
                    position: pieceLastPosition, // Update the position to the lastPosition
                };
            } else {
                return existingPiece;
            }
        }); // Get the opponent's pieces
          for (let squareIndex = 0; squareIndex < threateningSquares.length; squareIndex++) {
              for (let pieceIndex = 0; pieceIndex < currentPlayerPieces.length; pieceIndex++) {
                  if (currentPlayerPieces[pieceIndex].position[0] === threateningSquares[squareIndex][0] && 
                      currentPlayerPieces[pieceIndex].position[1] === threateningSquares[squareIndex][1]) {
                      breakOuterLoop = true; // Set the flag to break the outer loop
                      break; // Break the loop and move to the next direction
                  }
              }
              if (breakOuterLoop) {
                  break; // Break the inner loop
              }
          }
          if (breakOuterLoop) {
              break; // Break the loop and move to the next direction
          }
      }
      if (breakOuterLoop) {
        break; // Skip to the next iteration of the outer loop if the flag is set
      }
      // Check if it's the last direction and if it's blank or not an opponent's knight
      if (directionIndex === threateningSquaresCopy.length - 1) {
        if (threateningSquaresCopy[directionIndex].length > 0) {
          const lastSquare = threateningSquaresCopy[directionIndex][threateningSquaresCopy[directionIndex].length - 1];
          if (Array.isArray(lastSquare)) {
            const [y, x] = lastSquare;
            const piece = gameState.board[y][x];
            if (!piece || piece.type !== 'knight' || piece.color !== currentPlayerColor) {
              isKingInCheck = false;
              return true;
            }
          }
        } else {
          isKingInCheck = false;
          return true;
        }
    }
  }
  isKingInCheck = !!isKingInCheck;
  return true;
  }

canBlock(gameState, threateningSquares, checkPosition, currentPlayerColor, piece as PieceType); 

// Assuming firstTriggeringCurrentPiece is a coordinate like [y, x]
let firstTriggeringCurrentPieceIndex = -1;
let firstTriggeringCurrentPieceCoordinates: number[] = [];
const checkDirection = gameState.checkStatus.direction;
const opponentThreateningSquares = gameState.threateningPiecesPositions[opponentColor];
let slicedCoordinates: number[] | number[][] = [];

if (opponentThreateningSquares[checkDirection] && Array.isArray(opponentThreateningSquares[checkDirection])) {
  for (let i = 0; i < opponentThreateningSquares[checkDirection].length; i++) {
    const square = opponentThreateningSquares[checkDirection][i];
    if (Array.isArray(square)) {
      const [y, x] = square;
      const piece = gameState.board[y][x];

      if (piece.type === 'king') {
        const kingPosition = lastPosition;
        if (kingPosition[0] !== firstTriggeringCurrentPieceCoordinates[0] && firstTriggeringCurrentPieceCoordinates[1] !== x && isKingInCheck === true) {
          continue;
        }
      }
      if (piece && piece.color === currentPlayerColor) {
        firstTriggeringCurrentPiece = piece;
        firstTriggeringCurrentPieceCoordinates = [y, x];
        firstTriggeringCurrentPieceIndex = -1;
        slicedCoordinates = opponentThreateningSquares[checkDirection].slice(0, i + 1);
        break;
      }
    }
  }
}

if (slicedCoordinates && Array.isArray(slicedCoordinates)) {
  if (slicedCoordinates) {
    for (let i = 0; i < slicedCoordinates.length; i++) {    
      const squares = slicedCoordinates[i] as number[];
    for (let j = 0; j < squares.length; j++) {
      if (squares[0] === lastPosition[0] && squares[1] === lastPosition[1] && firstTriggeringCurrentPieceIndex === -1) {
        firstTriggeringCurrentPieceIndex = i;
        break;
      }
    }
    if (firstTriggeringCurrentPieceIndex !== -1) {
      break;
    }
  }
}


}

// If firstTriggeringCurrentPiece is found in the array
if (firstTriggeringCurrentPieceIndex !== -1) {
  // Slice the array to get only the elements before firstTriggeringCurrentPiece
  slicedThreateningSquares = slicedCoordinates as number[];
}


// Store the direction that was found during check detection
const detectedDirection = gameState.checkStatus.direction;
// Call canBlock but don't let it override our check detection
canBlock(gameState, threateningSquares, checkPosition, currentPlayerColor, piece as PieceType);
  

const isKingInCheckMate: boolean = false; // Checkmate logic is separate
const firstTriggeringOpponentPiece = firstTriggeringCurrentPiece;
const finalCheckStatus = isKingInCheck;
return { isOpponentKingInCheck: finalCheckStatus, isKingInCheckMate, loser: opponentColor, slicedThreateningSquares, checkDirection: detectedDirection, firstTriggeringOpponentPiece };

}

export default isCheckOpponent;
