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
function isCheckOpponent(gameState: GameStateType, threateningSquares: ThreateningSquares, opponentPlayerNumber: PlayerNumber, checkPosition: Position, piece: PieceType | PiecePositions, position: Position, playerNumber: PlayerNumber, lastPosition: Position, matchFoundInDirection: number, currentPlayerColor: PieceColor): CheckResult {
  console.log('7322isCheckParams', gameState, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentPlayerColor)
  console.log('7322threateningSquares', threateningSquares)
  console.log('7322gameState', gameState)
  const pieceColor = piece.color;
  const pieceType = piece.type;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  const color = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  let firstTriggeringCurrentPiece: PieceType | undefined;
  let directionIndex: number;
  let slicedThreateningSquares!: number[];
  console.log('5556pieceLastPosition', pieceLastPosition, pieceIndex)
  if (pieceLastPosition) {
    const [lastY, lastX] = pieceLastPosition;
    gameState.board[lastY][lastX] = {
        type: pieceType,
        color: pieceColor,
        position: pieceLastPosition,
        hasMoved: true,
        isHighlighted: false,
        index: pieceIndex
    };
  }
  if (!gameState || !playerNumber || !gameState.kingPositions) {
    return { isKingInCheck: false, isKingInCheckMate: false, loser: '' };
  }

  //const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';

  let isKingInCheck = gameState.checkStatus[opponentColor];
  function isKnightAttackingPosition(): boolean {
    // Assuming gameState.board is a 2D array representing the game board
    const threateningSquares = gameState.board.slice(8, 16).map((row, y) =>
      row.length > 0 ? row.map((_, x) => [y + 8, x]) : []
    ).flat();
  
    // Get the positions of the opponent's knights
    console.log('7322gameState', gameState);
    const currentKnights = gameState.piecePositions[currentPlayerColor as 'black' | 'white'].filter(piece => piece.type === 'knight');
  
    for (const knight of currentKnights) {
      const [knightY, knightX] = knight.position;
  
      // Check if the knight is in a position that could attack the king
      if (threateningSquares.some(coord => Array.isArray(coord) && coord[0] === knightY && coord[1] === knightX)) {
        isKingInCheck = true;
        return true;
      }
    }
  
    return false;
  }
  function canBlock(gameState: GameStateType, threateningSquares: ThreateningSquares, 
    checkingPiecePosition: Position, currentPlayerColor: string, piece: PieceType): boolean {
    console.log('7322gameState', gameState);
    console.log('7322piece', piece, pieceIndex);
    console.log('7322lastPosition', pieceLastPosition);
    console.log('7322canBlockParams', gameState, threateningSquares, 
    checkingPiecePosition, currentPlayerColor); 
    console.log('7322threateningSquares', threateningSquares)
    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
    let squarePiece;

    
    if (isKnightAttackingPosition()) {
      console.log('7322Knight is attacking the checking piece.');
      return true;
    }
    
    const currentPlayerPieces = gameState.piecePositions[currentPlayerColor as PieceColor];
    console.log('7322currentPlayerPieces', currentPlayerPieces);
    console.log('5556threateningSquares', threateningSquares, opponentColor);
    let threateningSquaresCopy: ThreateningSquares = threateningSquares;
    
    console.log('7322threateningSquaresCopy', threateningSquaresCopy);
    //let newThreateningSquares = [];
    
    if (piece.type === 'king' && lastPosition[0] !== gameState.kingPositions[opponentColor][0] && lastPosition[1] !== gameState.kingPositions[opponentColor][1]) {
      console.log('7322King is moving to a new position.');
      threateningSquaresCopy = calculateThreateningSquares(gameState, opponentColor, piece, lastPosition);
      console.log('7322newThreateningSquares', threateningSquaresCopy);
      
    }
    for (directionIndex = 0; directionIndex < threateningSquaresCopy.length; directionIndex++) {
      console.log(`5556Iterating over direction ${directionIndex}`, threateningSquaresCopy[directionIndex]); // Log the current direction
  
      if (threateningSquaresCopy[directionIndex].length === 0) {
          console.log(`5556Row ${directionIndex} is empty`, gameState, threateningSquaresCopy[directionIndex]);
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }
  
      let breakOuterLoop = false; // Flag to break the outer loop
      for (const square of threateningSquaresCopy[directionIndex]) {
        if (Array.isArray(square)) {
          const [y, x] = square;
          squarePiece = gameState.board[y][x];
          console.log('5556squarePiece', square, squarePiece, gameState)
          console.log(`5556Iterating over square ${square} with squarePiece color ${squarePiece.color}`, gameState, squarePiece); // Log the current square and squarePiece color
          if (squarePiece.type === 'king' && squarePiece.color === opponentColor) {
            console.log(`5556King found at square ${square}`); // Log the result
            continue; // Skip to the next iteration of the inner loop if the squarePiece is the current player's king
          }
          if (directionIndex >= 8 && squarePiece.type !== 'knight') {
            console.log(`5556No opponent's knight at square ${square}`); // Log the result
            continue; // Skip to the next iteration of the inner loop if the squarePiece is not an opponent's knight
          }
          if (!squarePiece || squarePiece.color === 'none' || !squarePiece.color) {
            console.log(`5556No piece or color at square ${square}`); // Log the result
            continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
          }
        }
        
        console.log(`5556color`, color, squarePiece!.color, opponentColor, squarePiece!.color === opponentColor)
        if (squarePiece!.color === opponentColor ) {
          console.log(`5556Opponent's piece found at square ${square}`, color); // Log the result
          //firstTriggeringCurrentPiece = squarePiece; // Store the first triggering opponent piece
          //breakOuterLoop = true; // Set the flag to break the outer loop
          break;
        }
        // if (squarePiece.color === currentPlayerColor) {
        //   console.log(`5556Current player's piece found at square ${square}`); // Log the result
        //   breakOuterLoop = true; // Set the flag to break the outer loop
        //   break; // Break the inner loop and move to the next direction
        // }
        if ((directionIndex < 4 && squarePiece!.type !== 'rook' && squarePiece!.type !== 'queen') ||
            (directionIndex >= 4 && directionIndex < 8 && squarePiece!.type !== 'bishop' && squarePiece!.type !== 'queen') || 
            (directionIndex >= 8 && squarePiece!.type !== 'knight') || // Check if the squarePiece is not an opponent's knight
            (directionIndex >= 4 && directionIndex < 8 && squarePiece!.type === 'pawn') // Check if the squarePiece is a pawn and it's the first coordinate in the diagonal direction
        ) {
            console.log(`5556No opponent pieces hit in direction ${directionIndex} at square ${square}`); // Log the result
            isKingInCheck = false;

          } else if (squarePiece!.color === currentPlayerColor){
            console.log(`5556Current piece hit in direction ${directionIndex} at square ${square}`); // Log the result
            breakOuterLoop = true; // Set the flag to break the outer loop
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
            console.log('843checkDirection', gameState.checkStatus.direction)
            console.log('7322isKingInCheck1', isKingInCheck)
            return false; // End loop and return false
          }
  
          if ((directionIndex === 4 || directionIndex === 5 || directionIndex === 6 || directionIndex === 7) && squarePiece!.type === 'pawn') {
              console.log(`5556Pawn hit in direction ${directionIndex} at square ${square}`); // Log the result
              gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
              console.log('843checkDirection', gameState.checkStatus.direction)
              continue; // Break the loop and move to the next direction
          }
  
          const currentPlayerPieces = gameState.piecePositions[currentPlayerColor as PieceColor].map((existingPiece) => {
            console.log(`7778Existing piece id: ${existingPiece.id}`); // Log the id of the existing piece
        
            // if (!piece) {
            //     return existingPiece;
            // }
        
            console.log(`7778Piece index: ${pieceIndex}`); // Log the piece index
        
            if (existingPiece.id === pieceIndex) {
                console.log(`7778Matching id found. Updating position to: ${pieceLastPosition}`); // Log the new position
        
                return {
                    ...existingPiece,
                    position: pieceLastPosition, // Update the position to the lastPosition
                };
            } else {
                return existingPiece;
            }
        }); // Get the opponent's pieces
          console.log(`5556currentPlayerPieces`, currentPlayerColor, currentPlayerPieces);
          for (let squareIndex = 0; squareIndex < threateningSquares.length; squareIndex++) {
              for (let pieceIndex = 0; pieceIndex < currentPlayerPieces.length; pieceIndex++) {
                  if (currentPlayerPieces[pieceIndex].position[0] === threateningSquares[squareIndex][0] && 
                      currentPlayerPieces[pieceIndex].position[1] === threateningSquares[squareIndex][1]) {
                      console.log(`5556Piece at position (${currentPlayerPieces[pieceIndex].position[0]}, ${currentPlayerPieces[pieceIndex].position[1]}) can block the check.`);
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
              console.log(`5556Last direction is blank or not an current player's knight at square ${lastSquare}`);
              isKingInCheck = false;
              return true;
            }
          }
        } else {
          console.log(`5556Last direction is off the board`);
          isKingInCheck = false;
          return true;
        }
    }
  }
  isKingInCheck = false;
  return true; // Return false if no blocking piece is found after checking all pieces
}


console.log('7322gameState.history.length', gameState.history.length)
canBlock(gameState, threateningSquares, checkPosition, currentPlayerColor, piece as PieceType); 

// Assuming firstTriggeringCurrentPiece is a coordinate like [y, x]
let firstTriggeringCurrentPieceIndex = -1;
let firstTriggeringCurrentPieceCoordinates: number[] = [];
const checkDirection = gameState.checkStatus.direction;
const opponentThreateningSquares = gameState.threateningPiecesPositions[opponentColor];
console.log('843firstTriggeringCurrentPiece', firstTriggeringCurrentPiece)
console.log('843threateningSquares', gameState.threateningPiecesPositions[currentPlayerColor], gameState, checkDirection)
let slicedCoordinates: number[] | number[][] = [];
//firstTriggeringCurrentPieceIndex = checkDirection;

if (opponentThreateningSquares[checkDirection] && Array.isArray(opponentThreateningSquares[checkDirection])) {
  for (let i = 0; i < opponentThreateningSquares[checkDirection].length; i++) {
    const square = opponentThreateningSquares[checkDirection][i];
    if (Array.isArray(square)) {
      const [y, x] = square;
      const piece = gameState.board[y][x];
      console.log('843piece', piece)
      console.log('843opponentThreateningSquares[checkDirection]', opponentThreateningSquares[checkDirection])

      if (piece.type === 'king') {
        const kingPosition = lastPosition;
        console.log('843kingPosition', kingPosition, firstTriggeringCurrentPieceCoordinates, isKingInCheck)
        if (kingPosition[0] !== firstTriggeringCurrentPieceCoordinates[0] && firstTriggeringCurrentPieceCoordinates[1] !== x && isKingInCheck === true) {
          console.log('843King is moving into check while in check');
          continue;
          //return { isKingInCheck: true, isKingInCheckmate: true, loser: '' };
        }
      }
      console.log('843piece', piece.color, currentPlayerColor, [y, x], checkDirection)
      if (piece && piece.color === currentPlayerColor) {
        firstTriggeringCurrentPiece = piece;
        firstTriggeringCurrentPieceCoordinates = [y, x];
        firstTriggeringCurrentPieceIndex = -1;
        console.log('843piece.type', piece.type)
        console.log('843firstTriggeringCurrentPiece', firstTriggeringCurrentPiece)
        slicedCoordinates = opponentThreateningSquares[checkDirection].slice(0, i + 1);
        console.log('843slicedCoordinates', slicedCoordinates)
        break;
      }
    }
  }
}
console.log('843firstTriggeringCurrentPieceIndex:', firstTriggeringCurrentPieceIndex);
console.log('843slicedCoordinates:', slicedCoordinates);
if (slicedCoordinates && Array.isArray(slicedCoordinates)) {
  if (slicedCoordinates) {
    for (let i = 0; i < slicedCoordinates.length; i++) {    
      const squares = slicedCoordinates[i] as number[];
      console.log('843squares', squares)
    for (let j = 0; j < squares.length; j++) {
      console.log('843square', squares, 'firstTriggeringCurrentPiece.position', lastPosition)
      if (squares[0] === lastPosition[0] && squares[1] === lastPosition[1] && firstTriggeringCurrentPieceIndex === -1) {
        firstTriggeringCurrentPieceIndex = i;
        console.log('843Match found at index:', i);
        break;
      }
    }
    if (firstTriggeringCurrentPieceIndex !== -1) {
      console.log('843firstTriggeringCurrentPieceIndex', firstTriggeringCurrentPieceIndex)
      break;
    }
  }
}


  console.log('843firstTriggeringCurrentPieceIndex', firstTriggeringCurrentPieceIndex)
}

// If firstTriggeringCurrentPiece is found in the array
if (firstTriggeringCurrentPieceIndex !== -1) {
  // Slice the array to get only the elements before firstTriggeringCurrentPiece
  slicedThreateningSquares = slicedCoordinates as number[];
  console.log('843slicedThreateningSquares', slicedThreateningSquares)
}
const isKingInCheckMate: boolean = false;

console.log('7322isKingInCheck', isKingInCheck)
if (isKingInCheck) {
  //const isCheckmateResult = isCheckmate(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, 
  //  playerNumber, lastPosition, threatenedSquaresWithOpponentPieces);
  //isKingInCheckMate = isCheckmateResult.isInCheckmate;
  if (isKingInCheckMate) {
    console.log('7322King is in checkmate.');
  }
} else {
  console.log('7322King is not in check or checkmate.');
}
  console.log('843checkDirection', checkDirection, gameState)
  const firstTriggeringOpponentPiece = firstTriggeringCurrentPiece;
  const isOpponentKingInCheck = isKingInCheck;
  return { isOpponentKingInCheck, isKingInCheckMate, loser: opponentColor, slicedThreateningSquares, checkDirection, firstTriggeringOpponentPiece };
}

export default isCheckOpponent;