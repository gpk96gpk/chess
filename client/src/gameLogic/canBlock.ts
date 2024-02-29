import { GameStateType, Position } from "../types/clientTypes";


function isKnightAttackingPosition(kingPosition: [number, number], gameState: GameStateType, opponentColor: string): boolean {
    console.log('999King position:', kingPosition, gameState, opponentColor);
    const currentPlayerColor = opponentColor === 'white' ? 'black' : 'white';
    const [kingY, kingX] = gameState.kingPositions[currentPlayerColor];
    const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    // Get the positions of the opponent's knights
    const opponentKnights = gameState.piecePositions[opponentColor].filter(piece => piece.type === 'knight');

    for (let knight of opponentKnights) {
      const [knightY, knightX] = knight.position;

      // Check if the knight is in a position that could attack the king
      for (let [dy, dx] of knightDirections) {
        if (knightY + dy === kingY && knightX + dx === kingX) {
          isKingInCheck = true;
          return true;
        }
      }
    }

    return false;
  }

function canBlock(gameState: GameStateType, threateningSquares: Position[][][], 
    checkingPiecePosition: Position, currentPlayerColor: string, piece, lastPosition): boolean {
    console.log('999Can block:', gameState, threateningSquares, checkingPiecePosition, currentPlayerColor, piece, lastPosition);
    const pieceColor = piece.color;
    const pieceType = piece.type;
    const pieceIndex = piece.index;
    let squarePiece;
    let isKingInCheck;
    const pieceLastPosition = lastPosition;
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

    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
    if (isKnightAttackingPosition(checkingPiecePosition, gameState, opponentColor)) {
      return true;
    }

    const threateningSquaresCopy = [...threateningSquares];

    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      console.log('999Direction:', directionIndex);
      if (threateningSquaresCopy[directionIndex].length === 0) {
          console.log('999Empty direction:', directionIndex);
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }
  
      let breakOuterLoop = false; // Flag to break the outer loop
      for (let square of threateningSquaresCopy[directionIndex]) {
        console.log('999Square:', square, threateningSquaresCopy, threateningSquaresCopy[directionIndex]);
        const [y, x] = square;
        squarePiece = gameState.board[y][x];
        console.log('999Square piece:', squarePiece, directionIndex,'color', currentPlayerColor);

        if (!squarePiece || !squarePiece.color|| squarePiece.type === 'empty') {
          console.log('999Empty square:', squarePiece);
          continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
        }
        if (directionIndex < 8 && squarePiece.color === currentPlayerColor) {
          console.log('999Current player piece:', squarePiece);
          // breakOuterLoop = true; // Set the flag to break the outer loop
          isKingInCheck = false;
          break; // Break the loop and move to the next direction
        }
        if (squarePiece.color === opponentColor) {
          console.log('999Opponent piece:', squarePiece);
          //breakOuterLoop = true; // Set the flag to break the outer loop
          break;
        }
        console.log('999directionIndex:', directionIndex, squarePiece.type)
        if ((directionIndex < 4 && squarePiece.type !== 'rook' && squarePiece.type !== 'queen') ||
            (directionIndex >= 4 && directionIndex < 8 && squarePiece.type !== 'bishop' && squarePiece.type !== 'queen') || 
            (directionIndex >= 8 && squarePiece.type !== 'knight') || // Check if the squarePiece is not an opponent's knight
            (directionIndex >= 4 && directionIndex < 8 && squarePiece.type === 'pawn' && squareIndex === 0) // Check if the squarePiece is a pawn and it's the first coordinate in the diagonal direction
        ) {
            console.log('999Invalid piece:', squarePiece);
            isKingInCheck = false;

          } 
          // else if (squarePiece.color === currentPlayerColor){
          //   console.log('999Current player piece:', squarePiece);
          //   breakOuterLoop = true; // Set the flag to break the outer loop
          //   isKingInCheck = true;
          //   return false; // Break the loop and move to the next direction
          // }  
  
          if ((directionIndex === 4 || directionIndex === 5 || directionIndex === 6 || directionIndex === 7) && squarePiece.type === 'pawn') {
            console.log('999Pawn:', squarePiece);
            continue; // Break the loop and move to the next direction
          }
  
          const opponentPlayerPieces = gameState.piecePositions[opponentColor].map((existingPiece) => {
        
            // if (!piece) {
            //     return existingPiece;
            // }
        
            console.log('999Existing piece:', existingPiece);
            if (existingPiece.id === pieceIndex) {
                console.log('999Piece:', piece, pieceLastPosition, existingPiece.position, pieceLastPosition === existingPiece.position, pieceLastPosition[0] === existingPiece.position[0] && pieceLastPosition[1] === existingPiece.position[1])
                return {
                    ...existingPiece,
                    position: pieceLastPosition, // Update the position to the lastPosition
                };
            } else {
                console.log('999Existing piece:', existingPiece);
                return existingPiece;
            }
        }); // Get the opponent's pieces
          for (let squareIndex = 0; squareIndex < threateningSquares.length; squareIndex++) {
              for (let pieceIndex = 0; pieceIndex < opponentPlayerPieces.length; pieceIndex++) {
                  console.log('999Piece:', opponentPlayerPieces[pieceIndex], 'Square:', threateningSquares[squareIndex], squareIndex, threateningSquares);
                  if (opponentPlayerPieces[pieceIndex].position[0] === threateningSquares[squareIndex][0] && 
                  opponentPlayerPieces[pieceIndex].position[1] === threateningSquares[squareIndex][1]) {
                      console.log('999Can block:', opponentPlayerPieces[pieceIndex]);
                      breakOuterLoop = true; // Set the flag to break the outer loop
                      break; // Break the loop and move to the next direction
                  }
              }
              if (breakOuterLoop) {
                  console.log('999Break outer loop:', breakOuterLoop, squareIndex, threateningSquares.length);
                  break; // Break the inner loop
              }
          }
          if (breakOuterLoop) {
              console.log('999Break outer loop:', breakOuterLoop, directionIndex);
              break; // Break the loop and move to the next direction
          }
      }
      if (breakOuterLoop) {
        console.log('999Break outer loop:', breakOuterLoop, directionIndex);
        break; // Skip to the next iteration of the outer loop if the flag is set
      }
      // Check if it's the last direction and if it's blank or not an opponent's knight
      if (directionIndex === threateningSquaresCopy.length - 1) {
        if (threateningSquaresCopy[directionIndex].length > 0) {
            const lastSquare = threateningSquaresCopy[directionIndex][threateningSquaresCopy[directionIndex].length - 1];
            const [y, x] = lastSquare;
            let piece = gameState.board[y][x];
            if (!piece || piece.type !== 'knight' || piece.color !== opponentColor) {
                isKingInCheck = false;
                return true;
            }
        } else {
            isKingInCheck = false;
            return true;
        }
    }
  }
  isKingInCheck = false;
  return false; // Return false if no blocking piece is found after checking all pieces
}

export default canBlock;