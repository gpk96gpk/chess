// import e from 'express';
import { PieceType, Position, GameStateType, ThreateningSquares, PlayerNumber, PieceColor, PiecePositions } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
// import canBlock from './canBlock';
// import getCastlingMove from './castling';
import enPassant from './enPassant';
import isCheckOpponent from './isCheckOpponent';
import getMovesForPiece from './pieceMoves';
// import isCheck from './isCheck';
// import { json } from 'react-router-dom';
type ValidMoveReturn = {
  moves: Position[]; 
  threateningSquares: { black: number[][] | number[][][]; white: number[][] | number[][][]; }; 
  isKingInCheck: false; 
  checkDirection: number | undefined; 
  isKingInCheckMate: boolean; 
  isOpponentKingInCheck: boolean | undefined; 
  enPassantMove: Position; 
  canCastle: boolean; 
}

function validMoves(piece: PieceType, position: Position, gameState: GameStateType, playerNumber: PlayerNumber, lastPosition: Position): Position[] | ValidMoveReturn | undefined {
  console.log('302validMoves piece', piece, 'position', position, 'gameState', gameState, 'playerNumber', playerNumber, 'lastPosition', lastPosition);
  const moves: Position[] = [];
  let threateningSquares: ThreateningSquares = [[], [], [], [], [], [], [], []];
  let isKingInCheckMate = false;
  //const fromPosition  = position;
  //const pieceIndex = piece.index;
  let pieceLastPosition = lastPosition;
  const currentColor = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = playerNumber === 1 ? 'white' : 'black';
  let canEnPassant = false;
  const threatenedSquaresWithOpponentPieces = gameState.threateningPiecesPositions[opponentColor] || [];
  let tempGameState = JSON.parse(JSON.stringify(gameState));
  let matchFoundInDirection = -1;

  if (piece.color !== currentColor) {
    console.error('Invalid piece color', piece.color, currentColor);
    return;
  }

  // const currentPieces = gameState.piecePositions[currentColor].map((existingPiece) => {
  //   console.log(`7778Existing piece id: ${existingPiece.id}`); // Log the id of the existing piece


  //   console.log(`7778Piece index: ${pieceIndex}`); // Log the piece index

  //   if (existingPiece.id === pieceIndex) {
  //       console.log(`7778Matching id found. Updating position to: ${pieceLastPosition}`); // Log the new position

  //       return {
  //           ...existingPiece,
  //           position: pieceLastPosition, // Update the position to the lastPosition
            
  //       };
  //   } else {
  //       return existingPiece;
  //   }
  // }); // Get the opponent's pieces

  if (piece.type === 'king' && (tempGameState.kingPositions[tempGameState.turn][0] !== position[0] || tempGameState.kingPositions[tempGameState.turn][1] !== position[1])) {
    threateningSquares = calculateThreateningSquares(tempGameState, currentColor, piece, lastPosition) || [];
  } else {
    threateningSquares = gameState.threateningPiecesPositions[currentColor] || [];
  }




  const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));

  // Move the king to the new position
  hypotheticalGameState.board[piece.position![0]!][piece.position![1]!] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
  hypotheticalGameState.board[lastPosition[0]][lastPosition[1]] = piece;
  console.log('843hypotheticalGameState', hypotheticalGameState, '843piece.position', piece.position, '843lastPosition', lastPosition);


  for (let checkDirection = 0; checkDirection <= 8; checkDirection++) {
    for (let threateningPieceIndex = 0; threateningPieceIndex < threateningSquares[checkDirection].length; threateningPieceIndex++) {
      console.log('843checkDirection', checkDirection, '843threateningPieceIndex', threateningPieceIndex, threateningSquares);
      const square = threateningSquares[checkDirection][threateningPieceIndex];
      if (Array.isArray(square)) {
          const [y, x] = square;
          const piece = hypotheticalGameState.board[y][x];
          console.log('843piece', piece, '843piece.color', piece.color, '843opponentColor', opponentColor, '843currentColor', currentColor);
          if (piece.color === opponentColor) {
              // Skip to the next row
              break;
          }
          if (piece.color === currentColor) {
              // Break and set firstTriggeringOpponentPieceIndex and firstTriggeringOpponentPiece to checkDirection and threateningPieceIndex
              matchFoundInDirection = checkDirection;
              break;
          }
      }
  }
  }
  function checkPositionsBetweenAreEmpty(gameState: GameStateType, lastPosition: Position, position: Position): boolean {
    const [startX, startY] = lastPosition;
    const [, endY] = position;

    const direction = endY - startY > 0 ? 1 : -1;
    let i = startY + direction;

    console.log(`Checking positions between ${startY} and ${endY} in direction ${direction}`);

    while (i !== endY) {
        console.log(`Checking position at ${i}`, gameState, startX, i);
        if (i <= 0 || i >= 7 || gameState.board[startX][i].type !== 'empty') {
            console.log(`Position at ${i} is not empty or out of range`);
            return false;
        }
        i += direction;
    }

    console.log(`All positions between ${startY} and ${endY} are empty`);
    return true;
  }
  console.log('843matchFoundInDirection', matchFoundInDirection);
  let canCastle = false;

  const addMoveIfValid = (position: Position, tempGameState: GameStateType) => {
    if (!position || canEnPassant) {
      console.log('843position', position);
      return;
    }
    
    console.log('843position', position, tempGameState);
    if (piece && piece.type === 'king') {
      const lastPiece = gameState.board[lastPosition[0]][lastPosition[1]];

      console.log(`Checking if last piece is a rook of the same color`, lastPosition, piece.type, lastPiece.type);

      if (lastPiece.type === 'rook' && lastPiece.color === piece.color && !lastPiece.hasMoved && !piece.hasMoved) {
          console.log(`Last piece is a rook of the same color`);

          const positionsBetweenAreEmpty = lastPosition[0] === position[0] 
              ? checkPositionsBetweenAreEmpty(gameState, position, lastPosition)
              : checkPositionsBetweenAreEmpty(gameState, position, lastPosition);

          if (positionsBetweenAreEmpty) {
              canCastle = true;
              console.log(`Positions between are empty`, canCastle);
              moves.push(lastPosition);
              console.log(moves)
              return moves;
              //addMoveIfValid(lastPosition, tempGameState);
          } else {
              console.log(`Positions between are not empty`);
          }
      } else {
          console.log(`Last piece is not a rook of the same color`, lastPiece, lastPosition);
      }
    }
    const currentIndex = tempGameState.board[position[0]][position[1]].index;
    console.log('843currentIndex', currentIndex, tempGameState.board[position[0]][position[1]], position);
    //tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};    
    console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn, gameState, position, lastPosition, tempGameState.board[position[0]][position[1]]);
    if (position[0] >= 0 && position[0] < tempGameState.board.length &&
      position[1] >= 0 && position[1] < tempGameState.board[0].length &&
      gameState.board[lastPosition[0]][lastPosition[1]].color !== piece.color) {
      
      console.log('843lastPosition', gameState.board[lastPosition[0]][lastPosition[1]], piece.color);
    
      //const pieceIndex = piece.index;
    
      //const originalPiece = tempGameState.board[lastPosition[0]][lastPosition[1]];
      tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
    
      // Check if the piece at lastPosition is an opponent's piece
      //const opponentColor = piece.color === 'white' ? 'black' : 'white';
      if (gameState.board[lastPosition[0]][lastPosition[1]].color === opponentColor) {
        // Remove the piece from the piecePositions array
        console.log('843opponentColor', opponentColor, gameState.piecePositions[opponentColor]);
        const opponentPieceIndex = gameState.board[lastPosition[0]][lastPosition[1]].index;
        console.log('843opponentPieceIndex', opponentPieceIndex, gameState.piecePositions[opponentColor]);
        gameState.piecePositions[opponentColor] = gameState.piecePositions[opponentColor].filter(piece => piece.id !== opponentPieceIndex);
      }
    
      const isValidMove = true;
    
      // Check if the current player is in check
      console.log('843gameState.checkStatus[currentColor]', gameState.checkStatus[currentColor]);
      // if (gameState.checkStatus[currentColor] ) {
      //   // Call moveOutOfCheck with the necessary parameters
      //   console.log('843gameState.checkStatus[currentColor]', gameState.checkStatus[currentColor]);
      //   isValidMove = moveOutOfCheck(piece, position, tempGameState, position);
      //   console.log('843isValidMove', isValidMove);
      //   console.log('843Player is in check, cannot make moves');
      // }
      
      // If moveOutOfCheck returns true, push the move
      if (isValidMove) {
        moves.push(lastPosition);
        console.log('843makingMoves', moves[0], moves[1], moves);
        return moves;
      }
    }
  };
  
   

  // if (playerNumber === 2 && piece.color === 'white' || playerNumber === 1 && piece.color === 'black' ) {
  //   tempGameState.threateningPiecesPositions[piece.color] = threatenedSquaresWithOpponentPieces;
  // }
  const opponentPlayerNumber = playerNumber === 1 ? 2 : 1;
  const checkPosition = piece.type === 'king' ? lastPosition : position;
  const isKingInCheck: boolean = false;
  console.log('847piece.type', piece.type, 'checkPosition', checkPosition, 'lastPosition', lastPosition, 'gameState', gameState, 'piece', piece, 'position', position, 'playerNumber', playerNumber, 'lastPosition', lastPosition, 'matchFoundInDirection', matchFoundInDirection, 'currentColor', currentColor);
  // if (piece.type !== 'knight') {
  //   hypotheticalGameState = JSON.parse(JSON.stringify(tempGameState));
  // }
  const { isOpponentKingInCheck, slicedThreateningSquares, checkDirection } = isCheckOpponent(tempGameState, threatenedSquaresWithOpponentPieces, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentColor);
  console.log('843isKingInCheck', isKingInCheck, '843slicedThreateningSquares', slicedThreateningSquares, '843directionIndex', checkDirection);
  if (isOpponentKingInCheck) {
    console.log('3333Opponent king is in check');
    gameState.checkStatus[opponentColor] = true;
    isKingInCheckMate = isCheckmate(tempGameState, currentColor);
    console.log('3333King in checkmate:', isKingInCheckMate);
  }
  
  //FIX THIS: all this does is update the position in the temp game state, it doesn't actually move the piece
  // function calculateThreateningSquaresAndCheck() {
  //   // const currentColor = playerNumber === 1 ? 'black' : 'white';
    
  //   const pieceIndex = piece.index;
  //   // const pieceLastPosition = lastPosition;

    
  //   // Simulate the move
  //   const originalPiece = tempGameState.board[lastPosition[0]][lastPosition[1]];
  //   console.log('843originalPiece', originalPiece, piece, gameState.board);
  //   //tempGameState.board[position[0]][position[1]] = piece;
  //   console.log('843tempGameState.board[lastPosition[0]][lastPosition[1]]', tempGameState.board[lastPosition[0]][lastPosition[1]]);
  //   tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
    
  //   // Undo the move
  //   //tempGameState.board[lastPosition[0]][lastPosition[1]] = originalPiece;
  //   console.log('843originalPiece', originalPiece, tempGameState.board[lastPosition[0]][lastPosition[1]]);
  //   //tempGameState.board[position[0]][position[1]] = piece;
  //   console.log('843isKingInCheck', isKingInCheck);
  //   console.log('843gameState.checkStatus[currentColor]', gameState.checkStatus[currentColor], lastPosition);
  //   if (gameState.checkStatus[currentColor] !== true) {
  //     return position;
  //   }
  //   if (gameState.checkStatus[currentColor]) {
  //     return position;
  //   }

  //   return null;
  // }
  
 
  const normalMoves = getMovesForPiece(piece, position, gameState);
  console.log('843normalMoves', normalMoves);
  if (normalMoves) {
    console.log('843normalMoves', lastPosition);
    addMoveIfValid(lastPosition, tempGameState); // Don't check for check yet
  }
  let enPassantMove;
  if (piece && piece.type === 'pawn') {
    enPassantMove = enPassant(piece, lastPosition, gameState);
    if (enPassantMove) {
      console.log('843enPassantMove', enPassantMove);
      normalMoves.push(enPassantMove);
      addMoveIfValid(enPassantMove, tempGameState);
      canEnPassant = true;
    }
    
    console.log('843pawnMove', lastPosition);
    addMoveIfValid(lastPosition, tempGameState); // Don't check for check yet
    
  }
  
  if (piece && piece.type === 'king') {
      const lastPiece = gameState.board[lastPosition[0]][lastPosition[1]];

      console.log(`Checking if last piece is a rook of the same color`, lastPosition, piece.type, lastPiece.type);

      if (lastPiece.type === 'rook' && lastPiece.color === piece.color && !lastPiece.hasMoved && !piece.hasMoved) {
          console.log(`Last piece is a rook of the same color`);

          const positionsBetweenAreEmpty = lastPosition[0] === position[0] 
              ? checkPositionsBetweenAreEmpty(gameState, position, lastPosition)
              : checkPositionsBetweenAreEmpty(gameState, position, lastPosition);

          if (positionsBetweenAreEmpty) {
              canCastle = true;
              console.log(`Positions between are empty`, canCastle);
              normalMoves.push(lastPosition);
              addMoveIfValid(lastPosition, tempGameState);
          } else {
              console.log(`Positions between are not empty`);
          }
      } else {
          console.log(`Last piece is not a rook of the same color`, lastPiece, lastPosition);
      }
  }
  
  // function moveOutOfCheck (piece: PieceType, position: Position, gameState: GameState, lastDragPosition: Position) {
  //   console.log('843moveOutOfCheck piece', piece, 'position', position, 'gameState', gameState, 'lastDragPosition', lastDragPosition);
  //   let result = true;
  //     // Check if piece type is not a king
  //     if (piece.type !== 'king') {
  //       // Get direction index from isCheck function
  //       // Compare with valid moves using find
  //       // Use .some and to find a valid move in the directionIndex array
  //       let validMove;
  //       console.log('843piece.type', piece.type, slicedThreateningSquares, normalMoves);

  //       if (slicedThreateningSquares && Array.isArray(slicedThreateningSquares)) {
  //         validMove = normalMoves.some(move => 
  //           slicedThreateningSquares.some(threat => 
  //             threat.length === move.length && 
  //             threat.every((value, index) => value === move[index])
  //             )
  //             );          
  //             console.log('843validMove', validMove, slicedThreateningSquares, slicedThreateningSquares.length)
  //       } else { 
  //         validMove = normalMoves.some(move =>  
  //         move.every((value, index) => value === lastDragPosition[index])
  //         )
  //       }
  //       console.log('843validMove', validMove, normalMoves);
  //       if (slicedThreateningSquares) {
  //         console.log('843slicedThreateningSquares', slicedThreateningSquares);
  //       } else {
  //         console.log('no slicedThreatened Squares');
  //       } 
  //       if (validMove) {
  //         // Check for threatening pieces in other directions
  //         // let threateningSquares = calculateThreateningSquares(position, gameState);
  //         // let currentPieces = getCurrentPieces(gameState); // replace with actual function
  //         // let threatenedSquaresWithOpponentPieces = [];
  //         // let matchFoundInDirection;
  //         //console.log('843validMove', validMove, slicedThreateningSquares);
  //         for (let i = 0; i < threateningSquares.length; i++) {
  //           console.log('843iCheck', i, checkDirection, threateningSquares);
  //           // Removed the check for i === checkDirection to ensure the loop doesn't skip all iterations
  //           const direction = threateningSquares[i];
  //           console.log('843direction', direction);
          
  //           let square;
  //           for (let j = 0; j < direction.length; j++) {
  //             const pieceAtSquare = gameState.board[direction[j][0]][direction[j][1]];
  //             console.log('843pieceAtSquare', pieceAtSquare);
          
  //             // If there's a piece at the square and it has the same color, continue to next iteration
  //             if (pieceAtSquare && pieceAtSquare.color === currentColor) {
  //               continue;
  //             } else if (pieceAtSquare && pieceAtSquare.color === opponentColor) {
  //               // Check if the piece type is correct based on the direction
  //               if ((i < 4 && (pieceAtSquare.type === 'rook' || pieceAtSquare.type === 'queen')) ||
  //                   (i >= 4 && i < 8 && (pieceAtSquare.type === 'bishop' || pieceAtSquare.type === 'queen')) ||
  //                   (i >= 8 && pieceAtSquare.type === 'knight')) {
  //                   result = false; // Set result to false but don't return
  //                   break; // Break the inner loop              
  //                   }
  //                 }
          

  //           }
          
     
  //         }
          
  //         console.log('847pieceAtLastDragPosition', firstTriggeringOpponentPiece, gameState, lastDragPosition);
  //         if (firstTriggeringOpponentPiece && firstTriggeringOpponentPiece.color === opponentColor) {
  //           // If the piece at the lastDragPosition is of the opponent's color, it's a valid move
  //           console.log('847takePieceAtLastDragPosition', firstTriggeringOpponentPiece, gameState, lastDragPosition, currentPieces);
  //           result = true;
  //         }
  //         console.log('849before validMove', slicedThreateningSquares, currentPieces);
  //         if (slicedThreateningSquares) {
  //           const validMove = slicedThreateningSquares.some(square => {
  //             console.log('849Square:', square, '843Piece position:', piece.position);
  //             return currentPieces.some(piece => {
  //                 console.log('849Square:', square, '843Piece position:', piece.position);
  //                 return piece.position[0] === square[0] && piece.position[1] === square[1];
  //             });
  //           });          
  //         }
  //         console.log('849after validMove');
  //         // If none of these return a valid move then its check mate so use AND operator to compare all these conditions for check mate
  //         console.log('849validMove', isKingInCheck, slicedThreateningSquares, validMove);
  //         //console.log('843', isKingInCheck && slicedThreateningSquares.includes(lastDragPosition) && validMove && threateningPieces.length === 0)
  //         return validMove;
  //       }
  //     } else {
  //       // Moving the king out of check
  //       // Store calculate threatening squares for the unoccupied squares or containing friendly pieces adjacent to the king and inbounds
  //       //console.log('843isKingInCheck', piece.type, isKingInCheck, slicedThreateningSquares, validMove, threateningPieces);
  //       const threateningSquares = calculateThreateningSquares(gameState, currentColor, piece, lastPosition);
  //       console.log('843threateningSquares', threateningSquares, lastDragPosition, slicedThreateningSquares);
  //       if (slicedThreateningSquares && slicedThreateningSquares.includes(lastDragPosition)) {
  //         // If lastDragPosition is found in direction index array return false for move being valid
  //         console.log('843isKingInCheckResult', isKingInCheck, slicedThreateningSquares, lastDragPosition, threateningSquares);
  //         return true;
  //       }
  //       // Using stored hypothetical threatening squares check if all of them are in check using canBlock
  //       const allInCheck = threateningSquares.every(square =>
  //         !canBlock(tempGameState, threateningSquares, firstTriggeringOpponentPiece, currentColor, piece, lastPosition)
  //       ); 
  //       console.log('843allInCheck', allInCheck, threateningSquares);   
  //       if (allInCheck) {
  //         // Return false for validMoves if all hypotheticals are in check return list of valid starting coordinates of the hypotheticals for valid moves
  //         console.log('843allInCheck', allInCheck, threateningSquares);
  //         return true;
  //       }
  //     }
  //     console.log('843result', result);
  //   return !result;
  // }

  // write a function that takes the position and adds and subtracts one in each direction and iterate that over gameState.board to check if the piece is surrounded by friendly pieces if so skip to the next iteration
  function isSurroundedByFriendlies (gameState: GameStateType, piece: PieceType, opponentColor: string) {
    console.log(`Checking if piece ${piece.type} at ${piece.position} with ${piece.index} is surrounded by opponent pieces`);
    if (Array.isArray(piece.position)) {
      const [y, x] = piece.position;
      const directions = [
        [0, -1], [0, 1], // horizontal
        [-1, 0], [1, 0], // vertical
        [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
      ];
      let allSurroundingAreOpponentsOrOutOfBounds = true;
      for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];
        const [dy, dx] = direction;
        const col = y! + dy;
        const row = x! + dx;
          if (piece.type === 'knight') {
              console.log('Piece is a knight, returning false');
              break;
          }
          if (row >= 0 && row < 8 && col >= 0 && col < 8) {
              console.log(`Checking position (${col}, ${row})`);
              if (gameState.board[col][row].color !== opponentColor) {
                  console.log(`Piece at position (${col}, ${row}) is not an opponent piece`, gameState.board[col][row], opponentColor);
                  pieceLastPosition = [col, row];
                  allSurroundingAreOpponentsOrOutOfBounds = false;
                  break;
              }
          }
      }
      console.log(allSurroundingAreOpponentsOrOutOfBounds ? 'All surrounding pieces are opponent pieces or out of bounds' : 'Not all surrounding pieces are opponent pieces or out of bounds');
      return allSurroundingAreOpponentsOrOutOfBounds;
  }
}
  function performValidMove(gameState: GameStateType, piece: PieceType | PiecePositions, currentPlayerColor: PieceColor, opponentPlayerNumber: PlayerNumber, playerNumber: PlayerNumber, lastPosition: Position) {
    if (isSurroundedByFriendlies(gameState, piece as PieceType, opponentColor)) {
      return false;
    }
    console.log('847Performing valid move for piece:', piece, position, lastPosition, gameState);
    const moves = addMoveIfValid(position, tempGameState);
    let errorFound = false;
    console.log('847moves', moves);
    for (let i = 0; i < moves!.length; i++) {
      const move = moves![i];
      let moveFoundInNormalMoves = false;
  
      console.log(`Checking move ${i}:`, move);
  
      for (let j = 0; j < moves!.length; j++) {
          const normalMove = moves![j];
  
          console.log(`Comparing with normalMove ${j}:`, normalMove, moves);
  
          if (Array.isArray(move) && Array.isArray(normalMove) && move.length === normalMove.length) {
              let allCoordinatesMatch = true;
  
              for (let k = 0; k < move.length; k++) {
                  if (!Object.is(move[k], normalMove[k])) {
                      allCoordinatesMatch = false;
                      console.log(`Coordinates do not match at index ${k}`);
                      break;
                  }
              }
  
              if (allCoordinatesMatch) {
                  moveFoundInNormalMoves = true;
                  console.log(`Move ${i} found in normalMoves`);
                  break;
              }
          }
      }
  
      if (!moveFoundInNormalMoves) {
          errorFound = true;
          console.log(`Move ${i} not found in normalMoves, errorFound set to true`);
          break;
      }
  }
  
  if (errorFound) {
      console.error('Error: Invalid move position');
      if (moves) {
        moves.splice(0, moves.length);
      }
  }
  const isPieceValidMove = moves && moves.some(move => {
    const isStartPosEqual = move.every((value, index) => value === piece.position![index]);
    const isLastDragPosEqual = move.every((value, index) => value === index);
    return isStartPosEqual || isLastDragPosEqual;
  });    
  console.log('847isPieceValidMove', isPieceValidMove, moves);
  if (isPieceValidMove && Array.isArray(piece.position)) {
      const tempGameState = JSON.parse(JSON.stringify(gameState));
      const [toX, toY] = lastPosition;
      const [fromX, fromY] = piece.position;
      console.log('847toX', toX, '847toY', toY, '847fromX', fromX, '847fromY', fromY, '847piece', piece, '847gameState', gameState, lastPosition, opponentColor);
      tempGameState.board[toX][toY] = {type: piece.type, color: opponentColor.toString(), hasMoved: true, isHighlighted: false, index: piece.index, position: lastPosition};
      tempGameState.board[fromX!][fromY!] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false };
      console.log('847tempGameState', tempGameState, gameState);
      let checkPosition: Position;
      const matchFoundInDirection: number = -1;
      //add a check to see if piece is moving into threatening square array from game state 
      const moveIntoCheck = isCheckOpponent(tempGameState, gameState.threateningPiecesPositions[opponentColor], opponentPlayerNumber, checkPosition!, piece as PieceType, piece.position as Position, playerNumber, pieceLastPosition, matchFoundInDirection, currentPlayerColor);
      console.log('847moveIntoCheck', moveIntoCheck.isKingInCheck, gameState, isOpponentKingInCheck);
      if (moveIntoCheck.isKingInCheck) {
          console.log('847moveIntoCheck', moveIntoCheck);
          //const isKingInCheckMate = isCheckmate(gameState, currentPlayerColor);
          console.log('847isKingInCheckMate', isKingInCheckMate);
          return;
      } else {
          //isKingInCheck = false;
          gameState.checkStatus[currentPlayerColor] = false;
          //gameState.checkStatus[opponentColor] = false;
          console.log('847gameState that moves out of check', gameState);
          console.log('847moveIntoCheck', moveIntoCheck);
      }
      console.log('toX', toX, 'toY', toY, 'fromX', fromX, 'fromY', fromY, 'piece', piece, 'gameState', gameState);
    }
    tempGameState.threateningPiecesPositions[opponentColor] = calculateThreateningSquares(gameState, opponentColor, piece as PieceType, lastPosition);

    
    return true;
}
  // function simulateMove(gameState, piece, move) {
  //   console.log('3333Simulating move for piece:', piece);
  
  //   // Create a deep copy of the gameState
  //   const simulatedGameState = JSON.parse(JSON.stringify(gameState));
  
  //   // Get the current position of the piece
  //   const [currentY, currentX] = piece.position;
  //   console.log('3333Current position:', [currentY, currentX]);
  
  //   // Get the new position of the piece
  //   const [newY, newX] = move;
  //   console.log('3333New position:', [newY, newX]);
  
  //   // Move the piece in the copied gameState
  //   simulatedGameState.board[currentY][currentX] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
  //   simulatedGameState.board[newY][newX] = piece;
  
  //   // Update the position of the piece
  //   piece.position = [newY, newX];
  
  //   console.log('3333Simulated game state:', simulatedGameState);
  //   return simulatedGameState;
  // }

  function isCheckmate(gameState: GameStateType, player: PieceColor): boolean {
    console.log('3333Checking checkmate for player:', player);
  
    // Iterate over all pieces of the player
    for (const piece of gameState.piecePositions[opponentColor]) {
      
      console.log('3333Checking piece:', piece, gameState, tempGameState);
  
      // Get the normal moves for the piece
      const normalMoves = getMovesForPiece(piece, piece.position as Position, gameState); // replace with actual function
      console.log('3333Normal moves:', normalMoves, piece);
  
      // Iterate over all normal moves
      for (const move of normalMoves) {
        console.log('3333Checking move:', move);
  
        // Perform the move if it's valid
        const canPerformValidMove = performValidMove(gameState, piece, currentColor, opponentPlayerNumber, playerNumber, move);
        console.log('3333Can perform valid move:', canPerformValidMove);
  
        if (canPerformValidMove) {
          // If the move is valid, update the gameState
          tempGameState = JSON.parse(JSON.stringify(hypotheticalGameState));
          console.log(opponentColor)
          tempGameState.board[move[0]][move[1]] = {type: piece.type, color: opponentColor.toString(), hasMoved: true, isHighlighted: false, index: piece.id, position: move};
          tempGameState.board[piece.position[0]!][piece.position[1]!] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false };
          console.log('3333Updated game state:', hypotheticalGameState, move, opponentColor, tempGameState);
          // Check if the move would result in the player being able to move out of check
  
          let threateningPiecesPositions;
          if (piece.type === 'king') {
            // Recalculate threatening squares if the piece is a king
            threateningPiecesPositions = calculateThreateningSquares(tempGameState, opponentColor, piece as PieceType, move); // replace with actual function
          } else {
            threateningPiecesPositions = gameState.threateningPiecesPositions[opponentColor];
          }
  
          const {isOpponentKingInCheck} = isCheckOpponent(hypotheticalGameState, threateningPiecesPositions, opponentPlayerNumber, checkPosition, piece, position, playerNumber, move, matchFoundInDirection, currentColor)
          console.log('3333Is king in check:', isOpponentKingInCheck);
          if (!isOpponentKingInCheck) { // replace with actual function
            console.log('3333Move out of check found, not a checkmate', move, piece, gameState);
            return false;
          }
        }
      }
    }
  
    // If no piece can move out of check, the player is in checkmate
    console.log('3333No move out of check found, it is a checkmate');
    return true;
  }
  console.log('843moves', moves, normalMoves);

  let errorFound = false;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    let moveFoundInNormalMoves = false;

    console.log(`Checking move ${i}:`, move);

    for (let j = 0; j < normalMoves.length; j++) {
        const normalMove = normalMoves[j];

        console.log(`Comparing with normalMove ${j}:`, normalMove, normalMoves);

        if (Array.isArray(move) && Array.isArray(normalMove) && move.length === normalMove.length) {
            let allCoordinatesMatch = true;

            for (let k = 0; k < move.length; k++) {
                if (!Object.is(move[k], normalMove[k])) {
                    allCoordinatesMatch = false;
                    console.log(`Coordinates do not match at index ${k}`);
                    break;
                }
            }

            if (allCoordinatesMatch) {
                moveFoundInNormalMoves = true;
                console.log(`Move ${i} found in normalMoves`);
                break;
            }
        }
    }

    if (!moveFoundInNormalMoves) {
        errorFound = true;
        console.log(`Move ${i} not found in normalMoves, errorFound set to true`);
        break;
    }
}

