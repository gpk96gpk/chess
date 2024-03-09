



function performValidMove(gameState, piece, move, currentPlayerColor, opponentPlayerNumber, playerNumber, lastPosition) {
    const pieceValidMoves = addMoveIfValid(lastPosition, gameState);
    if (isPieceValidMove) {
      const tempGameState = JSON.parse(JSON.stringify(gameState));
      tempGameState.board[toX][toY] = piece;
      tempGameState.board[fromX][fromY] = { type: 'empty', color: 'none', hasMoved: false};
      console.log('847tempGameState', tempGameState, gameState);
      let checkPosition;
      let matchFoundInDirection;
      //add a check to see if piece is moving into threatening square array from game state 
      const moveIntoCheck = isCheck(tempGameState, gameState.threateningPiecesPositions[currentPlayerColor], opponentPlayerNumber, checkPosition, piece, piece.position, playerNumber, lastDragOverPosition.current, matchFoundInDirection, currentPlayerColor);
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
    gameState.threateningPiecesPositions[currentPlayerColor] = calculateThreateningSquares(gameState, currentPlayerColor, piece, lastDragOverPosition.current);

    // Create a deep copy of the gameState
    const tempGameState = JSON.parse(JSON.stringify(gameState));

    // Move the piece in the copied gameState
    tempGameState.board[toX][toY] = piece;
    tempGameState.board[fromX][fromY] = { type: 'empty', color: 'none', hasMoved: false};

    // Check if the move would result in the player's king being in check
    const moveIntoCheck = isCheckOpponent(tempGameState, gameState.threateningPiecesPositions[currentPlayerColor], opponentPlayerNumber, piece, piece.position, playerNumber, lastDragOverPosition.current, currentPlayerColor);
    if (moveIntoCheck.isKingInCheck) {
        return false;
    } else {
        // The move is valid and does not result in check, so update the gameState
        gameState.checkStatus[currentPlayerColor] = false;
    }

    // Handle special moves and update the gameState here...

    return true;
}
  function simulateMove(gameState, piece, move) {
    console.log('3333Simulating move for piece:', piece);
  
    // Create a deep copy of the gameState
    const simulatedGameState = JSON.parse(JSON.stringify(gameState));
  
    // Get the current position of the piece
    const [currentY, currentX] = piece.position;
    console.log('3333Current position:', [currentY, currentX]);
  
    // Get the new position of the piece
    const [newY, newX] = move;
    console.log('3333New position:', [newY, newX]);
  
    // Move the piece in the copied gameState
    simulatedGameState.board[currentY][currentX] = {type: 'empty', color: 'none', hasMoved: false};
    simulatedGameState.board[newY][newX] = piece;
  
    // Update the position of the piece
    piece.position = [newY, newX];
  
    console.log('3333Simulated game state:', simulatedGameState);
    return simulatedGameState;
  }

  function isCheckmate(gameState, player): boolean {
    console.log('3333Checking checkmate for player:', player);
  
    // Iterate over all pieces of the player
    for (let piece of gameState.piecePositions[opponentColor]) {
      console.log('3333Checking piece:', piece, gameState);
  
      // Get the normal moves for the piece
      const normalMoves = getMovesForPiece(piece, piece.position, gameState); // replace with actual function
      console.log('3333Normal moves:', normalMoves, piece);
  
      // Iterate over all normal moves
      for (let move of normalMoves) {
        console.log('3333Checking move:', move);
  
        // Perform the move if it's valid
        const canPerformValidMove = performValidMove(gameState, piece, move, currentColor, opponentPlayerNumber, playerNumber, lastPosition);
        console.log('3333Can perform valid move:', canPerformValidMove);
  
        if (canPerformValidMove) {
          // If the move is valid, update the gameState
          gameState.board[move[0]][move[1]] = piece;
          gameState.board[piece.position[0]][piece.position[1]] = { type: 'empty', color: 'none', hasMoved: false};
  
          // Check if the move would result in the player being able to move out of check
          const {isKingInCheck} = isCheckOpponent(gameState, gameState.threateningPiecesPositions[opponentColor], opponentPlayerNumber, piece, piece.position, playerNumber, move, currentColor)
          console.log('3333Is king in check:', isKingInCheck);
          if (!isKingInCheck) { // replace with actual function
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


















// import { GameState, Piece as PieceType, Position } from '../types/clientTypes';
// import isCheck from './isCheck';
// import validMoves from './validMoves';
// import calculateThreateningSquares from './calculateThreateningSquares';

// function isCheckmate(gameState, threateningSquares, currentPlayerColor, checkPosition, piece, position, playerNumber, lastPosition, threatenedSquaresWithOpponentPieces) {
//     function canCapture(gameState: GameState, threateningPieces, currentPlayerColor) {
//         const currentPlayerPieces = gameState.piecePositions[currentPlayerColor];
//         console.log('threateningPieces', threateningPieces, 'currentPlayerPieces', currentPlayerPieces)
//         return currentPlayerPieces.some(piece => {
//             return threateningPieces.some(square => {
//                 return piece.position[0] === square[0] && piece.position[1] === square[1];
//             });
//         });
//     }
//     function isKingSafeAfterMove(gameState: GameState, move: Position, kingPosition: Position): boolean {
//         // Save the original piece at the move position
//         const originalPiece = gameState.board[move[0]][move[1]];
//         // Get the king piece
//         const king = gameState.board[kingPosition[0]][kingPosition[1]];
//         // Simulate the king's move
//         gameState.board[kingPosition[0]][kingPosition[1]] = null;
//         gameState.board[move[0]][move[1]] = king;
//         const opponentPlayerNumber = currentPlayerColor === 'white' ? 'black' : 'white';
//         // Check if the king is in check after the move
//         const isKingSafe = !isCheck(gameState, threatenedSquaresWithOpponentPieces, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition);
    
//         // Revert the king's move
//         gameState.board[kingPosition[0]][kingPosition[1]] = king;
//         gameState.board[move[0]][move[1]] = originalPiece;
    
//         return isKingSafe;
//     }
    
//     const kingPosition = gameState.kingPositions[currentPlayerColor];
//     const threateningPieces = gameState.threateningPiecesPositions[currentPlayerColor === 'white' ? 'black' : 'white'];

//     if (canCapture(gameState, threateningPieces, currentPlayerColor)) {
//         return { isCheckmate: false, loser: null };
//     }

//     if (isKingSafeAfterMove(gameState, kingPosition, threateningPieces, currentPlayerColor)) {
//         return { isCheckmate: false, loser: null };
//     }

//     return { isCheckmate: true, loser: currentPlayerColor };
// }

// export default isCheckmate;