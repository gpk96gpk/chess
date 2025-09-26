import { useEffect, useContext, useRef } from 'react';
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import isCheck from '../gameLogic/isCheck'
import validMoves from '../gameLogic/validMoves'
import enPassant from '../gameLogic/enPassant'
import isDraw from '../gameLogic/isDraw'
//import getMovesForPiece from '../gameLogic/pieceMoves'
import Board from './Board';
import GameOver from './GameOver';
import { Props, Position, PieceType, GameStateType, ValidMovesResult, PieceColor, PieceNameWithoutNone } from '../types/clientTypes';
import calculateThreateningSquares from '../gameLogic/calculateThreateningSquares';
import BoardButtons from './BoardButtons';
import { getPieceIcon } from '../assets/icons';
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
// import BoardTimer from './BoardTimer';
// import resetGameState from '../gameLogic/resetGameState';


polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

window.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });


const Chess: React.FC<Props> = (props) => {
    // if (!props.gameState) {
    //     const { initialBoard } = resetGameState();
    //     props.gameState = initialBoard
    //     console.log('props.gameState', props.gameState)
    // }
    const gameState = props.gameState;
    if (props.playerNumber === 1) {
        gameState.username1 = props.username;
    }
    if (props.playerNumber === 2) {
        gameState.username2 = props.username;
    }
    const { roomCode } = useParams();
    console.log('roomCode', roomCode, 'props', typeof props.gameState);
    const socket = useContext(SocketContext);
    const lastDragOverPosition = useRef<Position | null>(null);
    const startPosition = useRef<Position | null>(null);
    const currentPlayerColor = props.playerNumber === 1 ? 'black' : 'white';
    const opponentPlayerNumber = props.playerNumber === 1 ? 2 : 1;
    console.log('761currentPlayerColor', currentPlayerColor, props.gameState);
    const currentPlayerInCheck = props.gameState.checkStatus[currentPlayerColor];
    const isKingInCheck = props.gameState.checkStatus[currentPlayerColor];
    console.log('761isKingInCheck', isKingInCheck, currentPlayerInCheck);
    console.log('761props.gameState', props.gameState);
    const isKingInCheckMate = false;
    const loser: string | null = gameState.turn === 'black' ? 'white' : 'black';
    let newGameState;
    let hasCastled = false;
    
    const handleDragStart = (event: React.DragEvent, piece: PieceType, position: Position) => {
        //event.preventDefault();
        console.log('handleDragStart');
        console.log('turnState', turnState, 'playerNumber', playerNumber)
        if (currentPlayerColor !== (playerNumber === 1 ? 'black' : 'white')) {
            return;
        }
        if (turnState !== playerNumber) {
            return;
        }
        event.dataTransfer.setData('piece', JSON.stringify(piece));
        event.dataTransfer.setData('position', JSON.stringify(position));
        startPosition.current = position;
        // dragOverPiece = piece;
        console.log('StartPosition', position);
        console.log('StartPiece', currentPlayerColor, gameState);
    };
    
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, position: Position) => {
        event.preventDefault();
        console.log('handleDragEnter');
        console.log('DragEnterPosition', position, gameState);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position | null) => {
        event.preventDefault();
        console.log('handleDragOver');
        lastDragOverPosition.current = position;


        console.log('DragOverPosition', position, gameState);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        console.log('761handleDropProps.gameState', gameState);
        console.log('handleDrop');
        const pieceData = event.dataTransfer.getData('piece');
        console.log('handleDropPieceData', pieceData);
        if (!pieceData) {
            console.error('handleDropNo piece data');
            return;
        }
    
        let piece: PieceType;
        try {
            piece = JSON.parse(pieceData);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
    
        // Update piece position with the drop coordinates
        console.log('761piece', piece);
        console.log('761lastDragOverPosition', lastDragOverPosition.current);
        if (lastDragOverPosition.current) {
            piece.position = lastDragOverPosition.current;
            console.log('761piece', piece);
        } else {
            console.error('Error: lastDragOverPosition is null');
            return;
        }
    
        const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
        const opponentColor = playerNumber === 1 ? 'white' : 'black';
        console.log('5556opponentColor', opponentColor);
        
        let toX: number, toY: number;
        if (lastDragOverPosition.current && lastDragOverPosition.current.length === 2) {
            [toX, toY] = lastDragOverPosition.current;
        } else {
            console.error('Error: lastDragOverPosition is null or invalid');
            return;
        }
        let fromX: number | undefined, fromY: number | undefined;
        if (piece.position) {
            // Note: piece.position was updated above to the drop coords
            // Use startPosition.current (the original coordinates) for "from"
            if(startPosition.current){
                [fromX, fromY] = startPosition.current;
            } else {
                console.error('Error: startPosition.current is null');
                return;
            }
        } else {
            console.error('Error: piece.position is null');
            return;
        }
        
        newGameState = JSON.parse(JSON.stringify(gameState));
        console.log('761validMovesCheck', piece.position, startPosition.current, newGameState, playerNumber, lastDragOverPosition.current, 
                currentPlayerInCheck, gameState);
        console.log('761currentPlayerInCheck', currentPlayerInCheck);
        
        const validMovesResult = validMoves(
            piece,
            startPosition.current!,
            gameState,
            playerNumber,
            lastDragOverPosition.current!,
            { dryRun: true }
        );
        if (!validMovesResult) {
            console.error('Error: validMoves returned nothing');
            return;
        } 
        const { moves: pieceValidMoves, threateningSquares, isKingInCheck, checkDirection, isKingInCheckMate, isOpponentKingInCheck, enPassantMove, canCastle, canPromote, promotionPosition } = validMovesResult as ValidMovesResult;
        console.log('761pieceValidMoves', pieceValidMoves, isOpponentKingInCheck);
        
        // Check if a king is being captured BEFORE handling promotion
        const targetPiece = gameState.board[toX][toY];
        if (targetPiece.type === 'king') {
            console.log('King captured during pawn promotion! Game over.', targetPiece.color, 'king was captured by', piece.color);
            setGameOver(true);
            if (props.isAIGame) {
                setWinner(piece.color === 'white' ? 'AI (White)' : 'Player (Black)');
            } else {
                setWinner(piece.color === 'white' ? 'White' : 'Black');
            }
            setTurnState(3);
            
            // For AI games, don't emit to server
            if (socket && !props.isAIGame) {
                socket.emit('gameOver', true, targetPiece.color === 'white' ? 'White' : 'Black', roomCode);
            }
            return; // End the function here since game is over
        }
        
        // Handle pawn promotion
        if (canPromote && piece.type === 'pawn') {
            setShowPromotionDialog(true);
            setPromotionPosition(promotionPosition!);
            setPieceToPromote(piece);
            return; // Exit the function to wait for user selection
        }
                
        if (isOpponentKingInCheck) {
            console.log('761isOpponentKingInCheck', isOpponentKingInCheck, opponentColor);
            gameState.checkStatus[opponentColor] = true;
        }
        console.log('761pieceValidMoves', pieceValidMoves);
        console.log('newGameState', newGameState, gameState);

        const updateBoard = (gameState: GameStateType, x: number, y: number, piece: PieceType) => {
            if (hasCastled) {
                return
            }
            console.log('761updateBoard', x, y, piece, gameState.board[x][y]);
            
            // Check for captures BEFORE updating the board
            const targetPiece = gameState.board[x][y];
            const isCapturingMove = targetPiece.type !== 'empty' && targetPiece.color !== piece.color;
            
            if (isCapturingMove) {
                console.log('Capturing piece:', targetPiece, 'at position:', [x, y]);
                // Remove the captured piece from the opponent's piece positions array
                if (targetPiece.color === 'white' && gameState.piecePositions.white) {
                    gameState.piecePositions.white = gameState.piecePositions.white.filter(
                        (p) => !(p.position && p.position.length === 2 && p.position[0] === x && p.position[1] === y)
                    );
                } else if (targetPiece.color === 'black' && gameState.piecePositions.black) {
                    gameState.piecePositions.black = gameState.piecePositions.black.filter(
                        (p) => !(p.position && p.position.length === 2 && p.position[0] === x && p.position[1] === y)
                    );
                }
            }
            
            piece.hasMoved = true;
            gameState.board[x][y].type = piece.type;
            gameState.board[x][y].color = piece.color;
            gameState.board[x][y].hasMoved = piece.hasMoved;
            gameState.board[x][y].position = piece.position;
            gameState.board[x][y].isHighlighted = false;
            gameState.board[x][y].index = piece.index;
            piece.hasMovedTwo && (gameState.board[x][y].hasMovedTwo = true);


            // Update piecePositions
            let pieceToUpdate;
            if (gameState.piecePositions && gameState.piecePositions[currentPlayerColor]) {
                console.log('866Current game state:', gameState.piecePositions);
                console.log('866Current player color:', currentPlayerColor, piece, gameState.piecePositions[currentPlayerColor]);
                pieceToUpdate = gameState.piecePositions[currentPlayerColor].find(
                    pos => {
                        console.log('866Position id:', pos.id);
                        return pos.id === piece.index;
                    }
                );
                console.log('866Piece to update:', pieceToUpdate);
            } else {
                console.log('866gameState.piecePositions or gameState.piecePositions[currentPlayerColor] is undefined');
            }
            console.log('866pieceIndex', pieceToUpdate);
            if (pieceToUpdate) {
                pieceToUpdate.hasMoved = true;
                pieceToUpdate.position = lastDragOverPosition.current || [];
                pieceToUpdate.hasMovedTwo && (pieceToUpdate.hasMovedTwo = true);
                pieceToUpdate.color = piece.color;
                const pieceIndex = pieceToUpdate.index;
                gameState.piecePositions[currentPlayerColor][pieceIndex!] = pieceToUpdate;
                console.log('866pieceToUpdate', pieceToUpdate, gameState.piecePositions[currentPlayerColor]);
            }
            //Update check status
            if (isKingInCheck && gameState.checkStatus[currentPlayerColor] === true) {
                console.log('761isKingInCheck', isKingInCheck, opponentColor, gameState);
                gameState.checkStatus[opponentColor] = true;
                gameState.checkStatus.direction = checkDirection!;
            }
        }
        
        const castlingDirection = piece.type === 'king' && toY! - fromY! === 2 ? 1 : -1;

        const handleCastling = (gameState: GameStateType, toX: number, toY: number, piece: PieceType) => {
            let castleDirection : number;
            let rookDirection : number;
            let rookPosition : number;
            if ((toY === 0 || toY === 2) && piece && piece.position) {
                castleDirection = fromY! - 2
                rookPosition = fromY! - 1
                rookDirection = 0
                console.log('castlingPosition', castleDirection)
              }
              if ((toY === 7 || toY === 6) && piece && piece.position) {
                castleDirection = fromY! + 2
                rookPosition = fromY! + 1
                rookDirection = 7;
                console.log('castlingPosition', castleDirection)
              }
 
            gameState.board[fromX!][rookPosition!].color = currentPlayerColor;
            gameState.board[fromX!][rookPosition!].type = 'rook';
            gameState.board[fromX!][rookPosition!].hasMoved = true;
            gameState.board[fromX!][rookPosition!].position = piece.position;
            gameState.board[fromX!][rookPosition!].index = gameState.board[fromX!][rookDirection!].index

            gameState.board[fromX!][castleDirection!].color = currentPlayerColor;
            gameState.board[fromX!][castleDirection!].type = 'king';
            gameState.board[fromX!][castleDirection!].hasMoved = true;
            gameState.board[fromX!][castleDirection!].position = [toX, castleDirection!];
            gameState.board[fromX!][castleDirection!].index = gameState.board[fromX!][fromY!].index
            
            gameState.board[fromX!][rookDirection!].color = 'none';
            gameState.board[fromX!][rookDirection!].type = 'empty';
            gameState.board[fromX!][rookDirection!].hasMoved = true;
            gameState.board[fromX!][rookDirection!].position = [];
            gameState.board[fromX!][rookDirection!].index = -1

            gameState.board[fromX!][fromY!].color = 'none';
            gameState.board[fromX!][fromY!].type = 'empty';
            gameState.board[fromX!][fromY!].hasMoved = true;
            gameState.board[fromX!][fromY!].position = [];
            gameState.board[fromX!][fromY!].index = -1
            hasCastled = true

        }

        if (!piece || piece.type === 'empty') {
            console.error('No piece');
            return;
        }
        console.log('lastDragOverPosition', lastDragOverPosition.current)
        if (!pieceValidMoves) {
            console.error('Error: no valid moves made for piece');
            return;
        }
        if (canCastle) {
            pieceValidMoves.push([toX, toY]);
        }
        console.log('761pieceValidMoves', pieceValidMoves);
        const isPieceValidMove = pieceValidMoves && pieceValidMoves.some(move => {
            const isStartPosEqual = move.every((value, index) => value === startPosition.current![index]);
            const isLastDragPosEqual = move.every((value, index) => value === lastDragOverPosition.current![index]);
            return isStartPosEqual || isLastDragPosEqual;
        });
        console.log('isPieceValidMove', isPieceValidMove);
        if (!isPieceValidMove || turnState !== playerNumber) {
            return;
        }
        
        console.log('761threateningSquares', threateningSquares, gameState);
        gameState.threateningPiecesPositions[currentPlayerColor] = calculateThreateningSquares(gameState, currentPlayerColor, piece, lastDragOverPosition.current!);
        //const didKingCastle = piece.type === 'king' && Math.abs(toY - fromY) === 2;
        
        console.log('isPieceValidMove', isPieceValidMove, gameState, castlingDirection)
        //This if Statement handles moving out of check
        // FIX: this needs to be converted to function probably and probably duplicated and edited to 
        //handle move out of check in the checkMate
        if (isPieceValidMove) {
            const tempGameState = JSON.parse(JSON.stringify(gameState));
            tempGameState.board[toX][toY] = piece;
            tempGameState.board[toX][toY].hasMoved = true;
            tempGameState.board[fromX!][fromY!] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false };
            console.log('847tempGameState', tempGameState, gameState);
            let checkPosition;
            let matchFoundInDirection;
            //add a check to see if piece is moving into threatening square array from game state 
            const moveIntoCheck = isCheck(tempGameState, gameState.threateningPiecesPositions[currentPlayerColor], opponentPlayerNumber, checkPosition!, piece, piece.position!, playerNumber, lastDragOverPosition.current, matchFoundInDirection!, currentPlayerColor);
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
            if (piece.type === 'pawn' && Math.abs(toX - fromX!) === 2) {
                piece.hasMovedTwo = true;
                console.log('847piece.hasMovedTwo', piece.hasMovedTwo, piece);
            }
            const enPassantDirection = piece.color === 'white' ? -1 : 1;
            //Check if lastDragOverPosition is equal to the enPassantMove if it is then update the board to remove the piece that was taken
            if (enPassantMove && lastDragOverPosition.current![0] === enPassantMove[0] && lastDragOverPosition.current![1] === enPassantMove[1]) {
                updateBoard(gameState, lastDragOverPosition.current![0] - enPassantDirection, lastDragOverPosition.current![1], {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: -1, id: -1, position: [lastDragOverPosition.current![0] - enPassantDirection, lastDragOverPosition.current![1]] as Position});
            }
            
            updateBoard(gameState, fromX!, fromY!, {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: -1, id: -1, position: [fromX!, fromY!] as Position});
            console.log('847 gameState updated', gameState);  
            
            console.log('847canCastle', canCastle, piece.type, castlingDirection, piece.hasMoved, piece);
            if (piece.type === 'king' && canCastle) {
                // Extra guard: ensure castling is still legal at execution time
                const attackerColor = currentPlayerColor === 'white' ? 'black' : 'white';
                const rank = fromX!;
                const startFile = fromY!;
                const dir = (toY === 0 || toY === 2) ? -1 : (toY === 7 || toY === 6) ? 1 : (toY! > startFile ? 1 : -1);
                const step1: Position = [rank, startFile + dir];
                const step2: Position = [rank, startFile + 2 * dir];

                // Local attack detector (matches rules used elsewhere)
                const isSquareUnderAttackLocal = (square: Position, state: GameStateType, attacker: 'white' | 'black'): boolean => {
                    const [y, x] = square;
                    if (y === undefined || x === undefined) return false;
                    // Pawns
                    const pawnDirs = attacker === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
                    for (const [dy, dx] of pawnDirs) {
                        const py = y + dy, px = x + dx;
                        if (py >= 0 && py < 8 && px >= 0 && px < 8) {
                            const p = state.board[py][px];
                            if (p.type === 'pawn' && p.color === attacker) return true;
                        }
                    }
                    // Knights
                    const knightDirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
                    for (const [dy, dx] of knightDirs) {
                        const ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
                            const p = state.board[ny][nx];
                            if (p.type === 'knight' && p.color === attacker) return true;
                        }
                    }
                    // Rooks/Queens
                    const rookDirs = [[0,1],[1,0],[0,-1],[-1,0]];
                    for (const [dy, dx] of rookDirs) {
                        let cy = y + dy, cx = x + dx;
                        while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
                            const p = state.board[cy][cx];
                            if (p.type !== 'empty') {
                                if (p.color === attacker && (p.type === 'rook' || p.type === 'queen')) return true;
                                break;
                            }
                            cy += dy; cx += dx;
                        }
                    }
                    // Bishops/Queens
                    const bishopDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
                    for (const [dy, dx] of bishopDirs) {
                        let cy = y + dy, cx = x + dx;
                        while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
                            const p = state.board[cy][cx];
                            if (p.type !== 'empty') {
                                if (p.color === attacker && (p.type === 'bishop' || p.type === 'queen')) return true;
                                break;
                            }
                            cy += dy; cx += dx;
                        }
                    }
                    // Kings
                    const kingDirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
                    for (const [dy, dx] of kingDirs) {
                        const ky = y + dy, kx = x + dx;
                        if (ky >= 0 && ky < 8 && kx >= 0 && kx < 8) {
                            const p = state.board[ky][kx];
                            if (p.type === 'king' && p.color === attacker) return true;
                        }
                    }
                    return false;
                };

                const pathClear = () => {
                    const targetRookFile = dir === -1 ? 0 : 7;
                    for (let f = Math.min(startFile, targetRookFile) + 1; f <= Math.max(startFile, targetRookFile) - 1; f++) {
                        if (gameState.board[rank][f].type !== 'empty') return false;
                    }
                    return true;
                };

                const illegal = gameState.checkStatus[currentPlayerColor]
                    || isSquareUnderAttackLocal(step1, gameState, attackerColor)
                    || isSquareUnderAttackLocal(step2, gameState, attackerColor)
                    || !pathClear();

                if (illegal) {
                    console.log('Castling blocked at execution time:', { step1, step2, attackerColor });
                } else {
                    console.log('847Castling king:', currentPlayerColor, toX, toY);
                    handleCastling(gameState, toX, toY, piece);
                }
            }

            piece.hasMoved = true;
            console.log('847piece.hasMoved', piece.hasMoved, piece);
            updateBoard(gameState, toX, toY, piece);

            // Recompute check flags from the final board (authoritative)
            const isSquareUnderAttackLocal = (square: Position, state: GameStateType, attackerColor: 'white' | 'black'): boolean => {
                const [y, x] = square;
                if (y === undefined || x === undefined) return false;
                // Pawns
                const pawnDirs = attackerColor === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
                for (const [dy, dx] of pawnDirs) {
                    const py = y + dy, px = x + dx;
                    if (py >= 0 && py < 8 && px >= 0 && px < 8) {
                        const p = state.board[py][px];
                        if (p.type === 'pawn' && p.color === attackerColor) return true;
                    }
                }
                // Knights
                const knightDirs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
                for (const [dy, dx] of knightDirs) {
                    const ny = y + dy, nx = x + dx;
                    if (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
                        const p = state.board[ny][nx];
                        if (p.type === 'knight' && p.color === attackerColor) return true;
                    }
                }
                // Rooks/Queens
                const rookDirs = [[0,1],[1,0],[0,-1],[-1,0]];
                for (const [dy, dx] of rookDirs) {
                    let cy = y + dy, cx = x + dx;
                    while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
                        const p = state.board[cy][cx];
                        if (p.type !== 'empty') {
                            if (p.color === attackerColor && (p.type === 'rook' || p.type === 'queen')) return true;
                            break;
                        }
                        cy += dy; cx += dx;
                    }
                }
                // Bishops/Queens
                const bishopDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
                for (const [dy, dx] of bishopDirs) {
                    let cy = y + dy, cx = x + dx;
                    while (cy >= 0 && cy < 8 && cx >= 0 && cx < 8) {
                        const p = state.board[cy][cx];
                        if (p.type !== 'empty') {
                            if (p.color === attackerColor && (p.type === 'bishop' || p.type === 'queen')) return true;
                            break;
                        }
                        cy += dy; cx += dx;
                    }
                }
                // Kings
                const kingDirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
                for (const [dy, dx] of kingDirs) {
                    const ky = y + dy, kx = x + dx;
                    if (ky >= 0 && ky < 8 && kx >= 0 && kx < 8) {
                        const p = state.board[ky][kx];
                        if (p.type === 'king' && p.color === attackerColor) return true;
                    }
                }
                return false;
            };
            gameState.checkStatus.white = isSquareUnderAttackLocal(gameState.kingPositions.white, gameState, 'black');
            gameState.checkStatus.black = isSquareUnderAttackLocal(gameState.kingPositions.black, gameState, 'white');
            if (!gameState.checkStatus.white && !gameState.checkStatus.black) {
                gameState.checkStatus.direction = -1;
            }
            console.log('847 gameState updated', gameState);   
        }

        //maybe everything above should be gameState instead of newGameState or should just change everything to be either gameState or newGameState
        const isAIGame = roomCode && roomCode.startsWith('ai-');
        if (isAIGame) {
            // For AI games, always allow player moves when it's their turn regardless of turnState
            const isPlayerTurn = 
                (props.playerNumber === 1 && gameState.turn === 'black') || 
                (props.playerNumber === 2 && gameState.turn === 'white');
            
            console.log("AI game move check:", { 
                isPlayerTurn,
                playerNumber: props.playerNumber,
                turn: gameState.turn
            });
            
            // Only block moves when it's not the player's turn
            if (!isPlayerTurn) {
                console.log('Cannot move - AI is currently thinking');
                return false;
            }
            
            // Continue with the move for player's turn in AI games
            console.log("AI game: Player's turn, allowing move");
        } else if (props.playerNumber !== props.turnState) {
            // For standard multiplayer games, enforce turn state
            console.log('Not your turn in multiplayer game');
            return false;
        }

        // Then continue with your existing turn checks
        if (props.playerNumber !== props.turnState) {
            console.log('Not your turn');
            return false;
        }
        
        if (piece.type === 'king') {
            console.log('556Moving king:', currentPlayerColor, toX, toY);
            if (hasCastled) {
                const finalY = fromY! + (toY > fromY! ? 2 : -2);
                gameState.kingPositions[currentPlayerColor] = [toX, finalY];
            } else {
                gameState.kingPositions[currentPlayerColor] = [toX, toY];
            }
            gameState.turn = gameState.history.length % 2 === 0 ? 'black' : 'white';
            console.log('556gameState', gameState);
        }


        // Record the correct destination for castling (final king square)
        const historyToY = (piece.type === 'king' && hasCastled)
            ? (fromY! + (toY > fromY! ? 2 : -2))
            : toY;
        gameState.history.push({
            piece: { ...piece, hasMoved: true },
            from: [fromX!, fromY!],
            to: [toX, historyToY],
            board: JSON.parse(JSON.stringify(gameState.board)),
            turnNumber: gameState.history.length,
            turn: currentPlayerColor,
        });

        if (isKingInCheckMate) {
            setGameOver(true);
            if (socket) {
                socket.emit('gameOver', true, isKingInCheckMate ? loser : null, roomCode);
            }
        }

        // Check if the player's move puts the opponent in check
        if (isOpponentKingInCheck) {
            console.log('🔥 Player move puts opponent in check!', opponentColor);
            gameState.checkStatus[opponentColor] = true;
        } else {
            gameState.checkStatus[opponentColor] = false;
        }

        // Update the game state after the move
        setGameState({...gameState});

    //Maybe everything above should be gameState instead of newGameState or should just change everything to be either gameState or newGameState
        if (socket) {
            socket.emit('gameState', gameState, roomCode);
            socket.emit('turn', turnState === 1 ? 2 : 1, roomCode);
            setTurnState(turnState === 1 ? 2 : 1);
        }
    }
      
    const { gameOver, playerNumber, turnState, winner, showPromotionDialog, promotionPosition, pieceToPromote, setShowPromotionDialog, setPromotionPosition, setPieceToPromote, setGameState, setTurnState, setWinner, setGameOver, setIsPlayerInCheck } = props;
    
    // Add a click handler for the board itself to clear selection when clicking empty areas
    // Modify the existing handleBoardClick function
    const handleBoardClick = () => {
        console.log("Board clicked - deselecting any selected piece");
        
        // If clicked on the board background (not a piece or valid move square)
        if (props.selectedPiece) {
            props.setSelectedPiece(null);
            props.setHighlightedTiles([]);
        }
    };

    const handlePieceClick = (event: React.MouseEvent, piece: PieceType, position: Position) => {
        // Stop event propagation to prevent immediate deselection
        event.stopPropagation();
        
        // Check if we're trying to capture an opponent's piece
        if (props.selectedPiece && props.highlightedTiles.some(tile => 
            tile[0] === position[0] && tile[1] === position[1]
        )) {
            // We're clicking on a highlighted square with a piece - handle as capture
            console.log("Capturing piece at:", position);
            handleSquareClick(event, position);
            return;
        }

        // Only allow clicking pieces if it's the player's turn
        if (currentPlayerColor !== (playerNumber === 1 ? 'black' : 'white') || turnState !== playerNumber) {
            return;
        }
        
        // If the same piece is clicked again, deselect it
        if (props.selectedPiece && props.selectedPiece.index === piece.index) {
            props.setSelectedPiece(null);
            props.setHighlightedTiles([]);
            return;
        }
        
        // If the piece belongs to the current player, select it and show valid moves
        // If the piece belongs to the current player, create a synthetic drag event
        if (piece.color === currentPlayerColor) {
            startPosition.current = position;
            
            // Instead of trying to filter moves ourselves, just check if this
            // piece has any valid moves in the current game state
            const fakeEvent = {
                preventDefault: () => {},
                dataTransfer: {
                    getData: (key: string) => {
                        if (key === 'piece') return JSON.stringify(piece);
                        if (key === 'position') return JSON.stringify(position);
                        return '';
                    }
                }
            } as unknown as React.DragEvent;
            
            // Get the valid moves using handleDrop's internal logic
            lastDragOverPosition.current = null; // Reset this to force handleDrop to calculate all valid moves
            const validPositions = getValidPositions(fakeEvent);
            
            if (validPositions && validPositions.length > 0) {
                props.setSelectedPiece(piece);
                props.setHighlightedTiles(validPositions);
            } else {
                props.setSelectedPiece(null);
                props.setHighlightedTiles([]);
                console.log("No valid moves for this piece");
            }
        }
        
    };
    // Helper function to get valid positions
    const getValidPositions = (event: React.DragEvent): Position[] => {
        // Extract piece and position from the event
        const pieceString = event.dataTransfer.getData('piece');
        const positionString = event.dataTransfer.getData('position');
        
        if (!pieceString || !positionString) return [];
        
        const piece: PieceType = JSON.parse(pieceString);
        const position: Position = JSON.parse(positionString);
        
        // Get valid moves using the same code path as handleDrop
        const result = validMoves(piece, position, gameState, playerNumber, position, { dryRun: true });

        // Normalize result into an array of positions
        let moves: Position[] = [];
        if (result) {
            if (Array.isArray(result)) {
                moves = result;
            } else if ('moves' in result) {
                moves = result.moves;
            }
        }

        // Special handling for castling in click-to-move mode
        // Castling is triggered by clicking the rook, so we need to highlight
        // the rook squares when castling is permitted. Reuse existing logic in
        // validMoves to verify castling by testing each rook position.
        if (piece.type === 'king') {
            const potentialRooks: Position[] = [
                [position[0]!, 0], // Queenside rook
                [position[0]!, 7]  // Kingside rook
            ];

            potentialRooks.forEach(rookPos => {
                const castleResult = validMoves(piece, position, gameState, playerNumber, rookPos, { dryRun: true });
                if (castleResult && !Array.isArray(castleResult) && castleResult.canCastle) {
                    // Only add if not already in moves
                    if (!moves.some(m => m[0] === rookPos[0] && m[1] === rookPos[1])) {
                        console.log("Clickcaslting0012", rookPos, moves);
                        moves.push(rookPos);
                    }
                }
            });
        }

        // Include en passant capture squares in highlight
        if (piece.type === 'pawn') {
            const direction = piece.color === 'white' ? -1 : 1;
            const targets: Position[] = [
                [position[0]! + direction, position[1]! - 1],
                [position[0]! + direction, position[1]! + 1]
            ];

            targets.forEach(target => {
                const [ty, tx] = target;
                if (ty! >= 0 && ty! < 8 && tx! >= 0 && tx! < 8) {
                    const epMove = enPassant(piece, target, gameState);
                    if (epMove && !moves.some(m => m[0] === epMove[0] && m[1] === epMove[1])) {
                        moves.push(epMove);
                    }
                }
            });
        }

        return moves; // Fallback for any other case
    };
    const handleSquareClick = (event: React.MouseEvent, position: Position) => {
        event.stopPropagation(); // Prevent bubbling
        
        console.log("Square clicked at:", position);
        console.log("Selected piece:", props.selectedPiece);
        console.log("Current highlighted tiles:", props.highlightedTiles);
        
        // If no piece is selected or it's not the player's turn, do nothing
        if (!props.selectedPiece || currentPlayerColor !== (playerNumber === 1 ? 'black' : 'white') || turnState !== playerNumber) {
            return;
        }
        
        // Check if the clicked position is a valid move
        const isValidMove = props.highlightedTiles.some(move => 
            move[0] === position[0] && move[1] === position[1]
        );
        console.log("Is valid move:", isValidMove);
        
        if (isValidMove) {
            // Store the original piece position
            const piecePosition = props.selectedPiece.position as Position;
            console.log("Moving piece from:", piecePosition, "to:", position);
            
            // Make sure we're not trying to castle onto our own rook
            if (props.selectedPiece.type === 'king') {
                const targetPiece = gameState.board[position[0]!][position[1]!];
                if (targetPiece && targetPiece.type === 'rook' && targetPiece.color === props.selectedPiece.color) {
                    console.log("Castling detected - handling through normal move logic");
                    // Continue with move - castling will be handled by move logic
                }
            }
            
            // Update the refs used by the drag and drop functionality
            startPosition.current = piecePosition;
            lastDragOverPosition.current = position;
            
            // Execute the same move logic as in handleDrop
            const fakeEvent = {
                preventDefault: () => {},
                dataTransfer: {
                    getData: (key: string) => {
                        if (key === 'piece') return JSON.stringify(props.selectedPiece);
                        if (key === 'position') return JSON.stringify(piecePosition);
                        return '';
                    }
                }
            } as unknown as React.DragEvent;
            
            // Clear selection and highlights BEFORE calling handleDrop
            // to avoid race conditions
            //const selectedPieceCopy = props.selectedPiece;
            props.setSelectedPiece(null);
            props.setHighlightedTiles([]);
            
            // Call the existing handleDrop function with our synthetic event
            handleDrop(fakeEvent);
        } else {
            // If clicked on an invalid move square, just deselect
            props.setSelectedPiece(null);
            props.setHighlightedTiles([]);
            console.log("Deselecting piece - invalid move");
        }
    };

    const handlePromotionSelection = (promoteTo: 'queen' | 'rook' | 'bishop' | 'knight') => {
        if (!pieceToPromote || !promotionPosition || !gameState) {
            return;
        }
        
        // Create a deep copy of the game state
        const updatedGameState = JSON.parse(JSON.stringify(gameState));
        
        // Get source position (where the pawn came from)
        const fromX = startPosition.current ? startPosition.current[0] : 0;
        const fromY = startPosition.current ? startPosition.current[1] : 0;
        
        // Get destination position (where the pawn is being promoted)
        const toX = promotionPosition[0];
        const toY = promotionPosition[1];
        
        // Check if the pawn is capturing a king during promotion
        const targetPiece = gameState.board[toX!][toY!];
        if (targetPiece.type === 'king') {
            console.log('King captured during pawn promotion selection! Game over.', targetPiece.color, 'king was captured by promoted pawn');
            setGameOver(true);
            if (props.isAIGame) {
                setWinner(pieceToPromote.color === 'white' ? 'AI (White)' : 'Player (Black)');
            } else {
                setWinner(pieceToPromote.color === 'white' ? 'White' : 'Black');
            }
            setTurnState(3);
            
            // For AI games, don't emit to server
            if (socket && !props.isAIGame) {
                socket.emit('gameOver', true, targetPiece.color === 'white' ? 'White' : 'Black', roomCode);
            }
            
            // Close the promotion dialog
            setShowPromotionDialog(false);
            setPromotionPosition(null);
            setPieceToPromote(null);
            return; // End the function here since game is over
        }
        
        // Update the board with the promoted piece
        updatedGameState.board[toX!][toY!] = {
            ...pieceToPromote,
            type: promoteTo,
            hasMoved: true,
            position: promotionPosition
        };
        
        // Clear the original square
        updatedGameState.board[fromX!][fromY!] = {
            type: 'empty', 
            color: 'none', 
            hasMoved: false, 
            isHighlighted: false, 
            index: -1, 
            position: [fromX, fromY]
        };
        
        // Update piece positions
        if (updatedGameState.piecePositions && updatedGameState.piecePositions[currentPlayerColor]) {
            const pieceIndex = updatedGameState.piecePositions[currentPlayerColor].findIndex(
                (p: PieceType) => p.id === pieceToPromote.index
            );
            
            if (pieceIndex !== -1) {
                updatedGameState.piecePositions[currentPlayerColor][pieceIndex] = {
                    ...updatedGameState.piecePositions[currentPlayerColor][pieceIndex],
                    type: promoteTo,
                    position: promotionPosition,
                    hasMoved: true
                };
            }
        }
        
        // Add move to history
        updatedGameState.history.push({
            piece: { ...pieceToPromote, type: promoteTo, hasMoved: true },
            from: [fromX, fromY],
            to: promotionPosition,
            board: JSON.parse(JSON.stringify(updatedGameState.board)),
            turnNumber: updatedGameState.history.length,
            turn: currentPlayerColor,
            isPromotion: true,
            promotedTo: promoteTo
        });
        
        // Change turn BEFORE updating game state
        const nextTurn = turnState === 1 ? 2 : 1;
        updatedGameState.turn = nextTurn === 1 ? 'black' : 'white';
        
        console.log("🎯 Player move completed - Turn changing:", {
            oldTurn: gameState.turn,
            newTurn: updatedGameState.turn,
            turnState,
            nextTurn,
            isAIGame: roomCode && roomCode.startsWith('ai-')
        });
        
        // Update game state with turn change included
        setGameState(updatedGameState);
        setTurnState(nextTurn);
        
        // Reset promotion dialog
        setShowPromotionDialog(false);
        setPromotionPosition(null);
        setPieceToPromote(null);
        
        // Emit updated game state to other player if multiplayer
        if (socket) {
            socket.emit('gameState', updatedGameState, roomCode);
            socket.emit('turn', nextTurn, roomCode);
        }
    };
    
    useEffect(() => {
        if (gameState.turn !== (turnState === 1 ? 'black' : 'white')) {
            console.log('turnState1', turnState)
            setGameState(prevState => {
                // Create a copy of the previous game state
                const gameState = { ...prevState };

                // Update the turn in the new game state
                gameState.turn = turnState === 1 ? 'black' : 'white';

                // Return the new game state
                return gameState;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, turnState, handleDrop]);
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // Check if the click was outside the board
            const boardElement = document.querySelector('.board');
            if (boardElement && !boardElement.contains(e.target as Node) && props.selectedPiece) {
                props.setSelectedPiece(null);
                props.setHighlightedTiles([]);
            }
        };
        
        document.addEventListener('mousedown', handleGlobalClick);
        
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.selectedPiece, props.setSelectedPiece, props.setHighlightedTiles]);
    useEffect(() => {
        // Check for game over and winner
        console.log('gameOver', gameOver);

        if (gameOver || isKingInCheckMate) {
            console.log('gameOver', gameOver);
            console.log('loser1', loser);
            setWinner(loser);
            setGameOver(true);
        }
    }, [gameState, gameOver, playerNumber, turnState, setTurnState, setWinner, setGameOver, loser, isKingInCheckMate]);

    // Check for check and checkmate
    useEffect(() => {
        // Check if the current player is in check
        if (isKingInCheck) {
            setIsPlayerInCheck(true);
        } else {
            setIsPlayerInCheck(false);
        }
    }, [gameState, isKingInCheck, setIsPlayerInCheck]);
    // Check for stalemate and draw
    useEffect(() => {
        if (isDraw(gameState, playerNumber) && turnState !== 0 && !isKingInCheck) {
            console.log('Draw');
            setGameOver(true);
            setWinner('Draw');
            setTurnState(3);
        }
    }, [gameState, playerNumber, setGameOver, setWinner, setTurnState, turnState, isKingInCheck]);
    useEffect(() => {
        setGameOver(false);
        setWinner(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    //render
    console.log('loser', loser)
    console.log('turnState2', turnState)
    gameState.turn = turnState === 1 ? 'black' : 'white';
    console.log('761props.gameState', props.gameState)
    // Do not overwrite local gameState from props on every render — this caused stale flags to reappear
    const isCurrentPlayerInCheck = isKingInCheck && gameState.checkStatus[opponentPlayerNumber === 1 ? 'black' : 'white'];
    console.log('761isCurrentPlayerInCheck', isCurrentPlayerInCheck, gameState.checkStatus);
    
    // Create AI reset function that ensures AI state is fully reset when exiting
    const resetAI = props.isAIGame ? () => {
        console.log('Exiting AI game - resetting all AI state...');
        props.setPlayingAgainstAI(false); // Explicitly reset AI state
        props.resetGame(); // Reset game state and aiMoveInProgress
    } : undefined;
    
    return (
        <div className='Chess'>
            <h1>Room Code: <br /> {roomCode}</h1>
            <div className='chess-buttons-status'>
                <h2>{turnState === 0 ? "Waiting for opponent" : (playerNumber === turnState ? "Your Turn" : "Opponent's Turn")}</h2>
                {gameOver && <GameOver setGameState={setGameState} setTurnState={setTurnState} setWinner={setWinner} gameState={gameState} winner={winner} resetAI={resetAI} />}
                {gameState.checkStatus.white && <h2>White in check!</h2>}
                {gameState.checkStatus.black && <h2>Black in check!</h2>}
                <BoardButtons 
                    setTurnState={setTurnState} 
                    setWinner={setWinner} 
                    setGameState={setGameState} 
                    gameState={gameState} 
                    roomCode={roomCode} 
                    handleReset={props.handleReset}
                    setPlayingAgainstAI={props.setPlayingAgainstAI}
                    setSelectedPiece={props.setSelectedPiece}
                    setHighlightedTiles={props.setHighlightedTiles}
                    isAIGame={props.isAIGame}
                    aiDifficulty={props.aiDifficulty}
                    turnState={props.turnState}
                />
            </div>
            
            <div className="board-container">
                {showPromotionDialog && (
                    <div className="promotion-overlay">
                        <div className="promotion-dialog">
                            <h3>Choose promotion piece:</h3>
                            <div className="promotion-options">
                                {['queen', 'rook', 'bishop', 'knight'].map(piece => (
                                    <div
                                        key={piece}
                                        className="promotion-piece"
                                        onClick={() => handlePromotionSelection(piece as 'queen' | 'rook' | 'bishop' | 'knight')}
                                    >
                                        <img
                                            src={getPieceIcon(piece as PieceNameWithoutNone, currentPlayerColor as PieceColor)}
                                            alt={`${currentPlayerColor} ${piece}`}
                                        />
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                <Board
                    setTurnState={setTurnState}
                    setWinner={setWinner}
                    gameState={props.gameState}
                    handleDragStart={handleDragStart}
                    handleDragEnter={handleDragEnter}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    isKingInCheck={isKingInCheck}
                    handlePieceClick={handlePieceClick}
                    handleSquareClick={handleSquareClick}
                    handleBoardClick={handleBoardClick}
                    highlightedTiles={props.highlightedTiles}
                    playerNumber={playerNumber}
                />
            </div>
        </div>
    );
}
export default Chess;

