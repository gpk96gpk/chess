import { GameStateType, Position, Piece as PieceType, Move } from '../types/clientTypes';
import isCheckmate from './isCheckmate';

interface CheckResult {
  isKingInCheck: boolean;
  isKingInCheckmate: boolean;
  loser: string;
}
function isCheck(gameState, threatenedSquaresWithOpponentPieces, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection): CheckResult {
  console.log('7322threateningSquares', 'threatenedSquaresWithOpponentPieces', threatenedSquaresWithOpponentPieces, 'opponentPlayerNumber', opponentPlayerNumber, 'checkPosition', checkPosition, 'piece', piece, 'position', position, 'playerNumber', playerNumber, 'lastPosition', lastPosition)
  console.log('7322threateningSquares', threateningSquares)
  const pieceColor = piece.color;
  const pieceType = piece.type;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  let directionIndex;
  console.log('5556pieceLastPosition', pieceLastPosition)
  if (pieceLastPosition) {
    const [lastY, lastX] = pieceLastPosition;
    gameState.board[lastY][lastX] = {
        color: pieceColor,
        type: pieceType,
        index: pieceIndex
    };
  }
  if (!gameState || !playerNumber || !gameState.kingPositions) {
    return { isKingInCheck: false, isKingInCheckmate: false, loser: '' };
  }

  const currentPlayerColor = playerNumber === 2 ? 'white' : 'black';
  const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';

  const kingPosition = lastPosition ? lastPosition : gameState.kingPositions[currentPlayerColor];

  let isKingInCheck = false;

  function isKnightAttackingPosition(kingPosition: [number, number], gameState: GameStateType, opponentColor: string): boolean {
    const [kingY, kingX] = kingPosition;
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
  function canBlock(gameState: GameStateType, threatenedSquaresWithOpponentPieces, threateningSquares: Position[][][], 
    checkingPiecePosition: Position, currentPlayerColor: string, piece, lastPosition): boolean {
    console.log('7322gameState', gameState);
    console.log('7322piece', piece, pieceIndex);
    console.log('7322lastPosition', pieceLastPosition);
    console.log('7322canBlockParams', gameState, threatenedSquaresWithOpponentPieces, threateningSquares, 
    checkingPiecePosition, currentPlayerColor);
    console.log('7322threatenedSquaresWithOpponentPieces', threatenedSquaresWithOpponentPieces);   
    console.log('7322threateningSquares', threateningSquares)

    let squarePiece;

    const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
    if (isKnightAttackingPosition(checkingPiecePosition, gameState, opponentColor)) {
      console.log('7322Knight is attacking the checking piece.');
      return true;
    }

    const currentPlayerPieces = gameState.piecePositions[opponentColor];
    console.log('7322currentPlayerPieces', currentPlayerPieces);
    console.log('threateningSquares', threateningSquares);
    let threateningSquaresCopy = [...threateningSquares];
    console.log('7322threateningSquaresCopy', threateningSquaresCopy);
    let newThreateningSquares = [];

    for (directionIndex = 0; directionIndex < threateningSquaresCopy.length; directionIndex++) {
      console.log(`5556Iterating over direction ${directionIndex}`); // Log the current direction
  
      if (threateningSquaresCopy[directionIndex].length === 0) {
          console.log(`5556Row ${directionIndex} is empty`);
          continue; // Skip to the next iteration of the outer loop if the row is empty
      }
  
      let breakOuterLoop = false; // Flag to break the outer loop
      for (let square of threateningSquaresCopy[directionIndex]) {
        const [y, x] = square;
        squarePiece = gameState.board[y][x];
        console.log(`5556Iterating over square ${square} with squarePiece color ${squarePiece.color}`); // Log the current square and squarePiece color
          
        if (!squarePiece || !squarePiece.color) {
          console.log(`5556No piece or color at square ${square}`); // Log the result
          continue; // Skip to the next iteration of the inner loop if the squarePiece is empty or has no color
        }

        if (squarePiece.color === opponentColor) {
          console.log(`5556Opponent's piece found at square ${square}`); // Log the result
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
            console.log(`5556Opponent piece hit in direction ${directionIndex} at square ${square}`); // Log the result
            breakOuterLoop = true; // Set the flag to break the outer loop
            isKingInCheck = true;
            console.log('7322isKingInCheck1', isKingInCheck)
            return false; // End loop and return false
          }
  
          if ((directionIndex === 4 || directionIndex === 5 || directionIndex === 6 || directionIndex === 7) && squarePiece.type === 'pawn') {
              console.log(`5556Pawn hit in direction ${directionIndex} at square ${square}`); // Log the result
              continue; // Break the loop and move to the next direction
          }
  
          const opponentPlayerPieces = gameState.piecePositions[opponentColor].map((existingPiece) => {
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
          console.log(`5556opponentPlayerPieces`, opponentPlayerPieces);
          for (let squareIndex = 0; squareIndex < threateningSquares.length; squareIndex++) {
              for (let pieceIndex = 0; pieceIndex < opponentPlayerPieces.length; pieceIndex++) {
                  if (opponentPlayerPieces[pieceIndex].position[0] === threateningSquares[squareIndex][0] && 
                      opponentPlayerPieces[pieceIndex].position[1] === threateningSquares[squareIndex][1] && 
                      !opponentPlayerPieces[pieceIndex].canBlock) {
                      console.log(`5556Piece at position (${opponentPlayerPieces[pieceIndex].position[0]}, ${opponentPlayerPieces[pieceIndex].position[1]}) can block the check.`);
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
            if (!piece || piece.type !== 'knight' || piece.color !== opponentColor) {
                console.log(`5556Last direction is blank or not an opponent's knight at square ${lastSquare}`);
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



  let isKingInCheckMate;
  console.log('7322gameState.history.length', gameState.history.length)
  canBlock(gameState, threatenedSquaresWithOpponentPieces, threateningSquares, checkPosition, currentPlayerColor, piece, lastPosition);
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

  return { isKingInCheck, isKingInCheckMate, loser: currentPlayerColor, directionIndex };
}

export default isCheck;















































import { PieceType, Position, Move } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
import getCastlingMove from './castling';
import enPassant from './enPassant';
import isCheck from './isCheck';
import getMovesForPiece from './pieceMoves';

function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number, lastPosition) {
  console.log('302validMoves piece', piece, 'position', position, 'gameState', gameState, 'playerNumber', playerNumber);
  const moves: Move[] = [];
  let threateningSquares;
  const pieceIndex = piece.index;
  const pieceLastPosition = lastPosition;
  const currentColor = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = playerNumber === 1 ? 'white' : 'black';
  const threatenedSquaresWithOpponentPieces = [];
  const tempGameState = JSON.parse(JSON.stringify(gameState));
  let matchFoundInDirection = -1;


  const currentPieces = gameState.piecePositions[currentColor].map((existingPiece) => {
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

  if (piece.type === 'king' && (tempGameState.kingPositions[tempGameState.turn][0] !== position[0] || tempGameState.kingPositions[tempGameState.turn][1] !== position[1])) {
    threateningSquares = calculateThreateningSquares(position, tempGameState, position) || [];
  } else {
    threateningSquares = gameState.threateningPiecesPositions[opponentColor] || [];
  }

  for (let i = 0; i < threateningSquares.length; i++) {
    const direction = threateningSquares[i];
    for (let j = 0; j < direction.length; j++) {
      const square = direction[j];
      for (let k = 0; k < currentPieces.length; k++) {
        const piece = currentPieces[k];
        if (piece.position[0] === square[0] && piece.position[1] === square[1]) {
          threatenedSquaresWithOpponentPieces.push(square);
          matchFoundInDirection = i;
        }
      }
    }
  }

   
   

  if (playerNumber === 2 && piece.color === 'white' || playerNumber === 1 && piece.color === 'black' ) {
    tempGameState.threateningPiecesPositions[piece.color] = threatenedSquaresWithOpponentPieces;
  }
  const opponentPlayerNumber = playerNumber === 1 ? 2 : 1;
  const checkPosition = piece.type === 'king' ? lastPosition : position;
  const checkResult = isCheck(tempGameState, threatenedSquaresWithOpponentPieces, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection);

  console.log('843checkResult', checkResult);



  function calculateThreateningSquaresAndCheck(tempGameState, gameState, piece, playerNumber, position, lastPosition, newPosition) {
    // const currentColor = playerNumber === 1 ? 'black' : 'white';
    
    const pieceIndex = piece.index;
    // const pieceLastPosition = lastPosition;
    // const currentPieces = gameState.piecePositions[currentColor].map((existingPiece) => {
    //     console.log(`7778Existing piece id: ${existingPiece.id}`); // Log the id of the existing piece
    
    //     // if (!piece) {
    //     //     return existingPiece;
    //     // }
    
    //     console.log(`7778Piece index: ${pieceIndex}`); // Log the piece index
    
    //     if (existingPiece.id === pieceIndex) {
    //         console.log(`7778Matching id found. Updating position to: ${pieceLastPosition}`); // Log the new position
    
    //         return {
    //             ...existingPiece,
    //             position: pieceLastPosition, // Update the position to the lastPosition
    //         };
    //     } else {
    //         return existingPiece;
    //     }
    // }); // Get the opponent's pieces

  
    // Simulate the move
    const originalPiece = tempGameState.board[newPosition[0]][newPosition[1]];
    tempGameState.board[newPosition[0]][newPosition[1]] = piece;
    tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: pieceIndex};

    // Check if the player's king is in check after the move
    const isKingInCheckAfterMove = isCheck(tempGameState, threatenedSquaresWithOpponentPieces, threateningSquares, playerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection).isKingInCheck;

    // Undo the move
    tempGameState.board[newPosition[0]][newPosition[1]] = originalPiece;
    tempGameState.board[position[0]][position[1]] = piece;

    if (!checkResult.isKingInCheck) {
      return newPosition;
    }
    if (checkResult.isKingInCheck || isKingInCheckAfterMove) {
      return null;
    }

    return null;
  }

  //let isKingInCheck = isCheck(gameState, threatenedSquaresWithOpponentPieces, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition).isKingInCheck;


  const addMoveIfValid = (newPosition: Position) => {
    if (!newPosition) {
      console.log('newPosition', newPosition);
      return;
    }
    
    const currentIndex = tempGameState.board[position[0]][position[1]].index;
    tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: currentIndex};    
    if (newPosition[0] >= 0 && newPosition[0] < tempGameState.board.length &&
      newPosition[1] >= 0 && newPosition[1] < tempGameState.board[0].length) {
      tempGameState.board[newPosition[0]][newPosition[1]] = piece;
      console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn);
      console.log('843piece.type', piece.type, '843piece.position', piece.position);
      
      const move = calculateThreateningSquaresAndCheck(tempGameState, gameState, piece, playerNumber, position, lastPosition, newPosition);
      
      if (move !== null) {
        moves.push(move);
      }
    }
  };

  const normalMoves = getMovesForPiece(piece, position, gameState);
  if (normalMoves) {
    normalMoves.forEach(move => {
      addMoveIfValid(move, false); // Don't check for check yet
    });
  }

  if (piece && piece.type === 'pawn') {
    const enPassantMove = enPassant(piece, position, gameState, playerNumber);
    if (enPassantMove) {
      addMoveIfValid(enPassantMove);
    }
  }

  if (piece && piece.type === 'king') {
    if (!piece.hasMoved &&
      ((gameState.board[0][0].type === 'rook' && !gameState.board[0][0].hasMoved && gameState.board[7][0].type === 'rook' && !gameState.board[7][0].hasMoved) ||
        (gameState.board[0][7].type === 'rook' && !gameState.board[0][7].hasMoved && gameState.board[7][7].type === 'rook' && !gameState.board[7][7].hasMoved))) {

      const castlingMove = getCastlingMove(piece, position, gameState, playerNumber) || [];
      if (castlingMove && Array.isArray(castlingMove[0])) {
        addMoveIfValid(castlingMove);
      }
    }
  }

  return {
    normalMoves,
    threateningSquares
  };
}

export default validMoves;