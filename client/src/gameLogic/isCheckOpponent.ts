import { GameStateType, Position, Piece as PieceType, Move } from '../types/clientTypes';
import isCheckmate from './isCheckmate';

interface CheckResult {
  isKingInCheck: boolean;
  isKingInCheckmate: boolean;
  loser: string;
}
function isCheckOpponent(gameState, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentPlayerColor): CheckResult {
  console.log('7322isCheckParams', gameState, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentPlayerColor)
  console.log('7322threateningSquares', threateningSquares)
  console.log('7322gameState', gameState)
  const pieceColor = piece.color;
  const pieceType = piece.type;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  let firstTriggeringCurrentPiece;
  let directionIndex;
  let slicedThreateningSquares;
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
    return { isKingInCheck: false, isKingInCheckmate: false, loser: '' };
  }

  const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';

  const kingPosition = lastPosition ? lastPosition : gameState.kingPositions[opponentColor];

  let isKingInCheck = gameState.checkStatus[opponentColor];
  function isKnightAttackingPosition(): boolean {
    // Assuming gameState.board is a 2D array representing the game board
    const threateningSquares = gameState.board.slice(8, 16).map((row, y) =>
      row.length > 0 ? row.map((cell, x) => [y + 8, x]) : null
    ).flat().filter(coord => coord !== null);
  
    // Get the positions of the opponent's knights
    console.log('7322gameState', gameState);
    const currentKnights = gameState.piecePositions[currentPlayerColor].filter(piece => piece.type === 'knight');
  
    for (let knight of currentKnights) {
      const [knightY, knightX] = knight.position;
  
      // Check if the knight is in a position that could attack the king
      if (threateningSquares.some(([y, x]) => y === knightY && x === knightX)) {
        isKingInCheck = true;
        return true;
      }
    }
  
    return false;
  }
  function canBlock(gameState: GameStateType, threateningSquares: Position[][][], 
    checkingPiecePosition: Position, currentPlayerColor: string, piece, lastPosition): boolean {
    console.log('7322gameState', gameState);
    console.log('7322piece', piece, pieceIndex);
    console.log('7322lastPosition', pieceLastPosition);
    console.log('7322canBlockParams', gameState, threateningSquares, 
    checkingPiecePosition, currentPlayerColor); 
    console.log('7322threateningSquares', threateningSquares)
    let squarePiece;

    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
    if (isKnightAttackingPosition()) {
      console.log('7322Knight is attacking the checking piece.');
      return true;
    }

    const currentPlayerPieces = gameState.piecePositions[currentPlayerColor];
    console.log('7322currentPlayerPieces', currentPlayerPieces);
    console.log('5556threateningSquares', threateningSquares, opponentColor);
    const threateningSquaresCopy = threateningSquares;

    console.log('7322threateningSquaresCopy', threateningSquaresCopy);
    let newThreateningSquares = [];

    for (directionIndex = 0; directionIndex < threateningSquaresCopy.length; directionIndex++) {
      console.log(`5556Iterating over direction ${directionIndex}`, threateningSquaresCopy[directionIndex]); // Log the current direction
  
      if (threateningSquaresCopy[directionIndex].length === 0) {
          console.log(`5556Row ${directionIndex} is empty`, gameState, threateningSquaresCopy[directionIndex]);
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }
  
      let breakOuterLoop = false; // Flag to break the outer loop
      for (let square of threateningSquaresCopy[directionIndex]) {
        const [y, x] = square;
        squarePiece = gameState.board[y][x];
        console.log('5556squarePiece', square, squarePiece, gameState)
        console.log(`5556Iterating over square ${square} with squarePiece color ${squarePiece.color}`, gameState, squarePiece); // Log the current square and squarePiece color
        if (directionIndex >= 8 && squarePiece.type !== 'knight') {
          console.log(`5556No opponent's knight at square ${square}`); // Log the result
          continue; // Skip to the next iteration of the inner loop if the squarePiece is not an opponent's knight
        }
        if (!squarePiece || squarePiece.color === 'none' || !squarePiece.color) {
          console.log(`5556No piece or color at square ${square}`); // Log the result
          continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
        }
        const color = playerNumber === 1 ? 'black' : 'white';
        const opponentColor = color === 'white' ? 'black' : 'white';
        console.log(`5556color`, color, squarePiece.color, opponentColor, squarePiece.color === opponentColor)
        if (squarePiece.color === opponentColor ) {
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
        if ((directionIndex < 4 && squarePiece.type !== 'rook' && squarePiece.type !== 'queen') ||
            (directionIndex >= 4 && directionIndex < 8 && squarePiece.type !== 'bishop' && squarePiece.type !== 'queen') || 
            (directionIndex >= 8 && squarePiece.type !== 'knight') || // Check if the squarePiece is not an opponent's knight
            (directionIndex >= 4 && directionIndex < 8 && squarePiece.type === 'pawn' && squareIndex === 0) // Check if the squarePiece is a pawn and it's the first coordinate in the diagonal direction
        ) {
            console.log(`5556No opponent pieces hit in direction ${directionIndex} at square ${square}`); // Log the result
            isKingInCheck = false;

          } else if (squarePiece.color === currentPlayerColor){
            console.log(`5556Current piece hit in direction ${directionIndex} at square ${square}`); // Log the result
            breakOuterLoop = true; // Set the flag to break the outer loop
            isKingInCheck = true;
            gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
            console.log('843checkDirection', gameState.checkStatus.direction)
            console.log('7322isKingInCheck1', isKingInCheck)
            return false; // End loop and return false
          }
  
          if ((directionIndex === 4 || directionIndex === 5 || directionIndex === 6 || directionIndex === 7) && squarePiece.type === 'pawn') {
              console.log(`5556Pawn hit in direction ${directionIndex} at square ${square}`); // Log the result
              gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
              console.log('843checkDirection', gameState.checkStatus.direction)
              continue; // Break the loop and move to the next direction
          }
  
          const currentPlayerPieces = gameState.piecePositions[currentPlayerColor].map((existingPiece) => {
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
                      currentPlayerPieces[pieceIndex].position[1] === threateningSquares[squareIndex][1] && 
                      !currentPlayerPieces[pieceIndex].canBlock) {
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
            const [y, x] = lastSquare;
            let piece = gameState.board[y][x];
            if (!piece || piece.type !== 'knight' || piece.color !== currentPlayerColor) {
                console.log(`5556Last direction is blank or not an current player's knight at square ${lastSquare}`);
                isKingInCheck = false;
                return true;
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
canBlock(gameState, threateningSquares, checkPosition, currentPlayerColor, piece, lastPosition); 

// Assuming firstTriggeringCurrentPiece is a coordinate like [y, x]
let firstTriggeringCurrentPieceIndex = -1;
const checkDirection = gameState.checkStatus.direction;
const opponentThreateningSquares = gameState.threateningPiecesPositions[opponentColor];
console.log('843firstTriggeringCurrentPiece', firstTriggeringCurrentPiece)
console.log('843threateningSquares', gameState.threateningPiecesPositions[currentPlayerColor], gameState, checkDirection)
let slicedCoordinates = [];
//firstTriggeringCurrentPieceIndex = checkDirection;

if (opponentThreateningSquares[checkDirection] && Array.isArray(opponentThreateningSquares[checkDirection])) {
for (let i = 0; i < opponentThreateningSquares[checkDirection].length; i++) {
  let [y, x] = opponentThreateningSquares[checkDirection][i];
  let piece = gameState.board[y][x];
  console.log('843piece', piece)
  console.log('843opponentThreateningSquares[checkDirection]', opponentThreateningSquares[checkDirection])

  if (piece && piece.color === currentPlayerColor) {
    firstTriggeringCurrentPiece = piece;
    console.log('843firstTriggeringCurrentPiece', firstTriggeringCurrentPiece)
    slicedCoordinates = opponentThreateningSquares[checkDirection].slice(0, i + 1);
    console.log('843slicedCoordinates', slicedCoordinates)
    break;
  }
}
}

console.log('843firstTriggeringCurrentPieceIndex:', firstTriggeringCurrentPieceIndex);
console.log('843slicedCoordinates:', slicedCoordinates);
if (slicedCoordinates && Array.isArray(slicedCoordinates)) {
  if (slicedCoordinates) {
    for (let i = 0; i < slicedCoordinates.length; i++) {    
      let squares = slicedCoordinates[i];
      console.log('843squares', squares)
    for (let j = 0; j < squares.length; j++) {
      console.log('843square', squares, 'firstTriggeringCurrentPiece.position', lastPosition)
      if (squares[0] === lastPosition[0] && squares[1] === lastPosition[1]) {
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
  slicedThreateningSquares = slicedCoordinates;
  console.log('843slicedThreateningSquares', slicedThreateningSquares)
}
let isKingInCheckMate;
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
  //Update this line to rename the outout of firsttriggeringopponentpiece to firsttriggeringcurrentpiece 
  return { isOpponentKingInCheck, isKingInCheckMate, loser: opponentColor, slicedThreateningSquares, checkDirection, firstTriggeringOpponentPiece };
}

export default isCheckOpponent;