if (errorFound) {
    console.error('Error: Invalid move position');
    moves.splice(0, moves.length);
}

return {
  moves,
  threateningSquares: {
      black: threateningSquares, // Replace with your actual data
      white: threatenedSquaresWithOpponentPieces, // Replace with your actual data
  },
  isKingInCheck,
  checkDirection,
  isKingInCheckMate,
  isOpponentKingInCheck,
  enPassantMove,
  canCastle
} as ValidMoveReturn;



}

export default validMoves;


























// import e from 'express';
// import { PieceType, Position, Move } from '../types/clientTypes';
// import calculateThreateningSquares from './calculateThreateningSquares';
// import canBlock from './canBlock';
// import getCastlingMove from './castling';
// import enPassant from './enPassant';
// import isCheck from './isCheck';
// import getMovesForPiece from './pieceMoves';

// function validMoves(piece: PieceType, position: Position, gameState: GameState, playerNumber: number, lastPosition) {
//   console.log('302validMoves piece', piece, 'position', position, 'gameState', gameState, 'playerNumber', playerNumber, 'lastPosition', lastPosition);
//   const moves: Move[] = [];
//   let threateningSquares;
//   let isKingInCheckMate = false;
//   const fromPosition  = position;
//   const pieceIndex = piece.index;
//   const pieceLastPosition = lastPosition;
//   const currentColor = playerNumber === 1 ? 'black' : 'white';
//   const opponentColor = playerNumber === 1 ? 'white' : 'black';
//   const threatenedSquaresWithOpponentPieces = gameState.threateningPiecesPositions[opponentColor] || [];
//   const tempGameState = JSON.parse(JSON.stringify(gameState));
//   let matchFoundInDirection = -1;

