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

interface HandleDropProps {
    gameState: GameState;
    playerNumber: number;
    turnState: number;
    setHighlightedTiles: (tiles: Position[]) => void;
    setGameState: (gameState: GameState) => void;
    setGameOver: (gameOver: boolean) => void;
}


//turnState should be a number either 0 1 2
//turn should correspond to selection made in overlay at 
//beginning of game, player1 turn, 
//player2 turn, and end of game
//a div overlaying the board will display
//this overlay contains countdown/blitz timer option selection
//this selection is a timer with increase and decrease buttons above
//and below number of hours minutes and seconds store this variable in state
//and pass it to the timer component
//pass playerNumber and playerTurn to the board and Timer component

const Chess: React.FC<Props> = (props) => {
    const { roomCode } = useParams();
    console.log('roomCode', roomCode);
    const socket = useContext(SocketContext);

    //handle drag event needs to take in player number
    // this number will be decided based off of a button click from


    //useful to have 3 separate functions to make
    // the drag event work
    // handleDragStart store the initial piece
    //and the initial tile it was dragged from
    // handleDragOver prevent draggable default behavior
    // handleDrop store targeted tile, update gameState
    //and emit to server

    const lastDragOverPosition = useRef<Position | null>(null);
    const startPosition = useRef<Position | null>(null);
    const { isKingInCheck, isKingInCheckMate, loser } = isCheck(props.gameState);

    //let dragOverPiece;
    const handleDragStart = (event: React.DragEvent, piece, position: Position) => {
        console.log('handleDragStart');
        console.log('turnState', turnState, 'playerNumber', playerNumber)
        if (piece.color !== (playerNumber === 1 ? 'black' : 'white')) {
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
        console.log('Startpiece', piece);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position | []) => {
        event.preventDefault();
        console.log('handleDragOver');
        lastDragOverPosition.current = position;

        
        console.log('DragOverPosition', position);
    };
    
    const handleDrop = (event: React.DragEvent, props: HandleDropProps) => {
        event.preventDefault();
        console.log('handleDrop');

        const pieceData = event.dataTransfer.getData('piece');
        if (!pieceData) {
            console.error('No piece data');
            return;
        }
    
        let piece: Piece;
        try {
            piece = JSON.parse(pieceData);
        } catch (error) {
            console.error('Invalid JSON string:', error);
            return;
        }
        
        console.log('piece!!', piece);
        console.log('Endposition', lastDragOverPosition.current); 
    
        let pieceValidMoves;
        if (piece && piece.type !== 'empty') {
             pieceValidMoves = validMoves(piece, startPosition.current, gameState, playerNumber);
             console.log('validMovesInputCheck', piece , startPosition.current, gameState, playerNumber )
             console.log('pieceValidMoves', pieceValidMoves);
             console.log('lastDragOverPosition', lastDragOverPosition); 
        }
        const isPieceValidMove = pieceValidMoves && pieceValidMoves.some(move => { 
            console.log('move!', move);
            console.log('startPosition.current!', startPosition.current);
            console.log('lastDragOverPosition.current!', lastDragOverPosition.current);
            const isStartPosEqual = move.every((value, index) => value === startPosition.current[index]);
            const isLastDragPosEqual = move.every((value, index) => value === lastDragOverPosition.current[index]);
            console.log('isStartPosEqual!', isStartPosEqual);
            console.log('isLastDragPosEqual!', isLastDragPosEqual);
            return isStartPosEqual || isLastDragPosEqual;
        })
        console.log('isPieceValidMove', isPieceValidMove);
        console.log('move.to', lastDragOverPosition.current)
        console.log('move.from', startPosition.current)
        console.log('turnState', turnState, 'playerNumber', playerNumber)
        if (isPieceValidMove && turnState === playerNumber) {
            console.log('valid move for the piece!!');
            console.log('piece', piece);
            console.log('gameState', gameState);
            const newGameState = { ...gameState };
            const [fromX, fromY] = piece.position;
            const [toX, toY] = lastDragOverPosition.current;
            const didMoveDiagonally = Math.abs(toX - fromX) === 1 && Math.abs(toY - fromY) === 1;
            const didKingCastle = piece.type === 'king' && Math.abs(toY - fromY) === 2;
            const castlingDirection = piece.type === 'king' && toY - fromY === 2 ? 1 : -1;
            newGameState.board[fromX][fromY].type = 'empty';
            newGameState.board[fromX][fromY].color = 'empty';
            console.log('toX!!!', toX);
            console.log('toY!!!', toY);
            const isUpdatedSquare = newGameState.board[toX][toY].position.every((value, index) => value === lastDragOverPosition.current[index]) ;
            console.log('toXAgain!!!', toX);
            console.log('isUpdatedSquare!', isUpdatedSquare);
            console.log('newGameState.board[toX][toY].position!', newGameState.board[toX][toY].position);
            console.log('newGameState.board[toX]!', newGameState.board[toX]);
            console.log('newGameState.board[toX][toY]!', newGameState.board[toX][toY]);
            console.log('enpassantCheck0', piece.type, newGameState.board[toX][toY].type , !isUpdatedSquare , didMoveDiagonally);
            
            if ( piece.type === 'pawn' && newGameState.board[toX][toY].type === 'empty' && didMoveDiagonally) {
                console.log('enPassant0');
                console.log('lastDragOverPosition.current[1]!', lastDragOverPosition.current[1]);
                console.log('startPosition.current[1]!', startPosition.current[1]);
                console.log('lastDragOverPosition.current[0]!', lastDragOverPosition.current[0]);
                console.log('startPosition.current[0]!', startPosition.current[0]);
                console.log('newGameState.board[lastDragOverPosition.current[0]][lastDragOverPosition.current[1]]!', newGameState.board[lastDragOverPosition.current[0]][lastDragOverPosition.current[1]]);
                newGameState.board[toX - 1][toY].color = 'none';
                newGameState.board[toX - 1][toY].type = 'empty';   
            }
            if (piece.type === 'king' && didKingCastle) {
                console.log('castle0');
                newGameState.board[toX][toY - castlingDirection].color = piece.color;
                newGameState.board[toX][toY - castlingDirection].type = 'rook';
                newGameState.board[toX][toY - castlingDirection].hasMoved = true;
                newGameState.board[toX][toY - castlingDirection].position = [toX, toY - castlingDirection];
                if (castlingDirection === 1) { // King-side castling
                    newGameState.board[toX][toY + castlingDirection].color = 'none';
                    newGameState.board[toX][toY + castlingDirection].type = 'empty';
                } else { // Queen-side castling
                    newGameState.board[toX][toY + 2*castlingDirection].color = 'none';
                    newGameState.board[toX][toY + 2*castlingDirection].type = 'empty';
                }
            }
            if ( piece && piece.type !== 'empty') {
                console.log('piece', piece);
                console.log('newGameState.board!', newGameState.board);
                console.log('toX!!', toX);
                newGameState.board[toX][toY].color = piece.color;
                newGameState.board[toX][toY].type = piece.type;
                newGameState.board[toX][toY].hasMoved = true;
                console.log('newGameState.board[toX][toY]', newGameState.board[toX][toY]);
            }
            console.log('newGameState.board[toX][toY].position', newGameState.board[toX][toY].position);
            newGameState.history.push({ 
                piece: {...piece, hasMoved: true}, 
                from: [fromX, fromY], 
                to: [toX, toY], 
                board: JSON.parse(JSON.stringify(newGameState.board)),
                turnNumber: newGameState.history.length,
                turn: turnState === 2 ? 'white' : 'black'
            });
            //setHighlightedTiles([]);
            setGameState(newGameState);
            const opponentKing = newGameState.board.flat().find(piece => piece && piece.type === 'king' && piece.color !== (playerNumber === 1 ? 'black' : 'white'));            

            setGameState(newGameState);
            setWinner(loser);
            console.log('77opponentKing.position[0] === toX && opponentKing.position[1] === toY', opponentKing.position[0] === toX && opponentKing.position[1] === toY)
            if (opponentKing && (opponentKing.position[0] === toX && opponentKing.position[1] === toY) || isKingInCheckMate) {
                console.log('King captured')
                setGameOver(true);
                if (socket) {
                  socket.emit('gameOver', true, isKingInCheckMate ? loser : null, roomCode);
                }
            }
            if (socket) {
                socket.emit('gameState', newGameState, roomCode);
            }
            if (socket) {
                socket.emit('turn', turnState === 1 ? 2 : 1, roomCode);
                setTurnState(turnState === 1 ? 2 : 1);
            }
            console.log('turnStateUpdate', turnState, 'playerNumber', playerNumber)
        }
    };
    
    //useEffect hooks to update the gameState/board, gameOver/winner, check, 
    //checkmate, stalemate, draw, and playerTurn
    //the useEffects are loops for check and checkmate
    const { gameState, gameOver, playerNumber, turnState, winner, checkmateResult, setCheckmateResult, setGameState, setTurnState, setWinner, setGameOver, setIsPlayerInCheck } = props;
    //const { isInCheckmate, loser } = isCheckmate(gameState, turnState);
    //Replace this with the output from isCheck
    console.log('gameState0', gameState);
    console.log('gameOver0', gameOver);
    console.log('playerNumber0', playerNumber);
    console.log('loser0', loser)
    console.log('winner', winner);
    console.log('isInCheckmate0', isKingInCheckMate);
    console.log('loser0', loser);
    useEffect(() => {
        const newGameState = { ...gameState };
        setGameState(newGameState);
    }, [setGameState]);

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
        // Code to check if the current player is in check
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
    //render
    console.log('loser', loser)
    return (
        <div>
            <h1>Chess Game</h1>
            <h2>Room Code: {roomCode}</h2>
            <h2>{playerNumber === turnState ? "Your Turn" : "Opponent's Turn"}</h2>
            
            {gameOver && <GameOver gameState={gameState} winner={winner} />}
            
            <Board gameState={gameState} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} />
            {/* <BoardTimer playerNumber={props.playerNumber} playerTurn={props.playerTurn} initialTime={props.initialTime}/> */}
        </div>
    );
}
export default Chess;