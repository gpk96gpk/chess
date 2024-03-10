import { GameStateType, Position, PieceType, PlayerNumber, ThreateningSquares, Color, PieceColor } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
//import isCheckmate from './isCheckmate';

interface CheckResult {
  isKingInCheck: boolean;
  isKingInCheckmate?: boolean;
  loser: Color | '';
  slicedThreateningSquares?: number[][]; // Add this line
  checkDirection?: number;
  firstTriggeringOpponentPiece?: PieceType | undefined;
  firstTriggeringOpponentPieceIndex?: number;
}
function isCheck(gameState: GameStateType, threateningSquares: ThreateningSquares, opponentPlayerNumber: PlayerNumber, checkPosition: Position | null, piece: PieceType, position: Position | [], playerNumber: PlayerNumber, lastPosition: Position | null, matchFoundInDirection: number, currentPlayerColor: PieceColor | Color): CheckResult {
  console.log(
    'Game State:', gameState as GameStateType, 
    'Threatening Squares:', threateningSquares as ThreateningSquares, 
    'Opponent Player Number:', opponentPlayerNumber as PlayerNumber, 
    'Check Position:', checkPosition as Position, 
    'Piece:', piece as PieceType, 
    'Position:', position as Position, 
    'Player Number:', playerNumber as PlayerNumber, 
    'Last Position:', lastPosition as Position, 
    'Match Found In Direction:', matchFoundInDirection as number, 
    'Current Player Color:', currentPlayerColor as Color
  );  console.log('7322threateningSquares', threateningSquares)
  console.log('7322gameState', gameState)
  const pieceColor = piece.color as PieceColor;  
  const pieceType = piece.type;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  let firstTriggeringOpponentPiece;
  let directionIndex;
  let slicedThreateningSquares: number[][] = [];
  console.log('5556pieceLastPosition', pieceLastPosition)
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

  //const kingPosition = lastPosition ? lastPosition : gameState.kingPositions[currentPlayerColor];

  let isKingInCheck = gameState.checkStatus[currentPlayerColor as PieceColor];
  
  function isKnightAttackingPosition(): boolean {
    // Assuming gameState.board is a 2D array representing the game board
    const threateningSquares = gameState.board.slice(8, 16).map((row, y) =>
      row.length > 0 ? row.map((_, x) => [y + 8, x]) : []
    ).flat().filter(coord => coord !== null);
  
    // Get the positions of the opponent's knights
    console.log('7322gameState', gameState);
    const opponentKnights = gameState.piecePositions[opponentColor].filter(piece => piece.type === 'knight');
  
    for (const knight of opponentKnights) {
      const [knightY, knightX] = knight.position;
  
      // Check if the knight is in a position that could attack the king
      if (threateningSquares.some(([y, x]) => y === knightY && x === knightX)) {
        isKingInCheck = true;
        return true;
      }
    }
  
    return false;
  }
  function canBlock(gameState: GameStateType, threateningSquares: Position[][] | Position[], 
    checkingPiecePosition: Position, currentPlayerColor: PieceColor, piece: PieceType): boolean {
    console.log('7322gameState', gameState);
    console.log('7322piece', piece, pieceIndex);
    console.log('7322lastPosition', pieceLastPosition);
    console.log('7322canBlockParams', gameState, threateningSquares, 
    checkingPiecePosition, currentPlayerColor); 
    console.log('7322threateningSquares', threateningSquares)
    let squarePiece: PieceType;

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
    //let newThreateningSquares = [];

    for (directionIndex = 0; directionIndex < threateningSquaresCopy.length; directionIndex++) {
      console.log(`5556Iterating over direction ${directionIndex}`); // Log the current direction
  
      if (threateningSquaresCopy[directionIndex].length === 0) {
          console.log(`5556Row ${directionIndex} is empty`, gameState);
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }
  
      let breakOuterLoop = false; // Flag to break the outer loop
      for (const square of threateningSquaresCopy[directionIndex] as Position[]) {
        const [y, x] = square;
        squarePiece = gameState.board[y][x];
        console.log('5556squarePiece', square, squarePiece, gameState)
        console.log(`5556Iterating over square ${square} with squarePiece color ${squarePiece.color}`, gameState, squarePiece); // Log the current square and squarePiece color
          
        if (!squarePiece || squarePiece.color === 'none' || !squarePiece.color) {
          console.log(`5556No piece or color at square ${square}`); // Log the result
          continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
        }
        const color = playerNumber === 1 ? 'black' : 'white';
        const opponentColor = color === 'white' ? 'black' : 'white';
        console.log(`5556color`, color, opponentColor, squarePiece.color)
        if (squarePiece.color === color ) {
          console.log(`5556Friendly's piece found at square ${square}`, color); // Log the result
          //firstTriggeringOpponentPiece = squarePiece; // Store the first triggering opponent piece
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
            (directionIndex >= 4 && directionIndex < 8 && squarePiece.type === 'pawn') // Check if the squarePiece is a pawn and it's the first coordinate in the diagonal direction
            ) {
              console.log(`5556No opponent pieces hit in direction ${directionIndex} at square ${square}`); // Log the result
              isKingInCheck = false;
              break; // Skip to the next iteration of the inner loop if the squarePiece is not a rook, bishop, queen, or knight

          } else if (squarePiece.color === opponentColor){
            console.log(`5556Opponent piece hit in direction ${directionIndex} at square ${square}`); // Log the result
            breakOuterLoop = true; // Set the flag to break the outer loop
            isKingInCheck = true;
            gameState.checkStatus[currentPlayerColor] = true; // Set the checkStatus in the gameState
            gameState.checkStatus.direction = directionIndex; // Set the checkDirection in the gameState
            checkPosition = square; // Set the checkPosition in the gameState
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
  
          const opponentPlayerPieces = gameState.piecePositions[opponentColor].map((existingPiece) => {
            console.log(`7778Existing piece id: ${existingPiece.id}`); // Log the id of the existing piece
        
            // if (!piece) {
            //     return existingPiece;
            // }
        
            console.log(`7778Piece index: ${squarePiece.index}`); // Log the piece index
        
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
          console.log(`5556opponentPlayerPieces`, opponentPlayerPieces);
          for (let squareIndex = 0; squareIndex < threateningSquares.length; squareIndex++) {
              for (let pieceIndex = 0; pieceIndex < opponentPlayerPieces.length; pieceIndex++) {
                  if (opponentPlayerPieces[pieceIndex].position![0] === threateningSquares[squareIndex][0] as number && 
                      opponentPlayerPieces[pieceIndex].position![1] === threateningSquares[squareIndex][1] as number) {
                      console.log(`5556Piece at position (${opponentPlayerPieces[pieceIndex].position![0]}, ${opponentPlayerPieces[pieceIndex].position![1]}) can block the check.`);
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
                if (!piece || piece.type !== 'knight' || piece.color !== opponentColor) {
                    console.log(`5556Last direction is blank or not an opponent's knight at square ${lastSquare}`);
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
canBlock(gameState, threateningSquares as Position[][] | Position[], checkPosition!, opponentColor, piece); 

// Assuming firstTriggeringOpponentPiece is a coordinate like [y, x]
let firstTriggeringOpponentPieceIndex = -1;
const checkDirection = gameState.checkStatus.direction;
const currentPlayerThreateningSquares = gameState.threateningPiecesPositions[currentPlayerColor as PieceColor] ;
console.log('843firstTriggeringOpponentPiece', firstTriggeringOpponentPiece)
console.log('843threateningSquares', gameState.threateningPiecesPositions[currentPlayerColor as PieceColor], gameState, currentPlayerThreateningSquares[checkDirection], checkDirection, Array.isArray(currentPlayerThreateningSquares))
let slicedCoordinates: number[] | number[][] = [];
//firstTriggeringOpponentPieceIndex = checkDirection;

if (currentPlayerThreateningSquares[checkDirection] && Array.isArray(currentPlayerThreateningSquares[checkDirection])) {
  for (let i = 0; i < currentPlayerThreateningSquares[checkDirection].length; i++) {
    const square = currentPlayerThreateningSquares[checkDirection][i];
    if (Array.isArray(square)) {
      const [y, x] = square;
      const piece = gameState.board[y][x];
      console.log('843piece', piece)
      console.log('843currentPlayerThreateningSquares[checkDirection]', currentPlayerThreateningSquares[checkDirection])
  
      if (piece && piece.color === opponentColor) {
        firstTriggeringOpponentPiece = piece;
        console.log('843firstTriggeringOpponentPiece', firstTriggeringOpponentPiece)
        slicedCoordinates = currentPlayerThreateningSquares[checkDirection].slice(0, i + 1);
        console.log('843slicedCoordinates', slicedCoordinates)
        break;
      }
    }
  }
}

console.log('843firstTriggeringOpponentPieceIndex:', firstTriggeringOpponentPieceIndex);
console.log('843slicedCoordinates:', slicedCoordinates);
if (slicedCoordinates && Array.isArray(slicedCoordinates)) {
  if (slicedCoordinates) {
    for (let i = 0; i < slicedCoordinates.length; i++) {    
      const squares = slicedCoordinates[i] as number[];
      console.log('843squares', squares)
    for (let j = 0; j < squares.length; j++) {
      console.log('843square', squares, 'firstTriggeringOpponentPiece.position', lastPosition)
      if (squares[0] === lastPosition![0] && squares[1] === lastPosition![1]) {
        firstTriggeringOpponentPieceIndex = i;
        gameState.checkStatus.direction = i;
        console.log('843Match found at index:', i, gameState);
        break;
      }
    }
    if (firstTriggeringOpponentPieceIndex !== -1) {
      console.log('843firstTriggeringOpponentPieceIndex', firstTriggeringOpponentPieceIndex)
      break;
    }
  }
}


  console.log('843firstTriggeringOpponentPieceIndex', firstTriggeringOpponentPieceIndex)
}

// If firstTriggeringOpponentPiece is found in the array
if (firstTriggeringOpponentPieceIndex !== -1) {
  // Slice the array to get only the elements before firstTriggeringOpponentPiece
  slicedThreateningSquares = slicedCoordinates as number[][];
  console.log('843slicedThreateningSquares', slicedThreateningSquares)
}
if (piece.type === 'king') {
  // Check if the king's move is in the threatening squares
  
  for (let checkDirection = 0; checkDirection < threateningSquares.length; checkDirection++) {
    for (let threateningPieceIndex = 0; threateningPieceIndex < threateningSquares[checkDirection].length; threateningPieceIndex++) {
      const square = threateningSquares[checkDirection][threateningPieceIndex];
      if (Array.isArray(square)) {
        const [y, x] = square;
        const piece = gameState.board[y][x];
  
        if (piece.color === opponentColor) {
          // Break and set firstTriggeringOpponentPieceIndex and firstTriggeringOpponentPiece to checkDirection and threateningPieceIndex
          firstTriggeringOpponentPieceIndex = checkDirection;
          firstTriggeringOpponentPiece = piece;
          break;
        }
  
        if (piece.color === currentPlayerColor) {
          // Skip to the next row
          continue;
        }
      }
    }
  }
  if (gameState.threateningPiecesPositions[currentPlayerColor as PieceColor].some(square => square[0] === lastPosition![0] && square[1] === lastPosition![1])) {
    // If the king's move is in the threatening squares and the king is not taking the threatening piece, return false
    if (!(lastPosition![0] === firstTriggeringOpponentPiece?.position![0] && lastPosition![1] === firstTriggeringOpponentPiece.position[1])) {
      isKingInCheck = true;
    }
  } else {
    // Create a copy of the game state to simulate the king's move
    const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));

    // Move the king to the new position
    hypotheticalGameState.board[piece.position![0 as number]][piece.position![1 as number]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
    hypotheticalGameState.board[lastPosition![0]][lastPosition![1]] = piece;
    hypotheticalGameState.threateningPiecesPositions[currentPlayerColor] = calculateThreateningSquares(hypotheticalGameState, currentPlayerColor as PieceColor, piece, lastPosition!);
    console.log('843hypotheticalGameState', hypotheticalGameState)
    // Check if the king would be in check in the new position
    const canKingMove = canBlock(hypotheticalGameState, hypotheticalGameState.threateningPiecesPositions[currentPlayerColor], checkPosition!, currentPlayerColor as PieceColor, piece)
    console.log('843canKingMove', canKingMove)
    if (canKingMove) {
      // If the king would still be in check, return false
      isKingInCheck = false;
    }
  }
}
console.log('7322isKingInCheck', isKingInCheck)
if (isKingInCheck) {
  //const isCheckmateResult = isCheckmate(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, 
  //  playerNumber, lastPosition, threatenedSquaresWithOpponentPieces);
  //isKingInCheckMate = isCheckmateResult.isInCheckmate;
} else {
  console.log('7322King is not in check or checkmate.');
}
  console.log('843checkDirection', checkDirection, gameState)
  return { isKingInCheck, loser: currentPlayerColor, slicedThreateningSquares, checkDirection, firstTriggeringOpponentPiece, firstTriggeringOpponentPieceIndex };
}

export default isCheck;