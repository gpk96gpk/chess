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

function isKnightAttackingPosition(
  kingPosition: Position,
  gameState: GameStateType,
  currentPlayerColor: PieceColor
): boolean {
  const knightOffsets: Position[] = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1]
  ];
  // In this file, current player's pieces are attacking the opponent king.
  const currentKnights = gameState.piecePositions[currentPlayerColor].filter(piece => piece.type === 'knight');
  for (const knight of currentKnights) {
    const [ky, kx] = knight.position;
    for (const [dy, dx] of knightOffsets) {
      const newY = ky! + dy!;
      const newX = kx! + dx!;
      if (newY >= 0 && newY < 8 && newX >= 0 && newX < 8) {
        if (newY === kingPosition[0] && newX === kingPosition[1]) {
          return true;
        }
      }
    }
  }
  return false;
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
if (isKnightAttackingPosition(gameState.kingPositions[opponentColor], gameState, currentPlayerColor)) {
  // Special handling for knights - they don't have a linear direction
  // Create a custom threatening square entry for the knight
  threateningSquaresCopy = [...threateningSquares] as ThreateningSquares;
  
  // Find the knight that's causing check
  const currentKnights = gameState.piecePositions[currentPlayerColor as PieceColor]
    .filter(p => p.type === 'knight');
  
  for (const knight of currentKnights) {
    const [ky, kx] = knight.position;
    const kingPos = gameState.kingPositions[opponentColor];
    
    // Check if this knight is attacking the king
    const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dy, dx] of knightOffsets) {
      const newY = ky! + dy;
      const newX = kx! + dx;
      if (newY === kingPos[0] && newX === kingPos[1]) {
        // This knight is causing check - add its position to a special knight direction (8)
        // Make sure direction 8 exists
        if (!threateningSquaresCopy[8]) {
          threateningSquaresCopy[8] = [];
        }
        // Add the knight position to this direction
        threateningSquaresCopy[8].push([ky!, kx!] as number & number[]);
        
        // Set check direction to 8 (knight attack)
        gameState.checkStatus.direction = 8;
        break;
      }
    }
  }
} else {
  // For non-knight checks, use normal threatening squares
  threateningSquaresCopy = calculateThreateningSquares(gameState, currentPlayerColor, piece as PieceType, lastPosition);
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

  // Save the check status before canBlock potentially modifies it
  const finalCheckStatus = isKingInCheck;


  function canBlock(gameState: GameStateType, threateningSquares: ThreateningSquares, 
    checkingPiecePosition: Position, currentPlayerColor: string, piece: PieceType): boolean {
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
        if (Array.isArray(square)) {
          const [y, x] = square;
          squarePiece = gameState.board[y][x];
          if (squarePiece.type === 'king' && squarePiece.color === opponentColor) {
            continue; // Skip to the next iteration of the inner loop if the squarePiece is the current player's king
          }
          if (directionIndex >= 8 && squarePiece.type !== 'knight') {
            continue; // Skip to the next iteration of the inner loop if the squarePiece is not an opponent's knight
          }
          if (!squarePiece || squarePiece.color === 'none' || !squarePiece.color) {
            continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
          }
        }
        
        if (squarePiece!.color === opponentColor ) {
          break;
        }
        if ((directionIndex < 4 && squarePiece!.type !== 'rook' && squarePiece!.type !== 'queen') ||
            (directionIndex >= 4 && directionIndex < 8 && squarePiece!.type !== 'bishop' && squarePiece!.type !== 'queen') || 
            (directionIndex >= 8 && squarePiece!.type !== 'knight') || // Check if the squarePiece is not an opponent's knight
            (directionIndex >= 4 && directionIndex < 8 && squarePiece!.type === 'pawn') // Check if the squarePiece is a pawn and it's the first coordinate in the diagonal direction
        ) {
            isKingInCheck = false;

          } else if (squarePiece!.color === currentPlayerColor){
            breakOuterLoop = true; // Set the flag to break the outer loop
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
            return false; // End loop and return false
          }
  
          if ((directionIndex === 4 || directionIndex === 5 || directionIndex === 6 || directionIndex === 7) && squarePiece!.type === 'pawn') {
              gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
              continue; // Break the loop and move to the next direction
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
  isKingInCheck = false;
  return true; // Return false if no blocking piece is found after checking all pieces
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

 // === Save our check detection result before canBlock can modify it ===
 //const isInCheck = isKingInCheck;
// === Save our check detection result before canBlock can modify it ===

 // Store the direction that was found during check detection
 const detectedDirection = gameState.checkStatus.direction;

const isKingInCheckMate: boolean = false; // Checkmate logic is separate
const firstTriggeringOpponentPiece = firstTriggeringCurrentPiece;

// Return the original check status captured before calling canBlock
return {
  isOpponentKingInCheck: finalCheckStatus,
  isKingInCheckMate,
  loser: opponentColor,
  slicedThreateningSquares,
  checkDirection: detectedDirection,
  firstTriggeringOpponentPiece
};
}

export default isCheckOpponent;