//   if (piece.color !== currentColor) {
//     console.error('Invalid piece color');
//     return;
//   }

//   const currentPieces = gameState.piecePositions[currentColor].map((existingPiece) => {
//     console.log(`7778Existing piece id: ${existingPiece.id}`); // Log the id of the existing piece


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
//   }); // Get the opponent's pieces

//   if (piece.type === 'king' && (tempGameState.kingPositions[tempGameState.turn][0] !== position[0] || tempGameState.kingPositions[tempGameState.turn][1] !== position[1])) {
//     threateningSquares = calculateThreateningSquares(tempGameState, gameState, piece, playerNumber, position, lastPosition) || [];
//   } else {
//     threateningSquares = gameState.threateningPiecesPositions[opponentColor] || [];
//   }

//   for (let i = 0; i < threateningSquares.length; i++) {
//     const direction = threateningSquares[i];
//     console.log('843direction', direction, threateningSquares);
//     for (let j = 0; j < direction.length; j++) {
//       const square = direction[j];
//       console.log('843square', square);
//       for (let k = 0; k < currentPieces.length; k++) {
//         const piece = currentPieces[k];
//         console.log('843piece', piece, '843square', square);
//         if (piece.position[0] === square[0] && piece.position[1] === square[1]) {
//           //threatenedSquaresWithOpponentPieces.push(square);
//           matchFoundInDirection = i;
//         }
//       }
//     }
//   }

   
   

