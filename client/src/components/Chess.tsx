//TODO: 
// in separate files create a function for each piece that will  
//take in piece and board info and return a list of valid moves
//take in piece and board info and perform move logic for corresponding piece in switch statement
//take in piece and board info and perform check logic
//take in piece and board info and perform checkmate logic
//take in piece board and info and perform en passant logic
//take in piece board and info and perform castling logic
import { useEffect, useContext, useRef } from 'react';
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import isCheck from '../gameLogic/isCheck'
import validMoves from '../gameLogic/validMoves'
import isDraw from '../gameLogic/isDraw'
import Board from './Board';
import GameOver from './GameOver';
// import BoardTimer from './BoardTimer';
import { Props, Position, Piece, GameState } from '../types/clientTypes';
import calculateThreateningSquares from '../gameLogic/calculateThreateningSquares';
import getMovesForPiece from '../gameLogic/pieceMoves';
import moveOutOfCheck from '../gameLogic/validMoves';
import isCheckOpponent from '../gameLogic/isCheckOpponent';
import BoardButtons from './BoardButtons';
import resetGameState from '../gameLogic/resetGameState';

interface HandleDropProps {
    gameState: GameState;
    playerNumber: number;
    turnState: number;
    setHighlightedTiles: (tiles: Position[]) => void;
    setGameState: (gameState: GameState) => void;
    setGameOver: (gameOver: boolean) => void;
}

