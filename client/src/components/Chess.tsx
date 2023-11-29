//TODO: 
// in separate files create a function for each piece that will  
//take in piece and board info and return a list of valid moves
//take in piece and board info and perform move logic for corresponding piece in switch statement
//take in piece and board info and perform check logic
//take in piece and board info and perform checkmate logic
//take in piece board and info and perform en passant logic
//take in piece board and info and perform castling logic
import { useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import isCheck from '../gameLogic/isCheck'
import isCheckmate from '../gameLogic/isCheckmate'
import validMoves from '../gameLogic/validMoves'
import isDraw from '../gameLogic/isDraw'
import Board from './Board';
import GameOver from './GameOver';
// import BoardTimer from './BoardTimer';
import { Props, Position, Piece, Move } from '../types/clientTypes';



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

    //handleDragStart
    // when a piece has been selected to be dragged it need to pull the 
    //color and piece from the tile
    //with color x coordinate and y coordinate value of board square
    //in the gameState array
    // based off the color it determines move direction
    // based off piece it determines valid moves
    //those valid moves are pulled from a list of valid moves based on each piece
    // based off the piece a switch statement will be used to determine the valid coordinates
    //the selected piece can move to
    const handleDragStart = (
        event: React.DragEvent, 
        piece: Piece, 
        position: Position, 
        setHighlightedTiles: (tiles: Position[]) => void, 
        props: Props
      ) => {
        event.dataTransfer.setData('piece', JSON.stringify({ piece, position }));
        event.dataTransfer.setData('source', JSON.stringify(position));
        const pieceValidMoves: Move[] = validMoves(piece, position, props.gameState, props.playerNumber);
        const positions: Position[] = pieceValidMoves.map(move => move.to);
        setHighlightedTiles(positions);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position) => {
        event.preventDefault();
        event.dataTransfer.setData('target', JSON.stringify(position));
    }


    // handleDrop needs to check if move is valid
    //call move piece function if move is valid
    //update the gameState array with new variable if move is valid
    //and set the tile piece was dragged from to null if move is valid
    //emit the the new gameState array to the server and 
    //emit the playerTurn state to the server
    //if move is invalid set piece back to original tile 
    //pass handleDrop event to the piece component
    const handleDrop = (event: React.DragEvent, props: Props) => {
        const piece = JSON.parse(event.dataTransfer.getData('piece'));
        const target = JSON.parse(event.dataTransfer.getData('target'));
        const pieceValidMoves = validMoves(piece, piece.position, props.gameState, props.playerNumber);
        if (pieceValidMoves.includes(target.join(',')) && props.turnState === props.playerNumber) {
            const newGameState = { ...props.gameState };
            const { position: [fromX, fromY] } = piece;
            const [toX, toY] = target;
            newGameState.board[fromY][fromX] = null;
            newGameState.board[toY][toX] = piece;
            newGameState.history.push({ 
                piece, 
                from: [fromX, fromY], 
                to: [toX, toY], 
                board: JSON.parse(JSON.stringify(newGameState.board)),
                turnNumber: newGameState.history.length,
                turn: props.turnState === 2 ? 'white' : 'black'
            });
            props.setHighlightedTiles([]);
            props.setGameState(newGameState);
            const opponentKing = newGameState.board.flat().find(piece => piece && piece.type === 'king' && piece.color !== (props.playerNumber === 1 ? 'white' : 'black'));            props.setGameState(newGameState);
            if (opponentKing && opponentKing.position.join(',') === target.join(',') || isCheck(newGameState, props.playerNumber)) {
                props.setGameOver(true);
                if (socket) {
                    socket.emit('gameOver', true);
                }

            }
            if (socket) {
                socket.emit('gameState', newGameState);
            }
            if (socket) {
                socket.emit('turn', props.turnState === 1 ? 2 : 1);
            }
        }
    };
    
    //useEffect hooks to update the gameState/board, gameOver/winner, check, 
    //checkmate, stalemate, draw, and playerTurn
    //the useEffects are loops for check and checkmate
    const { gameState, gameOver, playerNumber, turnState, setGameState, setTurnState, setWinner, setGameOver, setIsPlayerInCheck } = props;

    useEffect(() => {
        const newGameState = { ...gameState };
        setGameState(newGameState);
    }, [gameState, setGameState]);

    useEffect(() => {
        // Check for game over and winner
        if (gameOver || isCheckmate(gameState, playerNumber)) {
            setTurnState(0);
            setWinner(turnState === 1 ? 'Black' : 'White')
        }
    }, [gameState, gameOver, playerNumber, turnState, setTurnState, setWinner]);

    // Check for check and checkmate
    useEffect(() => {
        // Code to check if the current player is in check or checkmate
        if (isCheck(gameState, playerNumber)) {
            setIsPlayerInCheck(true);
        }
    }, [gameState, playerNumber, setIsPlayerInCheck]);

    // Check for stalemate and draw
    useEffect(() => {
        if (isDraw(gameState, playerNumber)) {
            setGameOver(true);
            setWinner('Draw');
            setTurnState(0);
        }
    }, [gameState, playerNumber, setGameOver, setWinner, setTurnState]);
    //render
    return (
        <div>
            <h1>Chess Game</h1>
            <h2>Room Code: {roomCode}</h2>
            <h2>{playerNumber === turnState ? "Your Turn" : "Opponent's Turn"}</h2>
            
            {gameOver && <GameOver gameState={gameState} winner={props.winner} />}
            
            <Board gameState={gameState} highlightedTiles={props.highlightedTiles} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDrop={handleDrop} />
            {/* <BoardTimer playerNumber={props.playerNumber} playerTurn={props.playerTurn} initialTime={props.initialTime}/> */}
        </div>
    );
}
export default Chess;