//   // if (playerNumber === 2 && piece.color === 'white' || playerNumber === 1 && piece.color === 'black' ) {
//   //   tempGameState.threateningPiecesPositions[piece.color] = threatenedSquaresWithOpponentPieces;
//   // }
//   const opponentPlayerNumber = playerNumber === 1 ? 2 : 1;
//   const checkPosition = piece.type === 'king' ? lastPosition : position;
//   const { isKingInCheck, slicedThreateningSquares, checkDirection, firstTriggeringOpponentPiece } = isCheck(tempGameState, threatenedSquaresWithOpponentPieces, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection);
//   console.log('843isKingInCheck', isKingInCheck, '843slicedThreateningSquares', slicedThreateningSquares, '843directionIndex', checkDirection);
  
  
//   //FIX THIS: all this does is update the position in the temp game state, it doesn't actually move the piece
//   function calculateThreateningSquaresAndCheck() {
//     // const currentColor = playerNumber === 1 ? 'black' : 'white';
    
//     const pieceIndex = piece.index;
//     // const pieceLastPosition = lastPosition;

    
//     // Simulate the move
//     const originalPiece = tempGameState.board[lastPosition[0]][lastPosition[1]];
//     console.log('843originalPiece', originalPiece, piece, gameState.board);
//     //tempGameState.board[position[0]][position[1]] = piece;
//     console.log('843tempGameState.board[lastPosition[0]][lastPosition[1]]', tempGameState.board[lastPosition[0]][lastPosition[1]]);
//     tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
    