const Chess: React.FC<Props> = (props) => {
    // if (!props.gameState) {
    //     const { initialBoard } = resetGameState();
    //     props.gameState = initialBoard
    //     console.log('props.gameState', props.gameState)
    // }
    const gameState = props.gameState;
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
    // if (props.gameState.history.length > 2) {
    //     ({ isKingInCheck, isKingInCheckMate, loser } = isCheck(props.gameState, props.playerNumber));
    // }
    //let dragOverPiece;
    const handleDragStart = (event: React.DragEvent, piece, position: Position) => {
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
        console.log('Startposition', position);
        console.log('Startpiece', currentPlayerColor, gameState);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position | []) => {
        event.preventDefault();
        console.log('handleDragOver');
        lastDragOverPosition.current = position;


        console.log('DragOverPosition', position, gameState);
    };

    const handleDrop = (event: React.DragEvent, props: HandleDropProps) => {
        console.log('761handleDropProps.gameState', gameState);
        event.preventDefault();
        console.log('handleDrop');
        const pieceData = event.dataTransfer.getData('piece');
        console.log('handleDroppieceData', pieceData);
        if (!pieceData) {
            console.error('handleDropNo piece data');
            return;
        }

        let piece: Piece;
        try {
            piece = JSON.parse(pieceData);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
        const currentPlayerColor = playerNumber === 1 ? 'black' : 'white';
        const opponentColor = playerNumber === 1 ? 'white' : 'black';
        console.log('5556opponentColor', opponentColor)
        const [toX, toY] = lastDragOverPosition.current;
        const [fromX, fromY] = piece.position;
        const didMoveDiagonally = Math.abs(toX - fromX) === 1 && Math.abs(toY - fromY) === 1;
        newGameState = JSON.parse(JSON.stringify(gameState));
        console.log('761validMovesCheck', piece.position, startPosition.current, newGameState, playerNumber, lastDragOverPosition.current, 
            currentPlayerInCheck, gameState)
        console.log('761currentPlayerInCheck', currentPlayerInCheck)
        //this may not need to declare threatening squares with validMoves and instead call calculateThreateningSquares separately
        const validMovesResult = validMoves(piece, startPosition.current, gameState, playerNumber, lastDragOverPosition.current);
        if (!validMovesResult) {
            console.error('Error: validMoves returned nothing');
            return
        } 
        const { moves: pieceValidMoves, threateningSquares, isKingInCheck, checkDirection, isKingInCheckMate, isOpponentKingInCheck, enPassantMove, canCastle } = validMovesResult;
        console.log('761pieceValidMoves', pieceValidMoves, isOpponentKingInCheck);
        if (isOpponentKingInCheck) {
            console.log('761isOpponentKingInCheck', isOpponentKingInCheck, opponentColor);
            gameState.checkStatus[opponentColor] = true;
            console.log('761gameState', gameState, gameState.checkStatus[opponentColor]);
        }
        

        console.log('761pieceValidMoves', pieceValidMoves);

        console.log('newGameState', newGameState, gameState);
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
            simulatedGameState.board[currentY][currentX] = {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false};
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
              console.log('3333Normal moves:', normalMoves);
          
              // Iterate over all normal moves
              for (let move of normalMoves) {
                console.log('3333Checking move:', move);
          
                // Simulate the move
                const simulatedGameState = simulateMove(gameState, piece, move); // replace with actual function
                console.log('3333Simulated game state:', simulatedGameState);
                // If the move would result in the player being able to move out of check, return false
                let checkPosition, matchFoundInDirection;
                const {isKingInCheck} = isCheckOpponent(simulatedGameState, gameState.threateningPiecesPositions[opponentColor], opponentPlayerNumber, checkPosition, piece, piece.position, playerNumber, lastDragOverPosition.current, matchFoundInDirection, currentPlayerColor)
                console.log('3333Is king in check:', isKingInCheck);
                
                if (!isKingInCheck) { // replace with actual function
                  console.log('3333Move out of check found, not a checkmate', simulatedGameState, move);
                  return false;
                }
              }
            }
          
            // If no piece can move out of check, the player is in checkmate
            console.log('3333No move out of check found, it is a checkmate');
            return true;
          }
        const updateBoard = (gameState, x, y, piece) => {
            console.log('761updateBoard', x, y, piece, gameState.board[x][y]);
            gameState.board[x][y].type = piece.type;
            gameState.board[x][y].color = piece.color;
            gameState.board[x][y].hasMoved = piece.hasMoved;
            gameState.board[x][y].position = piece.position;
            gameState.board[x][y].isHighlighted = false;
            gameState.board[x][y].index = piece.index;
            piece.hasMoved = true;
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
                pieceToUpdate.position = lastDragOverPosition.current;
                pieceToUpdate.hasMoved = true;
                pieceToUpdate.hasMovedTwo && (pieceToUpdate.hasMovedTwo = true);
                pieceToUpdate.color = piece.color;
                const pieceIndex = pieceToUpdate.index;
                gameState.piecePositions[currentPlayerColor][pieceIndex] = pieceToUpdate;
                console.log('866pieceToUpdate', pieceToUpdate, gameState.piecePositions[currentPlayerColor]);
            }
            //Update check status
            if (isKingInCheck && gameState.checkStatus[currentPlayerColor] === true) {
                console.log('761isKingInCheck', isKingInCheck, opponentColor, gameState);
                gameState.checkStatus[opponentColor] = true;
                gameState.checkStatus.direction = checkDirection;
            }
        }
        
        const castlingDirection = piece.type === 'king' && toY - fromY === 2 ? 1 : -1;

        const handleCastling = (gameState, toX, toY, piece, castlingDirection) => {
            gameState.board[fromX][fromY].color = currentPlayerColor;
            gameState.board[fromX][fromY].type = 'rook';
            gameState.board[fromX][fromY].hasMoved = true;
            gameState.board[fromX][fromY].position = piece.position;

            gameState.board[toX][toY].color = currentPlayerColor;
            gameState.board[toX][toY].type = 'king';
            gameState.board[toX][toY].hasMoved = true;
            gameState.board[toX][toY].position = [toX, toY];

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
            const isStartPosEqual = move.every((value, index) => value === startPosition.current[index]);
            const isLastDragPosEqual = move.every((value, index) => value === lastDragOverPosition.current[index]);
            return isStartPosEqual || isLastDragPosEqual;
        });
        console.log('isPieceValidMove', isPieceValidMove);
        if (!isPieceValidMove || turnState !== playerNumber) {
            return;
        }
        
        console.log('761threateningSquares', threateningSquares, gameState);
        gameState.threateningPiecesPositions[currentPlayerColor] = calculateThreateningSquares(gameState, currentPlayerColor, piece, lastDragOverPosition.current);
        const didKingCastle = piece.type === 'king' && Math.abs(toY - fromY) === 2;
        
        console.log('isPieceValidMove', isPieceValidMove, gameState, castlingDirection)
        //This if Statement handles moving out of check
        // FIX: this needs to be converted to function probably and probably duplicated and edited to 
        //handle move out of check in the checkMate
        if (isPieceValidMove) {
            const tempGameState = JSON.parse(JSON.stringify(gameState));
            tempGameState.board[toX][toY] = piece;
            tempGameState.board[fromX][fromY] = { type: 'empty', color: 'none', hasMoved: false, isHighlighted: false };
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
            if (piece.type === 'pawn' && Math.abs(toX - fromX) === 2) {
                piece.hasMovedTwo = true;
                console.log('847piece.hasMovedTwo', piece.hasMovedTwo, piece);
            }
            const enPassantDirection = piece.color === 'white' ? -1 : 1;
            //Check if lastDragOverPosition is equal to the enPassantMove if it is then update the board to remove the piece that was taken
            if (enPassantMove && lastDragOverPosition.current[0] === enPassantMove[0] && lastDragOverPosition.current[1] === enPassantMove[1]) {
                updateBoard(gameState, lastDragOverPosition.current[0] - enPassantDirection, lastDragOverPosition.current[1], {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false});
            }
            
            updateBoard(gameState, fromX, fromY, {type: 'empty', color: 'none', hasMoved: false, isHighlighted: false});
            console.log('847 gameState updated', gameState);  
            
            console.log('847canCastle', canCastle, piece.type, castlingDirection, piece.hasMoved, piece);
            if (piece.type === 'king' && canCastle) {
                console.log('847Castling king:', currentPlayerColor, toX, toY);
                handleCastling(gameState, toX, toY, piece, castlingDirection);
            }

            piece.hasMoved = true;
            console.log('847piece.hasMoved', piece.hasMoved, piece);
            updateBoard(gameState, toX, toY, piece);
            console.log('847 gameState updated', gameState);   
        }

        //maybe should use gameState instead of newGameState because the emit is sending gameState
        
        if (piece.type === 'king') {
            console.log('556Moving king:', currentPlayerColor, toX, toY);
            gameState.kingPositions[currentPlayerColor] = [toX, toY];
            gameState.turn = gameState.history.length % 2 === 0 ? 'black' : 'white';
            console.log('556gameState', gameState);
        }


        gameState.history.push({
            piece: { ...piece, hasMoved: true },
            from: [fromX, fromY],
            to: [toX, toY],
            board: JSON.parse(JSON.stringify(gameState.board)),
            turnNumber: gameState.history.length,
            turn: currentPlayerColor,
        });

        if (currentPlayerColor && (currentPlayerColor[0] === toX && currentPlayerColor[1] === toY) || isKingInCheckMate) {
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
      
    const { gameOver, playerNumber, turnState, winner, checkmateResult, setCheckmateResult, setGameState, setTurnState, setWinner, setGameOver, 
        setIsPlayerInCheck } = props;
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
    }, [gameState, turnState, handleDrop]);

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
    }, []);
    //render
    console.log('loser', loser)
    console.log('turnState2', turnState)
    gameState.turn = turnState === 1 ? 'black' : 'white';
    console.log('761props.gameState', props.gameState)
    return (
        <div>
            <h1>Chess Game</h1>
            <h2>Room Code: {roomCode}</h2>
            <h2>{playerNumber === turnState ? "Your Turn" : "Opponent's Turn"}</h2>

            {gameOver && <GameOver setGameState={setGameState} setTurnState={setTurnState} setWinner={setWinner} gameState={gameState} winner={winner} />}
            <BoardButtons setTurnState={setTurnState} setWinner={setWinner} setGameState={setGameState} gameState={gameState} />
            <Board setTurnState={setTurnState} setWinner={setWinner} gameState={props.gameState} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} />
        </div>
    );
}
export default Chess;