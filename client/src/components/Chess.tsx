import { useEffect, useContext, useRef } from 'react';
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import isCheck from '../gameLogic/isCheck'
import validMoves from '../gameLogic/validMoves'
import isDraw from '../gameLogic/isDraw'
import Board from './Board';
import GameOver from './GameOver';
import { Props, Position, PieceType, GameStateType, ValidMovesResult } from '../types/clientTypes';
import calculateThreateningSquares from '../gameLogic/calculateThreateningSquares';
import BoardButtons from './BoardButtons';
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
    const gameState = props.gameState;
    if (props.playerNumber === 1) {
        gameState.username1 = props.username;
    }
    if (props.playerNumber === 2) {
        gameState.username2 = props.username;
    }
    const { roomCode } = useParams();
    
    const socket = useContext(SocketContext);
    const lastDragOverPosition = useRef<Position | null>(null);
    const startPosition = useRef<Position | null>(null);
    const currentPlayerColor = props.playerNumber === 1 ? 'black' : 'white';
    const opponentPlayerNumber = props.playerNumber === 1 ? 2 : 1;
    
    const isKingInCheck = props.gameState.checkStatus[currentPlayerColor];
    
    
    const isKingInCheckMate = false;
    const loser: string | null = gameState.turn === 'black' ? 'white' : 'black';
    let hasCastled = false;
    
    const handleDragStart = (event: React.DragEvent, piece: PieceType, position: Position) => {
        if (currentPlayerColor !== (playerNumber === 1 ? 'black' : 'white')) {
            return;
        }
        if (turnState !== playerNumber) {
            return;
        }
        event.dataTransfer.setData('piece', JSON.stringify(piece));
        event.dataTransfer.setData('position', JSON.stringify(position));
        startPosition.current = position;
        
    };
    
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        
        
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position | null) => {
        event.preventDefault();
        
        lastDragOverPosition.current = position;


        
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        
        
        const pieceData = event.dataTransfer.getData('piece');
        
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
        if (lastDragOverPosition.current) {
            piece.position = lastDragOverPosition.current;
            
        } else {
            console.error('Error: lastDragOverPosition is null');
            return;
        }
    
        const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
        const opponentColor = playerNumber === 1 ? 'white' : 'black';
        
        
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
                
        
        const validMovesResult = validMoves(piece, startPosition.current!, gameState, playerNumber, lastDragOverPosition.current!);
        if (!validMovesResult) {
            console.error('Error: validMoves returned nothing');
            return;
        } 
        const { moves: pieceValidMoves, isKingInCheck, checkDirection, isKingInCheckMate, isOpponentKingInCheck, enPassantMove, canCastle, canPromote, promotionPosition } = validMovesResult as ValidMovesResult;
        
        
        // Handle pawn promotion
        if (canPromote && piece.type === 'pawn') {
            setShowPromotionDialog(true);
            setPromotionPosition(promotionPosition!);
            setPieceToPromote(piece);
            return; // Exit the function to wait for user selection
        }
                
        if (isOpponentKingInCheck) {
            
            gameState.checkStatus[opponentColor] = true;
        }
        
        

        const updateBoard = (gameState: GameStateType, x: number, y: number, piece: PieceType) => {
            if (hasCastled) {
                return
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
                
                
                pieceToUpdate = gameState.piecePositions[currentPlayerColor].find(
                    pos => {
                        
                        return pos.id === piece.index;
                    }
                );
                
            }
            
            if (pieceToUpdate) {
                pieceToUpdate.hasMoved = true;
                pieceToUpdate.position = lastDragOverPosition.current || [];
                pieceToUpdate.hasMovedTwo && (pieceToUpdate.hasMovedTwo = true);
                pieceToUpdate.color = piece.color;
                const pieceIndex = pieceToUpdate.index;
                gameState.piecePositions[currentPlayerColor][pieceIndex!] = pieceToUpdate;
                
            }
            //Update check status
            if (isKingInCheck && gameState.checkStatus[currentPlayerColor] === true) {
                
                gameState.checkStatus[opponentColor] = true;
                gameState.checkStatus.direction = checkDirection!;
            }
        }
        
        const handleCastling = (gameState: GameStateType, toX: number, toY: number, piece: PieceType) => {
            let castleDirection : number;
            let rookDirection : number;
            let rookPosition : number;
            if ((toY === 0 || toY === 2) && piece && piece.position) {
                castleDirection = fromY! - 2
                rookPosition = fromY! - 1
                rookDirection = 0
              }
              if ((toY === 7 || toY === 6) && piece && piece.position) {
                castleDirection = fromY! + 2
                rookPosition = fromY! + 1
                rookDirection = 7;
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
        if (!pieceValidMoves) {
            console.error('Error: no valid moves made for piece');
            return;
        }
        if (canCastle) {
            pieceValidMoves.push([toX, toY]);
        }
        
        const isPieceValidMove = pieceValidMoves && pieceValidMoves.some(move => {
            const isStartPosEqual = move.every((value, index) => value === startPosition.current![index]);
            const isLastDragPosEqual = move.every((value, index) => value === lastDragOverPosition.current![index]);
            return isStartPosEqual || isLastDragPosEqual;
        });
        
        if (!isPieceValidMove || turnState !== playerNumber) {
            return;
        }
        
        
        gameState.threateningPiecesPositions[currentPlayerColor] = calculateThreateningSquares(gameState, currentPlayerColor, piece, lastDragOverPosition.current!);
        //This if Statement handles moving out of check
        //handle move out of check in the checkMate
        if (isPieceValidMove) {
            const tempGameState = JSON.parse(JSON.stringify(gameState));
            tempGameState.board[toX][toY] = piece;
            tempGameState.board[toX][toY].hasMoved = true;
            tempGameState.board[fromX!][fromY!] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false };
            
            let checkPosition;
            let matchFoundInDirection;
            //add a check to see if piece is moving into threatening square array from game state 
            const moveIntoCheck = isCheck(tempGameState, gameState.threateningPiecesPositions[currentPlayerColor], opponentPlayerNumber, checkPosition!, piece, piece.position!, playerNumber, lastDragOverPosition.current, matchFoundInDirection!, currentPlayerColor);
            
            if (moveIntoCheck.isKingInCheck) {
                
                //const isKingInCheckMate = isCheckmate(gameState, currentPlayerColor);
                
                return;
            } else {
                gameState.checkStatus[currentPlayerColor] = false;                
                
            }
            
            if (piece.type === 'pawn' && Math.abs(toX - fromX!) === 2) {
                piece.hasMovedTwo = true;
                
            }
            const enPassantDirection = piece.color === 'white' ? -1 : 1;
            //Check if lastDragOverPosition is equal to the enPassantMove if it is then update the board to remove the piece that was taken
            if (enPassantMove && lastDragOverPosition.current![0] === enPassantMove[0] && lastDragOverPosition.current![1] === enPassantMove[1]) {
                updateBoard(gameState, lastDragOverPosition.current![0] - enPassantDirection, lastDragOverPosition.current![1], {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: -1, id: -1, position: [lastDragOverPosition.current![0] - enPassantDirection, lastDragOverPosition.current![1]] as Position});
            }
            
            updateBoard(gameState, fromX!, fromY!, {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: -1, id: -1, position: [fromX!, fromY!] as Position});
              
            
            
            if (piece.type === 'king' && canCastle) {
                
                handleCastling(gameState, toX, toY, piece);
            }

            piece.hasMoved = true;
            
            updateBoard(gameState, toX, toY, piece);
               
        }

        //maybe should use gameState instead of newGameState because the emit is sending gameState
        
        if (piece.type === 'king') {
            
            gameState.kingPositions[currentPlayerColor] = [toX, toY];
            gameState.turn = gameState.history.length % 2 === 0 ? 'black' : 'white';
            
        }


        gameState.history.push({
            piece: { ...piece, hasMoved: true },
            from: [fromX!, fromY!],
            to: [toX, toY],
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
            let validPositions = getValidPositions(fakeEvent);

            // Manually check for castling options when using click-to-move
            if (piece.type === 'king') {
                const startPos = position;
                const castleTargets: Position[] = [
                    [startPos[0], 0], // queenside rook
                    [startPos[0], 7], // kingside rook
                ];

                castleTargets.forEach(target => {
                    const pieceCopy = JSON.parse(JSON.stringify(piece)) as PieceType;
                    const result = validMoves(pieceCopy, startPos, gameState, playerNumber, target) as ValidMovesResult;
                    if (result && result.canCastle) {
                        const exists = validPositions.some(move => move[0] === target[0] && move[1] === target[1]);
                        if (!exists) {
                            validPositions.push(target);
                        }
                    }
                });
            }

            if (validPositions && validPositions.length > 0) {
                props.setSelectedPiece(piece);
                props.setHighlightedTiles(validPositions);
            } else {
                props.setSelectedPiece(null);
                props.setHighlightedTiles([]);

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
        const result = validMoves(piece, position, gameState, playerNumber, position);
        
        // Handle different possible return types from validMoves
        if (!result) return [];
        if (Array.isArray(result)) return result; // Handle Position[] return type
        if ('moves' in result) return result.moves; // Handle ValidMovesResult return type
        return []; // Fallback for any other case
    };
    const handleSquareClick = (event: React.MouseEvent, position: Position) => {
        event.stopPropagation(); // Prevent bubbling
        
        
        
        
        
        // If no piece is selected or it's not the player's turn, do nothing
        if (!props.selectedPiece || currentPlayerColor !== (playerNumber === 1 ? 'black' : 'white') || turnState !== playerNumber) {
            return;
        }
        
        // Check if the clicked position is a valid move
        const isValidMove = props.highlightedTiles.some(move => 
            move[0] === position[0] && move[1] === position[1]
        );
        
        
        if (isValidMove) {
            // Store the original piece position
            const piecePosition = props.selectedPiece.position as Position;
            
            
            // Make sure we're not trying to castle onto our own rook
            if (props.selectedPiece.type === 'king') {
                const targetPiece = gameState.board[position[0]!][position[1]!];
                if (targetPiece && targetPiece.type === 'rook' && targetPiece.color === props.selectedPiece.color) {
                    
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
        
        // Update game state
        setGameState(updatedGameState);
        
        // Reset promotion dialog
        setShowPromotionDialog(false);
        setPromotionPosition(null);
        setPieceToPromote(null);
        
        // Change turn
        const nextTurn = turnState === 1 ? 2 : 1;
        setTurnState(nextTurn);
        
        // Emit updated game state to other player if multiplayer
        if (socket) {
            socket.emit('gameState', updatedGameState, roomCode);
            socket.emit('turn', nextTurn, roomCode);
        }
    };
    
    useEffect(() => {
        if (gameState.turn !== (turnState === 1 ? 'black' : 'white')) {
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
        

        if (gameOver || isKingInCheckMate) {
            
            
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
    gameState.turn = turnState === 1 ? 'black' : 'white';
    // setGameState(props.gameState)
    
    return (
        <div className='Chess'>
            <h1>Room Code: <br /> {roomCode}</h1>
            <div className='chess-buttons-status'>
                <h2>{turnState === 0 ? "Waiting for opponent" : (playerNumber === turnState ? "Your Turn" : "Opponent's Turn")}</h2>
                {gameOver && <GameOver setGameState={setGameState} setTurnState={setTurnState} setWinner={setWinner} gameState={gameState} winner={winner} />}
                {gameState.checkStatus.white && <h2>White in check!</h2>}
                {gameState.checkStatus.black && <h2>Black in check!</h2>}
                <BoardButtons setTurnState={setTurnState} setWinner={setWinner} setGameState={setGameState} gameState={gameState} roomCode={roomCode} />
            </div>
            
            {/* Add Promotion Dialog */}
            {showPromotionDialog && (
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
                                    src={`/src/assets/${piece}${currentPlayerColor.charAt(0).toUpperCase() + currentPlayerColor.slice(1)}.svg`} 
                                    alt={piece} 
                                />
                            </div>
                        ))}
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
/>        </div>
    );
}
export default Chess;