//     // Undo the move
//     //tempGameState.board[lastPosition[0]][lastPosition[1]] = originalPiece;
//     console.log('843originalPiece', originalPiece, tempGameState.board[lastPosition[0]][lastPosition[1]]);
//     //tempGameState.board[position[0]][position[1]] = piece;
//     console.log('843isKingInCheck', isKingInCheck);
//     console.log('843gameState.checkStatus[currentColor]', gameState.checkStatus[currentColor], lastPosition);
//     if (gameState.checkStatus[currentColor] !== true) {
//       return position;
//     }
//     if (gameState.checkStatus[currentColor]) {
//       return position;
//     }

//     return null;
//   }
  
//   const addMoveIfValid = (position: Position) => {
//     if (!position) {
//       console.log('843position', position);
//       return;
//     }
//     console.log('843position', position, tempGameState);

//     const currentIndex = tempGameState.board[position[0]][position[1]].index;
//     console.log('843currentIndex', currentIndex, tempGameState.board[position[0]][position[1]], position);
//     tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};    
//     console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn, gameState, position, lastPosition, tempGameState.board[position[0]][position[1]]);
//     if (position[0] >= 0 && position[0] < tempGameState.board.length &&
//       position[1] >= 0 && position[1] < tempGameState.board[0].length &&
//       gameState.board[lastPosition[0]][lastPosition[1]].color !== piece.color) {
//       console.log('843lastPosition', gameState.board[lastPosition[0]][lastPosition[1]], piece.color);
//       //tempGameState.board[position[0]][position[1]] = piece;
//       console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn, gameState, position, lastPosition);
//       console.log('843piece.type', piece.type, '843piece.position', piece.position);
//       const pieceIndex = piece.index;

