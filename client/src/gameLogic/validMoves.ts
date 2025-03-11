import { ValidMoveReturn, PieceType, Position, GameStateType, ThreateningSquares, PlayerNumber, PieceColor, PiecePositions } from '../types/clientTypes';
import calculateThreateningSquares from './calculateThreateningSquares';
import pawnPromotion from './pawnPromotion';
import enPassant from './enPassant';
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
  let pieceLastPosition = lastPosition;
  const currentColor = playerNumber === 1 ? 'black' : 'white';
  const opponentColor = playerNumber === 1 ? 'white' : 'black';
  let canEnPassant = false;
  const threatenedSquaresWithOpponentPieces = gameState.threateningPiecesPositions[opponentColor] || [];
  let tempGameState = JSON.parse(JSON.stringify(gameState));
  let matchFoundInDirection = -1;
  let canPromote = false;
  let promotionPosition: Position | undefined;

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


  for (let checkDirection = 0; checkDirection <= 8; checkDirection++) {
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
        const startFile = kingFile! + direction;
        const endFile = rookFile - direction;
        
        for (let file = startFile; direction === 1 ? file <= endFile : file >= endFile; file += direction) {
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
  const { isOpponentKingInCheck, slicedThreateningSquares, checkDirection } = isCheckOpponent(tempGameState, threatenedSquaresWithOpponentPieces, opponentPlayerNumber, checkPosition, piece, position, playerNumber, lastPosition, matchFoundInDirection, currentColor);
  console.log('843isKingInCheck', isKingInCheck, '843slicedThreateningSquares', slicedThreateningSquares, '843directionIndex', checkDirection);
  if (isOpponentKingInCheck) {
    console.log('3333Opponent king is in check');
    gameState.checkStatus[opponentColor] = true;
    const colorToCheck = piece.type === 'king' ? currentColor : opponentColor;
    isKingInCheckMate = isCheckmate(tempGameState, colorToCheck);
    console.log('3333King in checkmate:', isKingInCheckMate);
  }
  
 
const normalMoves = getMovesForPiece(piece, position, gameState);
console.log('843normalMoves', normalMoves);

// Filter out moves that would place the king in check
if (piece.type === 'king') {
  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  moves.push(...normalMoves.filter(move => !isSquareUnderAttack(move, gameState, opponentColor)));
} else {
  moves.push(...normalMoves);
}

console.log('843filteredMoves', moves);

// Helper function to check if a square is under attack
// Replace the existing isSquareUnderAttack function with this implementation:

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
      if ( moves) {
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
      tempGameState.board[toX!][toY!] = {type: piece.type, color: opponentColor.toString(), hasMoved: true, isHighlighted: false, index: piece.index, position: lastPosition};
      tempGameState.board[fromX!][fromY!] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, position: [fromX!, fromY!] };
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
          tempGameState.board[move[0]!][move[1]!] = {type: piece.type, color: opponentColor.toString(), hasMoved: true, isHighlighted: false, index: piece.id, position: move};
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
  canCastle,
  canPromote,
  promotionPosition
} as ValidMoveReturn;



}

export default validMoves;
