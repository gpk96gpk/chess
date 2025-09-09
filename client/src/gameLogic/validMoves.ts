import { ValidMoveReturn, PieceType, Position, GameStateType, ThreateningSquares, PlayerNumber, PieceColor } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
import pawnPromotion from './pawnPromotion';
import enPassant from './enPassant';
import isCheck from './isCheck';
import isCheckOpponent from './isCheckOpponent';
import getMovesForPiece from './pieceMoves';
import { generateThreateningSquares } from '../testUtils/testBoards';


function validMoves(piece: PieceType, position: Position, gameState: GameStateType, playerNumber: PlayerNumber, lastPosition: Position): Position[] | ValidMoveReturn | undefined {
  console.log('302validMoves piece', piece, 'position', position, 'gameState', gameState, 'playerNumber', playerNumber, 'lastPosition', lastPosition);
  const moves: Position[] = [];
  let threateningSquares: ThreateningSquares = [[], [], [], [], [], [], [], []];
  let isKingInCheckMate = false;
  //const fromPosition  = position;
  //const pieceIndex = piece.index;
  //let pieceLastPosition = lastPosition;
  const currentColor = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = playerNumber === 1 ? 'white' : 'black';
  let canEnPassant = false;
  const threatenedSquaresWithOpponentPieces = gameState.threateningPiecesPositions[opponentColor] || [];
  const tempGameState = JSON.parse(JSON.stringify(gameState));
  let matchFoundInDirection = -1;
  let canPromote = false;
  let promotionPosition: Position | undefined;
  let normalMoves: Position[] = [];
  const captureMoves: Position[] = [];

  if (piece.color !== currentColor) {
    console.error('Invalid piece color', piece.color, currentColor);
    return;
  }

  console.log('7778tempGameState', tempGameState.kingPositions[tempGameState.turn][0], '7778pieceLastPosition', position[0], '7778piece', tempGameState.kingPositions[tempGameState.turn][1], '7778tempKing', position[1], 'tempGameState', tempGameState);
  if (piece.type === 'king' && (tempGameState.kingPositions[tempGameState.turn][0] !== position[0] || tempGameState.kingPositions[tempGameState.turn][1] !== position[1])) {
    threateningSquares = calculateThreateningSquares(tempGameState, currentColor, piece, lastPosition) || [];
  } else {
    threateningSquares = gameState.threateningPiecesPositions[currentColor] || [];
  }

  const hypotheticalGameState = JSON.parse(JSON.stringify(gameState));

  // Move the king to the new position
  hypotheticalGameState.board[piece.position![0]!][piece.position![1]!] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, position: [piece.position![0]!, piece.position![1]!]};
  hypotheticalGameState.board[lastPosition[0]!][lastPosition[1]!] = piece;
  console.log('843hypotheticalGameState', hypotheticalGameState, '843piece.position', piece.position, '843lastPosition', lastPosition);


  for (let checkDirection = 0; checkDirection <= 15; checkDirection++) {
    if (threateningSquares[checkDirection] === undefined || threateningSquares[checkDirection].length === 0 || threateningSquares[checkDirection] === null) {

      if (piece.position && piece.position[0] !== undefined && piece.position[1] !== undefined) {
        console.log('77722piece.position', tempGameState.kingPositions[opponentColor]);
        threateningSquares = generateThreateningSquares(tempGameState.kingPositions[opponentColor][0], tempGameState.kingPositions[opponentColor][1]);
      } else {
          console.error("Piece position is undefined");
          threateningSquares = [];
      }
    }
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

  function wouldExposeKingToCheck(piece: PieceType, startPos: Position, endPos: Position, gameState: GameStateType): boolean {
    // Skip check for empty pieces
    if (piece.type === 'empty') return false;
    
    // Create a copy of the game state
    const tempGameState = JSON.parse(JSON.stringify(gameState));
    const currentColor = piece.color;
    const threateningPieces = currentColor !== 'none' ? gameState.threateningPiecesPositions[currentColor as 'black' | 'white'] : [];
    console.log('843tempGameState', tempGameState, '843currentColor', currentColor, '843gameState.threateningPiecesPositions[currentColor]', gameState.threateningPiecesPositions,'piece position', endPos);
    if (currentColor !== 'none' && gameState.threateningPiecesPositions[currentColor] && threateningPieces[gameState.checkStatus.direction] === endPos) {
      console.log('843gameState.threateningPiecesPositions[currentColor]', gameState.threateningPiecesPositions[currentColor]);
      return false;
    }
    // Get current player's color
    //const opponentColor = currentColor === 'white' ? 'black' : 'white';
    const playerNumber = currentColor === 'white' ? 2 : 1;
    const opponentPlayerNumber = currentColor === 'white' ? 1 : 2;
    
    // Make the hypothetical move
    tempGameState.board[startPos[0]!][startPos[1]!] = { 
      type: 'empty', 
      color: 'none', 
      hasMoved: false, 
      position: [startPos[0], startPos[1]] 
    };
    
    // Remember what was at the target position (in case of capture)
    //const capturedPiece = tempGameState.board[endPos[0]!][endPos[1]!];
    
    // Move the piece
    tempGameState.board[endPos[0]!][endPos[1]!] = {
      ...piece,
      position: endPos,
      hasMoved: true
    };
    
    // Update king position if we're moving the king
    const kingPosition = {...gameState.kingPositions};
    if (piece.type === 'king' && (currentColor === 'white' || currentColor === 'black')) {
      kingPosition[currentColor] = endPos;
    }
    tempGameState.kingPositions = kingPosition;
    
     // This ensures capturing a threatening piece is properly recognized
    tempGameState.threateningPiecesPositions[currentColor] = calculateThreateningSquares(tempGameState, currentColor as PieceColor, piece, endPos);


    // Find the king's position
    const checkPosition = piece.type === 'king' ? endPos : gameState.kingPositions[currentColor as 'black' | 'white'];
    
    // Get threatening squares
    console.log(`debugging 1: ${tempGameState.threateningPiecesPositions[currentColor]}`);
    const threateningSquares = tempGameState.threateningPiecesPositions[currentColor] || [];
    
    // Default value for matchFoundInDirection
    //const matchFoundInDirection = -1;
    
    // Check if our king would be in check after this move
    const checkResult = isCheck(
      tempGameState,
      threateningSquares,
      opponentPlayerNumber,
      checkPosition,
      piece,
      piece.position || startPos,
      playerNumber,
      endPos,
      matchFoundInDirection,
      currentColor
    );
    console.log('843checkResult', checkResult, checkResult.slicedThreateningSquares);
    moves.push(checkResult.slicedThreateningSquares as Position);
    console.log('843moves', moves);
    return checkResult.isKingInCheck;
  }

  function checkPositionsBetweenAreEmpty(gameState: GameStateType, lastPosition: Position, position: Position): boolean {
    const [startX, startY] = lastPosition;
    const [, endY] = position;

    const direction = endY! - startY! > 0 ? 1 : -1;
    let i = startY! + direction;

    console.log(`Checking positions between ${startY} and ${endY} in direction ${direction}`);

    while (i !== endY) {
        console.log(`Checking position at ${i}`, gameState, startX, i);
        if (i <= 0 || i >= 7 || gameState.board[startX!][i].type !== 'empty') {
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

  

  // function isSquareUnderAttack(square: Position, gameState: GameStateType, attackingColor: PieceColor): boolean {
  //   if (!square || square.length !== 2) return false;
    
  //   const [y, x] = square;
  //   if (y < 0 || y >= 8 || x < 0 || x >= 8) return false;
    
  //   // Check for attacks from pawns
  //   const pawnDirections = attackingColor === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  //   for (const [dy, dx] of pawnDirections) {
  //     const py = y + dy;
  //     const px = x + dx;
  //     if (py >= 0 && py < 8 && px >= 0 && px < 8) {
  //       const piece = gameState.board[py][px];
  //       if (piece.type === 'pawn' && piece.color === attackingColor) {
  //         console.log(`Square [${y},${x}] is attacked by a ${attackingColor} pawn at [${py},${px}]`);
  //         return true;
  //       }
  //     }
  //   }
    
  //   // Check for attacks from knights
  //   const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  //   for (const [dy, dx] of knightDirections) {
  //     const ny = y + dy;
  //     const nx = x + dx;
  //     if (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
  //       const piece = gameState.board[ny][nx];
  //       if (piece.type === 'knight' && piece.color === attackingColor) {
  //         console.log(`Square [${y},${x}] is attacked by a ${attackingColor} knight at [${ny},${nx}]`);
  //         return true;
  //       }
  //     }
  //   }
    
  //   // Check for attacks from kings (adjacent squares)
  //   const kingDirections = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  //   for (const [dy, dx] of kingDirections) {
  //     const ky = y + dy;
  //     const kx = x + dx;
  //     if (ky >= 0 && ky < 8 && kx >= 0 && kx < 8) {
  //       const piece = gameState.board[ky][kx];
  //       if (piece.type === 'king' && piece.color === attackingColor) {
  //         console.log(`Square [${y},${x}] is attacked by a ${attackingColor} king at [${ky},${kx}]`);
  //         return true;
  //       }
  //     }
  //   }
    
  //   // Check for attacks from sliding pieces (rook, bishop, queen)
  //   // Rook and Queen: horizontal/vertical
  //   const straightDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  //   for (const [dy, dx] of straightDirections) {
  //     let cy = y + dy;
  //     let cx = x + dx;
  //     while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
  //       const piece = gameState.board[cy][cx];
  //       if (piece.type !== 'empty') {
  //         if (piece.color === attackingColor && 
  //            (piece.type === 'rook' || piece.type === 'queen')) {
  //           console.log(`Square [${y},${x}] is attacked by a ${attackingColor} ${piece.type} at [${cy},${cx}]`);
  //           return true;
  //         }
  //         break; // Stop at any piece (can't see through pieces)
  //       }
  //       cy += dy;
  //       cx += dx;
  //     }
  //   }
    
  //   // Bishop and Queen: diagonal
  //   const diagonalDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  //   for (const [dy, dx] of diagonalDirections) {
  //     let cy = y + dy;
  //     let cx = x + dx;
  //     while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
  //       const piece = gameState.board[cy][cx];
  //       if (piece.type !== 'empty') {
  //         if (piece.color === attackingColor && 
  //            (piece.type === 'bishop' || piece.type === 'queen')) {
  //           console.log(`Square [${y},${x}] is attacked by a ${attackingColor} ${piece.type} at [${cy},${cx}]`);
  //           return true;
  //         }
  //         break; // Stop at any piece (can't see through pieces)
  //       }
  //       cy += dy;
  //       cx += dx;
  //     }
  //   }
    
  //   return false; // Square is not under attack
  // }

  const addMoveIfValid = (position: Position, tempGameState: GameStateType) => {
    if (!position || canEnPassant) {
      console.log('843position', position);
      return;
    }
    
    console.log('843position', position, tempGameState);
    const canKingCastle = () => {
      if (piece && piece.type === 'king') {
        console.log(`Checking if king at ${position} can castle to ${lastPosition}`);
    
        // First, verify this is a castling move (king moving 2 squares horizontally)
        if (!piece.position || !lastPosition || 
            piece.position[0] !== lastPosition[0] || 
            Math.abs(piece.position[1]! - lastPosition[1]!) !== 2) {
          console.log(`Not a castling move: king must move 2 squares horizontally`);
          return;
        }
    
        // Check if king is in check - cannot castle while in check
        if (gameState.checkStatus[currentColor]) {
          console.log(`Cannot castle: King is in check`);
          canCastle = false;
          return;
        }
    
        // Verify the king has not moved
        if (piece.hasMoved) {
          console.log(`Cannot castle: King has already moved`);
          canCastle = false;
          return;
        }
    
        const rank = piece.position[0]; // The row where king and rook are
        const kingFile = piece.position[1]; // Current column of king
        const direction = lastPosition[1]! > kingFile! ? 1 : -1; // 1 for kingside, -1 for queenside
        
        // Determine rook position based on castling direction
        const rookFile = direction === 1 ? 7 : 0; // Rook is at column 7 (kingside) or 0 (queenside)
        const rookPosition: Position | undefined = [rank!, rookFile];
        
        console.log(`Castling ${direction === 1 ? 'kingside' : 'queenside'}, checking rook at ${rookPosition}`);
        
        // Verify there's a rook at the expected position
        const rookPiece = gameState.board[rank!][rookFile];
        if (rookPiece.type !== 'rook' || rookPiece.color !== piece.color) {
          console.log(`Cannot castle: No matching rook found at ${rookPosition}`);
          canCastle = false;
          return;
        }
        
        // Verify the rook has not moved
        if (rookPiece.hasMoved) {
          console.log(`Cannot castle: Rook has already moved`);
          canCastle = false;
          return;
        }
    
        // Check if positions between king and rook are empty
        const startFile = Math.min(kingFile!, rookFile) + 1;
        const endFile = Math.max(kingFile!, rookFile) - 1;
        
        for (let file = startFile; file <= endFile; file++) {
          if (gameState.board[rank!][file].type !== 'empty') {
            console.log(`Cannot castle: Position at [${rank}, ${file}] is not empty`);
            canCastle = false;
            return;
          }
        }
        
        // Check if the king passes through or ends on a square under attack
        for (let file = kingFile; direction === 1 ? file! <= kingFile! + 2 : file! >= kingFile! - 2; file! += direction) {
          // Skip the starting position - we already verified it's not in check
          if (file === kingFile) continue;
          
          const squareToCheck: Position | undefined = [rank!, file!];
          
          // Check if square is under attack by opponent
          const isSquareAttacked = isSquareUnderAttack(squareToCheck, gameState, opponentColor);
          if (isSquareAttacked) {
            console.log(`Cannot castle: Path through ${squareToCheck} is under attack`);
            canCastle = false;
            return;
          }
        }
        
        // Check if the king's final position is under attack
        const finalKingPosition: Position = [rank!, kingFile! + 2 * direction];
        if (isSquareUnderAttack(finalKingPosition, gameState, opponentColor)) {
          console.log(`Cannot castle: Final position ${finalKingPosition} is under attack`);
          canCastle = false;
          return;
        }
    
        // All checks passed, castling is valid
        console.log(`Castling is valid from ${piece.position} to ${lastPosition}`);
        canCastle = true;
        
        // Add the castling move to valid moves
        moves.push(lastPosition);
        return moves;
      }
    }
    
    canKingCastle();
    const currentIndex = tempGameState.board[position[0]!][position[1]!].index;
    console.log('843currentIndex', currentIndex, tempGameState.board[position[0]!][position[1]!], position);
    //tempGameState.board[position[0]][position[1]] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};    
    console.log('tempGameState', tempGameState, '843tempGameState.turn', tempGameState.turn, gameState, position, lastPosition, tempGameState.board[position[0]!][position[1]!]);
    if ((position[0]! >= 0 && position[0]! < tempGameState.board.length &&
      position[1]! >= 0 && position[1]! < tempGameState.board[0].length &&
      gameState.board[lastPosition[0]!][lastPosition[1]!].color !== piece.color) || 
      // Add this exception for castling - note we don't need isKingInCheck check here anymore
      (canCastle && 
       piece.type === 'king' && 
       gameState.board[lastPosition[0]!][lastPosition[1]!].type === 'rook' && 
       gameState.board[lastPosition[0]!][lastPosition[1]!].color === piece.color)) {
      
      console.log('843lastPosition', gameState.board[lastPosition[0]!][lastPosition[1]!], piece.color);
    
      //const pieceIndex = piece.index;
    
      //const originalPiece = tempGameState.board[lastPosition[0]][lastPosition[1]];
      tempGameState.board[position[0]!][position[1]!] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, position: [position[0]!, position[1]!]};
    
      // Check if the piece at lastPosition is an opponent's piece
      //const opponentColor = piece.color === 'white' ? 'black' : 'white';
      if (gameState.board[lastPosition[0]!][lastPosition[1]!].color === opponentColor) {
        // Remove the piece from the piecePositions array
        console.log('843opponentColor', opponentColor, gameState.piecePositions[opponentColor]);
        const opponentPieceIndex = gameState.board[lastPosition[0]!][lastPosition[1]!].index;
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
  const { isOpponentKingInCheck, slicedThreateningSquares, checkDirection, firstTriggeringOpponentPiece } = isCheckOpponent(hypotheticalGameState, threatenedSquaresWithOpponentPieces, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentColor);
  console.log('843isKingInCheck', isKingInCheck, '843slicedThreateningSquares', slicedThreateningSquares, '843directionIndex', checkDirection);
  
  // Explicitly update the game state with the returned direction
  if (checkDirection !== undefined) {
    gameState.checkStatus.direction = checkDirection;
  }
  if (gameState.checkStatus[currentColor]) {
    normalMoves = normalMoves.filter(move => {
      // Create a temporary board state to simulate this move
      const tempBoard = JSON.parse(JSON.stringify(gameState.board));
      
      // Make the hypothetical move on the temporary board
      tempBoard[position[0]!][position[1]!] = { 
        type: 'empty', 
        color: 'none', 
        hasMoved: false, 
        position: [position[0], position[1]] 
      };
      
      // Move the piece to its new position (potentially capturing an opponent's piece)
      tempBoard[move[0]!][move[1]!] = {
        ...piece,
        position: move,
        hasMoved: true
      };
      
      // Create a complete temp game state with the updated board
      const tempGameState = {
        ...gameState,
        board: tempBoard,
        kingPositions: {
          ...gameState.kingPositions,
          // Update king position if the king is moving
          [currentColor]: piece.type === 'king' ? move : gameState.kingPositions[currentColor]
        }
      };
      
      // The key part: recalculate threatening squares after the move
      // This is crucial to properly detect if the king is still in check
      tempGameState.threateningPiecesPositions[opponentColor] = 
      calculateThreateningSquares(
        tempGameState, 
        opponentColor as PieceColor,
        piece,  // Only pass the piece if it's the king
        move    // Only pass the position if it's the king
      );
      // Get the king's position after the move
      const kingPos = tempGameState.kingPositions[currentColor];
      
      // Check if the king would still be in check after the move
      return !isSquareUnderAttack(kingPos, tempGameState, opponentColor);
    });
    // Try to get attacking knight position  
    if (checkDirection && checkDirection >= 8 && checkDirection <= 15)  { // Knight direction
      console.log('843Knight is checking king, looking for position:', firstTriggeringOpponentPiece);
      
      // If we have the firstTriggeringOpponentPiece, use its position directly
      if (firstTriggeringOpponentPiece && firstTriggeringOpponentPiece.position) {
        const knightPos: Position = [
          firstTriggeringOpponentPiece.position[0] ?? 0, 
          firstTriggeringOpponentPiece.position[1] ?? 0
        ];
        console.log('843Adding knight position as capture move:', knightPos);
        captureMoves.push(knightPos);
      } 
      // Fallback to searching the board for a knight that could be checking
      else {
        // Get opponent's knights
        const opponentKnights = gameState.piecePositions[opponentColor].filter(p => p.type === 'knight');
        const kingPos = gameState.kingPositions[currentColor];
        
        // Check each knight to see if it's attacking the king
        for (const knight of opponentKnights) {
          // Knight attack pattern from king's perspective
          const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
          for (const [dy, dx] of knightOffsets) {
            const attackPos: Position = [kingPos[0]! + dy, kingPos[1]! + dx];
            if (knight.position[0] === attackPos[0] && knight.position[1] === attackPos[1]) {
              console.log('843Found attacking knight at:', knight.position);
              captureMoves.push([knight.position[0], knight.position[1]]);
            }
          }
        }
      }
    }
    // Handle regular sliced threatening squares
    else if (Array.isArray(slicedThreateningSquares) && slicedThreateningSquares.length > 0) {
      // Add the attacking piece's position to normal moves so it can be captured
      for (const threatSquare of slicedThreateningSquares) {
        if (Array.isArray(threatSquare) && threatSquare.length === 2) {
          const captureMove: Position = [threatSquare[0], threatSquare[1]];
          captureMoves.push(captureMove);
          console.log('843Adding attacker position as valid move:', captureMove);
        }
      }
    }
  }
    
  if (isOpponentKingInCheck) {
    console.log('3333Opponent king is in check');
    gameState.checkStatus[opponentColor] = true;
    // const colorToCheck = piece.type === 'king' ? currentColor : opponentColor;
    // Create a piece with the opposite color to check if colorToCheck is in checkmate
    isKingInCheckMate = isCheckmate(tempGameState, piece, position, lastPosition);
    console.log('3333King in checkmate:', isKingInCheckMate);
  }
  
 
normalMoves = getMovesForPiece(piece, position, gameState);
console.log('843normalMoves', normalMoves);


// Filter out moves that would place the king in check
// if (piece.type === 'king') {
//   const opponentColor = piece.color === 'white' ? 'black' : 'white';
//   moves.push(...normalMoves.filter(move => !isSquareUnderAttack(move, gameState, opponentColor)));
// } else {
//   moves.push(...normalMoves);
// }
// const kingPos = piece.type === 'king' ? position : gameState.kingPositions[currentColor];

console.log('843filteredMoves', moves);
normalMoves = normalMoves.filter(move => !wouldExposeKingToCheck(piece, position, move, gameState));
console.log('843normalMoves', normalMoves, captureMoves);
//normalMoves.push(...captureMoves);
console.log('843normalMoves', normalMoves, captureMoves);
// Include capture moves in normalMoves, especially for knight checks
if (gameState.checkStatus[currentColor] && (checkDirection && checkDirection >= 8 && checkDirection <= 15)) {
  // For knight checks, make sure captureMoves are merged into normalMoves - but only if valid
  for (const captureMove of captureMoves) {
    // Get all possible legal moves for this piece (according to piece movement rules)
    const allLegalMoves = getMovesForPiece(piece, position, gameState);
    
    // Check if this piece can legally capture the knight (according to its movement rules)
    const canCaptureKnight = allLegalMoves.some(move => 
      move[0] === captureMove[0] && move[1] === captureMove[1]
    );
    
    // Only add if it's a legal capture and not already in normalMoves
    if (canCaptureKnight && !normalMoves.some(move => 
        move[0] === captureMove[0] && move[1] === captureMove[1]
      )) {
      normalMoves.push(captureMove);
      console.log('Added valid knight capture move to normalMoves:', captureMove);
    } else if (!canCaptureKnight) {
      console.log('Piece cannot legally capture knight:', piece.type, position);
    }
  }
}
// This is the critical part - filter normalMoves to remove invalid ones
const filteredMoves = normalMoves.filter(move => {
  // Create a temporary board state
  const tempBoard = JSON.parse(JSON.stringify(gameState.board));
  
  // Make the move on the temporary board
  tempBoard[position[0]!][position[1]!] = { 
    type: 'empty', 
    color: 'none', 
    hasMoved: false,
    position: [position[0], position[1]]
  };
  
  tempBoard[move[0]!][move[1]!] = {
    ...piece,
    position: move,
    hasMoved: true
  };
  
  // Create a temporary game state
  const tempGameState = {
    ...gameState,
    board: tempBoard,
    kingPositions: {
      ...gameState.kingPositions,
      // Update king position if the king is moving
      [currentColor]: piece.type === 'king' ? move : gameState.kingPositions[currentColor]
    }
  };
  
  // Check if our king would be in check after this move
  const opponentColor = currentColor === 'white' ? 'black' : 'white';
  
  // This checks if the king would be under attack after the move
  return !isSquareUnderAttack(
    tempGameState.kingPositions[currentColor], 
    tempGameState, 
    opponentColor
  );
});

// In validMoves function where filtering happens during check
if (gameState.checkStatus[currentColor]) {
  // If king is in check, only allow moves that resolve the check
  normalMoves = normalMoves.filter(move => {
    // Only allow moves that:
    // 1. Capture the checking piece (already in captureMoves)
    // 2. Block the line of attack (for non-knight checks)
    // 3. Move the king out of check (handled separately)
    
    // For a knight check (direction 10), only allow capturing the knight
    if (checkDirection && checkDirection >= 8 && checkDirection <= 15) {
      // Check if this move captures the knight
      return captureMoves.some(captureMove => 
        captureMove[0] === move[0] && captureMove[1] === move[1]
      );
    }
    
    // For other checks, allow moves that capture or block
    // (existing logic for other check types)
    
    return false; // Default to disallowing moves during check
  });
}

// Helper function to check if a square is under attack
function isSquareUnderAttack(square: Position, gameState: GameStateType, attackerColor: PieceColor): boolean {
  // Extract coordinates
  const [y, x] = square;
  
  // Check for pawn attacks
  const pawnDirections = attackerColor === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  for (const [dy, dx] of pawnDirections) {
    const py = y! + dy;
    const px = x! + dx;
    if (py >= 0 && py < 8 && px >= 0 && px < 8) {
      const piece = gameState.board[py][px];
      if (piece.type === 'pawn' && piece.color === attackerColor) {
        return true;
      }
    }
  }
  
  // Check for knight attacks
  const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [dy, dx] of knightOffsets) {
    const ky = y! + dy;
    const kx = x! + dx;
    if (ky >= 0 && ky < 8 && kx >= 0 && kx < 8) {
      const piece = gameState.board[ky][kx];
      if (piece.type === 'knight' && piece.color === attackerColor) {
        return true;
      }
    }
  }
  
  // Check for rook/queen attacks (horizontal and vertical)
  const rookDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (const [dy, dx] of rookDirections) {
    let cy = y! + dy;
    let cx = x! + dx;
    while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
      const piece = gameState.board[cy][cx];
      if (piece.type !== 'empty') {
        if (piece.color === attackerColor && 
           (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break; // Stop at first piece encountered in this direction
      }
      cy += dy;
      cx += dx;
    }
  }
  
  // Check for bishop/queen attacks (diagonal)
  const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dy, dx] of bishopDirections) {
    let cy = y! + dy;
    let cx = x! + dx;
    while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
      const piece = gameState.board[cy][cx];
      if (piece.type !== 'empty') {
        if (piece.color === attackerColor && 
           (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break; // Stop at first piece encountered in this direction
      }
      cy += dy;
      cx += dx;
    }
  }
  
  // Check for king attacks (adjacent squares)
  const kingOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  for (const [dy, dx] of kingOffsets) {
    const ky = y! + dy;
    const kx = x! + dx;
    if (ky >= 0 && ky < 8 && kx >= 0 && kx < 8) {
      const piece = gameState.board[ky][kx];
      if (piece.type === 'king' && piece.color === attackerColor) {
        return true;
      }
    }
  }
  
  return false;
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
    if (pawnPromotion.isPawnPromotion(piece, lastPosition)) {
      console.log('Pawn promotion detected at position:', lastPosition);
      canPromote = true;
      promotionPosition = lastPosition;
    }
    
    console.log('843pawnMove', lastPosition);
    addMoveIfValid(lastPosition, tempGameState); // Don't check for check yet
    
  }
  
  if (piece && piece.type === 'king') {
      const lastPiece = gameState.board[lastPosition[0]!][lastPosition[1]!];

      console.log(`Checking if last piece is a rook of the same color`, lastPosition, piece.type, lastPiece.type);

      if ((lastPiece.type === 'rook' && lastPiece.color === piece.color && !lastPiece.hasMoved && !piece.hasMoved) || (lastPosition[0] === (0 || 7)) ) {
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
  


function isCheckmate(gameState: GameStateType, piece: PieceType, position: Position, targetPosition: Position): boolean {
  // Get the opponent's color
  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  const currentColor = piece.color === 'white' || piece.color === 'black' ? piece.color : 'white';
  const playerNumber = currentColor === 'white' ? 2 : 1;
  const opponentPlayerNumber = playerNumber === 1 ? 2 : 1;
  const checkPosition = gameState.kingPositions[opponentColor];
  const threateningSquares = gameState.threateningPiecesPositions[currentColor] || [];
  //const matchFoundInDirection = -1;

  // First check if the opponent king is in check
  if (!isCheckOpponent(gameState, threateningSquares, opponentPlayerNumber, checkPosition, piece, position, playerNumber, targetPosition, matchFoundInDirection, currentColor).isKingInCheck) {
    return false;
  }

  // Find all of the opponent's pieces
  const opponentPieces: PieceType[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const currentPiece = gameState.board[row][col];
      if (currentPiece.color === opponentColor) {
        opponentPieces.push(currentPiece);
      }
    }
  }

  // Check if any of the opponent's pieces have valid moves that would get the king out of check
  for (const opponentPiece of opponentPieces) {
    // Get all normal moves for this piece
    const normalMoves = getMovesForPiece(opponentPiece, opponentPiece.position as Position, gameState);

    // Check each potential move to see if it gets the king out of check
    for (const move of normalMoves) {
      // Create a temporary game state to simulate this move
      const tempGameState = JSON.parse(JSON.stringify(gameState));

      // Simulate making this move
      tempGameState.board[opponentPiece.position[0]!][opponentPiece.position[1]!] = {
        type: 'empty',
        color: 'none',
        hasMoved: false,
        position: opponentPiece.position
      };

      tempGameState.board[move[0]!][move[1]!] = {
        ...opponentPiece,
        position: move,
        hasMoved: true
      };

      // If it's the king moving, update the king position
      if (opponentPiece.type === 'king') {
        tempGameState.kingPositions[opponentColor] = move;
      }

      // Check if the king would still be in check after this move
      const isInCheck = isCheck(
        tempGameState,
        threateningSquares,
        opponentPlayerNumber,
        tempGameState.kingPositions[opponentColor],
        piece,
        position,
        playerNumber,
        move,
        matchFoundInDirection,
        currentColor
      );

      const stillInCheck = isInCheck.isKingInCheck;

      const slicedThreateningSquares = isInCheck.slicedThreateningSquares;
      
      console.log('843slicedThreateningSquares', slicedThreateningSquares);
      if (slicedThreateningSquares && slicedThreateningSquares.length > 0) {
        console.log('843slicedThreateningSquares', slicedThreateningSquares);
        //filteredMoves.push(slicedThreateningSquares as Position);
      }

      // If any move gets the king out of check, it's not checkmate
      if (!stillInCheck) {
        return false;
      }
    }
  }

  // If we've checked all moves and none get the king out of check, it's checkmate
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
                console.log(`Move ${i} found in normalMoves`, normalMoves[j], moves[i]);
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
  console.warn('Some moves may have inconsistent format, but proceeding anyway');
  // Filter out invalid moves instead of clearing everything
  const validMoves = moves.filter(move => 
      normalMoves.some(normalMove => 
          Array.isArray(move) && Array.isArray(normalMove) && 
          move[0] === normalMove[0] && move[1] === normalMove[1]
      )
  );
  // Replace moves array with filtered valid moves
  moves.splice(0, moves.length, ...validMoves);
}

// Check each move is in the filtered list
// Make sure our array includes castling moves that were added directly to moves
for (const move of moves) {
  // Check if this move already exists in filteredMoves
  const exists = filteredMoves.some(m => m[0] === move[0] && m[1] === move[1]);
  if (!exists) {
    // Add to filteredMoves if it's not there (like castling moves)
    //filteredMoves.push(move);
  }
}

// Initialize checkmate flag
//let isKingInCheckMate = false;

// Only check for checkmate if the opponent king is in check
if (isOpponentKingInCheck) {
  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  const attackerColor = piece.color;
  let anyValidEscapeMove = false;
  
  console.log(`Checking if ${opponentColor} king is in checkmate...`);
  
  // Check all opponent pieces for potential escape moves
  for (let row = 0; row < 8 && !anyValidEscapeMove; row++) {
    for (let col = 0; col < 8 && !anyValidEscapeMove; col++) {
      const currentPiece = gameState.board[row][col];
      
      // Skip empty squares and non-opponent pieces
      if (currentPiece.type === 'empty' || currentPiece.color !== opponentColor) {
        continue;
      }
      
      // Get potential moves for this piece
      const piecePosition: Position = [row, col];
      const potentialMoves = getMovesForPiece(currentPiece, piecePosition, gameState);
      
      console.log(`Testing ${opponentColor} ${currentPiece.type} at [${row},${col}] with ${potentialMoves.length} potential moves`);
      
      // Check each potential move
      for (const move of potentialMoves) {
        // Make the move on the temp board
        hypotheticalGameState.board[row][col] = {
          type: 'empty',
          color: 'none',
          hasMoved: false,
          position: [row, col]
        };
        
        hypotheticalGameState.board[move[0]!][move[1]!] = {
          ...currentPiece,
          position: [move[0], move[1]],
          hasMoved: true
        };
        
        // Update king position if moving the king
        if (currentPiece.type === 'king') {
          hypotheticalGameState.kingPositions[opponentColor] = [move[0], move[1]];
        }
        
        // CRITICAL FIX: Calculate threatening squares using the UPDATED game state
        // This ensures we correctly detect check after the hypothetical move
        const kingPos = hypotheticalGameState.kingPositions[opponentColor];
        
        // Check if the king would be in check after this move
        let kingStillInCheck = false;
        
        // Calculate new threatening squares based on updated board
        //const newThreateningSquares = [];
        
        // Check each potential attacker on the updated board
        for (let r = 0; r < 8 && !kingStillInCheck; r++) {
          for (let c = 0; c < 8 && !kingStillInCheck; c++) {
            const attackingPiece = hypotheticalGameState.board[r][c];
            
            // Skip empty squares and non-attacking pieces
            if (attackingPiece.type === 'empty' || attackingPiece.color !== attackerColor) {
              continue;
            }
            
            // Get moves for this attacking piece on the updated board
            const attackingMoves = getMovesForPiece(attackingPiece, [r, c], hypotheticalGameState);
            
            // Check if king's new position is directly targeted
            if (attackingMoves.some(m => m[0] === kingPos[0] && m[1] === kingPos[1])) {
              kingStillInCheck = true;
              break;
            }
          }
        }
        
        // If king is not in check after this move, we found an escape!
        if (!kingStillInCheck) {
          anyValidEscapeMove = true;
          console.log(`Valid escape move: ${currentPiece.type} from [${row},${col}] to [${move[0]},${move[1]}]`);
          break;
        }
      }
    }
  }
  
  // If no valid escape move was found, it's checkmate
  isKingInCheckMate = !anyValidEscapeMove;
  console.log(`Checkmate determination: ${isKingInCheckMate ? 'CHECKMATE' : 'NOT CHECKMATE'}`);
}

return {
  moves: filteredMoves,
  threateningSquares: {
      black: threateningSquares,
      white: threatenedSquaresWithOpponentPieces,
  },
  isKingInCheck,
  checkDirection,
  isKingInCheckMate,
  isOpponentKingInCheck,
  enPassantMove,
  canCastle,
  canPromote,
  promotionPosition
} as ValidMoveReturn;



}

export default validMoves;