//       const originalPiece = tempGameState.board[lastPosition[0]][lastPosition[1]];
//       tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};

//       //const move = calculateThreateningSquaresAndCheck(tempGameState, gameState, piece, playerNumber, position, lastPosition);
//       // console.log('843move', move);
//       let isValidMove = true;

//       // Check if the current player is in check
//       if (gameState.checkStatus[currentColor] ) {
//         // Call moveOutOfCheck with the necessary parameters
//         isValidMove = moveOutOfCheck(piece, position, tempGameState, position);
//         console.log('843isValidMove', isValidMove);
//         console.log('843Player is in check, cannot make moves');
//         //return null;
//       }
      
      
//       // If moveOutOfCheck returns true, push the move
//       if (isValidMove) {
//         moves.push(lastPosition);
//         console.log('843makingMoves', moves);
//       }
//     }
//   };

//   const normalMoves = getMovesForPiece(piece, position, gameState);
//   console.log('843normalMoves', normalMoves);
//   if (normalMoves) {
//     console.log('843normalMoves', lastPosition);
//     addMoveIfValid(lastPosition); // Don't check for check yet
//   }

//   if (piece && piece.type === 'pawn') {
//     const enPassantMove = enPassant(piece, lastPosition, gameState, playerNumber);
//     if (enPassantMove) {
//       console.log('843enPassantMove', enPassantMove);
//       addMoveIfValid(enPassantMove);
//     }
    
//     console.log('843pawnMove', lastPosition);
//     addMoveIfValid(lastPosition); // Don't check for check yet
    
//   }

//   if (piece && piece.type === 'king') {
//     if (!piece.hasMoved &&
//       ((gameState.board[0][0].type === 'rook' && !gameState.board[0][0].hasMoved && gameState.board[7][0].type === 'rook' && !gameState.board[7][0].hasMoved) ||
//         (gameState.board[0][7].type === 'rook' && !gameState.board[0][7].hasMoved && gameState.board[7][7].type === 'rook' && !gameState.board[7][7].hasMoved))) {

//       const castlingMove = getCastlingMove(piece, position, gameState, playerNumber) || [];
//       if (castlingMove && Array.isArray(castlingMove[0])) {
//         addMoveIfValid(castlingMove);
//       }
//     }
//   }
  
//   function moveOutOfCheck (piece: PieceType, position: Position, gameState: GameState, lastDragPosition: Position) {
//     console.log('843moveOutOfCheck piece', piece, 'position', position, 'gameState', gameState, 'lastDragPosition', lastDragPosition);
//     let result = true;
//       // Check if piece type is not a king
//       if (piece.type !== 'king') {
//         // Get direction index from isCheck function
//         // Compare with valid moves using find
//         // Use .some and to find a valid move in the directionIndex array
//         let validMove;
//         console.log('843piece.type', piece.type, slicedThreateningSquares, normalMoves);

//         if (slicedThreateningSquares && Array.isArray(slicedThreateningSquares)) {
//           validMove = normalMoves.some(move => 
//             slicedThreateningSquares.some(threat => 
//               threat.length === move.length && 
//               threat.every((value, index) => value === move[index])
//               )
//               );          
//               console.log('843validMove', validMove, slicedThreateningSquares, slicedThreateningSquares.length)
//         } else { 
//           validMove = normalMoves.some(move =>  
//           move.every((value, index) => value === lastDragPosition[index])
//           )
//         }
//         console.log('843validMove', validMove, normalMoves);
//         if (slicedThreateningSquares) {
//           console.log('843slicedThreateningSquares', slicedThreateningSquares);
//         } else {
//           console.log('no slicedThreatened Squares');
//         } 
//         if (validMove) {
//           // Check for threatening pieces in other directions
//           // let threateningSquares = calculateThreateningSquares(position, gameState);
//           // let currentPieces = getCurrentPieces(gameState); // replace with actual function
//           // let threatenedSquaresWithOpponentPieces = [];
//           // let matchFoundInDirection;
//           //console.log('843validMove', validMove, slicedThreateningSquares);
//           for (let i = 0; i < threateningSquares.length; i++) {
//             console.log('843iCheck', i, checkDirection, threateningSquares);
//             // Removed the check for i === checkDirection to ensure the loop doesn't skip all iterations
//             const direction = threateningSquares[i];
//             console.log('843direction', direction);
          
//             let square;
//             for (let j = 0; j < direction.length; j++) {
//               const pieceAtSquare = gameState.board[direction[j][0]][direction[j][1]];
//               console.log('843pieceAtSquare', pieceAtSquare);
          
//               // If there's a piece at the square and it has the same color, continue to next iteration
//               if (pieceAtSquare && pieceAtSquare.color === currentColor) {
//                 continue;
//               } else if (pieceAtSquare && pieceAtSquare.color === opponentColor) {
//                 // Check if the piece type is correct based on the direction
//                 if ((i < 4 && (pieceAtSquare.type === 'rook' || pieceAtSquare.type === 'queen')) ||
//                     (i >= 4 && i < 8 && (pieceAtSquare.type === 'bishop' || pieceAtSquare.type === 'queen')) ||
//                     (i >= 8 && pieceAtSquare.type === 'knight')) {
//                     result = false; // Set result to false but don't return
//                     break; // Break the inner loop              
//                     }
//                   }
          

//             }
          
     
//           }
          
//           console.log('847pieceAtLastDragPosition', firstTriggeringOpponentPiece, gameState, lastDragPosition);
//           if (firstTriggeringOpponentPiece && firstTriggeringOpponentPiece.color === opponentColor) {
//             // If the piece at the lastDragPosition is of the opponent's color, it's a valid move
//             console.log('847takePieceAtLastDragPosition', firstTriggeringOpponentPiece, gameState, lastDragPosition, currentPieces);
//             result = true;
//           }
//           console.log('849before validMove', slicedThreateningSquares, currentPieces);
//           if (slicedThreateningSquares) {
//             const validMove = slicedThreateningSquares.some(square => {
//               console.log('849Square:', square, '843Piece position:', piece.position);
//               return currentPieces.some(piece => {
//                   console.log('849Square:', square, '843Piece position:', piece.position);
//                   return piece.position[0] === square[0] && piece.position[1] === square[1];
//               });
//             });          
//           }
//           console.log('849after validMove');
//           // If none of these return a valid move then its check mate so use AND operator to compare all these conditions for check mate
//           console.log('849validMove', isKingInCheck, slicedThreateningSquares, validMove);
//           //console.log('843', isKingInCheck && slicedThreateningSquares.includes(lastDragPosition) && validMove && threateningPieces.length === 0)
//           return validMove;
//         }
//       } else {
//         // Moving the king out of check
//         // Store calculate threatening squares for the unoccupied squares or containing friendly pieces adjacent to the king and inbounds
//         //console.log('843isKingInCheck', piece.type, isKingInCheck, slicedThreateningSquares, validMove, threateningPieces);
//         const threateningSquares = calculateThreateningSquares(gameState, currentColor, piece, lastPosition);
//         console.log('843threateningSquares', threateningSquares, lastDragPosition, slicedThreateningSquares);
//         if (slicedThreateningSquares && slicedThreateningSquares.includes(lastDragPosition)) {
//           // If lastDragPosition is found in direction index array return false for move being valid
//           console.log('843isKingInCheckResult', isKingInCheck, slicedThreateningSquares, lastDragPosition, threateningSquares);
//           return true;
//         }
//         // Using stored hypothetical threatening squares check if all of them are in check using canBlock
//         const allInCheck = threateningSquares.every(square =>
//           !canBlock(tempGameState, threateningSquares, firstTriggeringOpponentPiece, currentColor, piece, lastPosition)
//         ); 
//         console.log('843allInCheck', allInCheck, threateningSquares);   
//         if (allInCheck) {
//           // Return false for validMoves if all hypotheticals are in check return list of valid starting coordinates of the hypotheticals for valid moves
//           console.log('843allInCheck', allInCheck, threateningSquares);
//           return true;
//         }
//       }
//       console.log('843result', result);
//     return !result;
//   }
//   // function isCheckmate(gameState: GameState, player: Player): boolean {
//   //   // If the player is not in check, they can't be in checkmate
//   //   if (!isCheck(gameState, player)) {
//   //       return false;
//   //   }

//   //   // Iterate over all pieces of the player
//   //   for (let piece of player.pieces) {
//   //       // If the piece can move out of check, the player is not in checkmate
//   //       if (moveOutOfCheck(piece, piece.position, gameState, piece.lastDragPosition)) {
//   //           return false;
//   //       }
//   //   }

//   //   // If no piece can move out of check, the player is in checkmate
//   //   return true;
//   // }
//   console.log('843moves', moves, normalMoves);

//   let errorFound = false;

// for (let i = 0; i < moves.length; i++) {
//     let move = moves[i];
//     let moveFoundInNormalMoves = false;

//     for (let j = 0; j < normalMoves.length; j++) {
//         let normalMove = normalMoves[j];

//         if (Array.isArray(move) && Array.isArray(normalMove) && move.length === normalMove.length) {
//             let allCoordinatesMatch = true;

//             for (let k = 0; k < move.length; k++) {
//                 if (!Object.is(move[k], normalMove[k])) {
//                     allCoordinatesMatch = false;
//                     break;
//                 }
//             }

//             if (allCoordinatesMatch) {
//                 moveFoundInNormalMoves = true;
//                 break;
//             }
//         }
//     }

//     if (!moveFoundInNormalMoves) {
//         errorFound = true;
//         break;
//     }
// }

// if (errorFound) {
//     console.error('Error: Invalid move position');
//     moves.splice(0, moves.length);
// }
//   return {
//     moves,
//     threateningSquares,
//     isKingInCheck,
//     checkDirection,
//     isKingInCheckMate,
//   };



// }

// export default validMoves;
























// function validMoves(piece: PieceType, position: Position, gameState: GameState, lastDragPosition: Position) {
//   // Check if piece type is king
//   if (piece.type !== 'king') {
//     // Get direction index from isCheck function
//     const { isKingInCheck, slicedThreateningSquares, directionIndex } = isCheck(piece, position, gameState);
//     // Compare with valid moves using find
//     // Use .some and .include to find a valid move in the directionIndex array
//     const validMove = normalMoves.some(move => slicedThreateningSquares.includes(move));
//     if (validMove) {
//       // Check for threatening pieces in other directions
//       // Define threateningSquares, currentPieces, threatenedSquaresWithOpponentPieces, and matchFoundInDirection here
//       // let threateningSquares = calculateThreateningSquares(position, gameState);
//       // let currentPieces = getCurrentPieces(gameState); // replace with actual function
//       // let threatenedSquaresWithOpponentPieces = [];
//       // let matchFoundInDirection;

//       for (let i = 0; i < threateningSquares.length; i++) {
//         if (i === directionIndex) {
//           continue;
//         }
//         const direction = threateningSquares[i];
//         const square = direction.find((square) => {
//           return currentPieces.some((piece) => {
//             return piece.position[0] === square[0] && piece.position[1] === square[1];
//           });
//         });

//         if (square) {
//           threatenedSquaresWithOpponentPieces.push(square);
//           matchFoundInDirection = i;
//           break;
//         }
//       }

//       let slicedThreatenedSquares = [];

//       // Iterate over each threatened square
//       for (let square of threatenedSquaresWithOpponentPieces) {
//         const [y, x] = square;
//         const squarePiece = gameState.board[y][x];

//         // If the square is empty or contains a piece of the current player, continue to the next square
//         if (!squarePiece || squarePiece.color !== opponentColor) {
//           continue;
//         }

//         // If the square contains an opponent's piece that can attack King, slice the array and push to slicedThreatenedSquares
//         if (opponentPlayerPieces.some(opponentPiece => opponentPiece.canBlock && opponentPiece.position[0] === y && opponentPiece.position[1] === x)) {
//           slicedThreatenedSquares.push(threatenedSquaresWithOpponentPieces.slice(threatenedSquaresWithOpponentPieces.indexOf(square)));
//         }
//       }

//       // Flatten the array in case there are multiple threatening pieces
//       slicedThreatenedSquares = threatenedSquaresWithOpponentPieces.slice(0, matchFoundInDirection + 1);

//       const threateningPieces = slicedThreatenedSquares.some(square => currentPieces.some(piece => piece.position[0] === square[0] && piece.position[1] === square[1]));

//       // If none of these return a valid move then its check mate so use AND operator to compare all these conditions for check mate
//       return isKingInCheck && slicedThreateningSquares.includes(lastDragPosition) && validMove && threateningPieces.length === 0;
//     }
//     } else {
//       // Moving the king out of check
//       // Get direction index from isCheck function
//       const { isKingInCheck, slicedThreateningSquares } = isCheck(piece, position, gameState);
//       // Store calculate threatening squares for the unoccupied squares or containing friendly pieces adjacent to the king and inbounds
//       const threateningSquares = calculateThreateningSquares(position, gameState);
//       if (slicedThreateningSquares.includes(lastDragPosition)) {
//         // If lastDragPosition is found in direction index array return false for move being valid
//         return false;
//       }
//       // Using stored hypothetical threatening squares check if all of them are in check using canBlock
//       const allInCheck = threateningSquares.every(square => isCheck(square, gameState).isKingInCheck);
//       if (allInCheck) {
//         // Return false for validMoves if all hypotheticals are in check return list of valid starting coordinates of the hypotheticals for valid moves
//         return false;
//       }
//       // If none of these return a valid move then its check mate so use AND operator to compare all these conditions for check mate
//       return allInCheck && slicedThreateningSquares.includes(lastDragPosition) && validMove && threateningPieces.length === 0;
//     }
//   }
// }



