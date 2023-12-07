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

const Chess: React.FC<Props> = (props) => {
    const { roomCode } = useParams();
    console.log('roomCode', roomCode);
    const socket = useContext(SocketContext);
    const lastDragOverPosition = useRef<Position | null>(null);
    const startPosition = useRef<Position | null>(null);
    const { isKingInCheck, isKingInCheckMate, loser } = isCheck(props.gameState, props.playerNumber);

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
        console.log('Startpiece', piece.color);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, position: Position | []) => {
        event.preventDefault();
        console.log('handleDragOver');
        lastDragOverPosition.current = position;

        
        console.log('DragOverPosition', position);
    };
    
    const handleDrop = (event: React.DragEvent, props: HandleDropProps) => {
        event.preventDefault();
    
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
        
        const updateBoard = (newGameState, x, y, piece) => {
            newGameState.board[x][y].color = piece.color;
            newGameState.board[x][y].type = piece.type;
            newGameState.board[x][y].hasMoved = true;
        }
        
        const handleEnPassant = (newGameState, toX, toY) => {
            newGameState.board[toX - 1][toY].color = 'none';
            newGameState.board[toX - 1][toY].type = 'empty';
        }
        
        const handleCastling = (newGameState, toX, toY, piece, castlingDirection) => {
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

        if (!piece || piece.type === 'empty') {
            console.error('No piece');
            return;
        }
        
        const pieceValidMoves = validMoves(piece, startPosition.current, gameState, playerNumber);
        const isPieceValidMove = pieceValidMoves && pieceValidMoves.some(move => { 
            const isStartPosEqual = move.every((value, index) => value === startPosition.current[index]);
            const isLastDragPosEqual = move.every((value, index) => value === lastDragOverPosition.current[index]);
            return isStartPosEqual || isLastDragPosEqual;
        });
        
        if (!isPieceValidMove || turnState !== playerNumber) {
            return;
        }
        
        const newGameState = { ...gameState };
        const [fromX, fromY] = piece.position;
        const [toX, toY] = lastDragOverPosition.current;
        const didMoveDiagonally = Math.abs(toX - fromX) === 1 && Math.abs(toY - fromY) === 1;
        const didKingCastle = piece.type === 'king' && Math.abs(toY - fromY) === 2;
        const castlingDirection = piece.type === 'king' && toY - fromY === 2 ? 1 : -1;
        
        updateBoard(newGameState, fromX, fromY, {type: 'empty', color: 'empty'});
        
        if (piece.type === 'pawn' && newGameState.board[toX][toY].type === 'empty' && didMoveDiagonally) {
            handleEnPassant(newGameState, toX, toY);
        }
        
        if (piece.type === 'king' && didKingCastle) {
            handleCastling(newGameState, toX, toY, piece, castlingDirection);
        }
        
        updateBoard(newGameState, toX, toY, piece);
        
        newGameState.history.push({ 
            piece: {...piece, hasMoved: true}, 
            from: [fromX, fromY], 
            to: [toX, toY], 
            board: JSON.parse(JSON.stringify(newGameState.board)),
            turnNumber: newGameState.history.length,
            turn: turnState === 2 ? 'white' : 'black'
        });
        
        setGameState(newGameState);
        
        const opponentKing = newGameState.board.flat().find(piece => piece && piece.type === 'king' && piece.color !== (playerNumber === 1 ? 'black' : 'white'));            
        
        if (opponentKing && (opponentKing.position[0] === toX && opponentKing.position[1] === toY) || isKingInCheckMate) {
            setGameOver(true);
            if (socket) {
              socket.emit('gameOver', true, isKingInCheckMate ? loser : null, roomCode);
            }
        }
        
        if (socket) {
            socket.emit('gameState', newGameState, roomCode);
            socket.emit('turn', turnState === 1 ? 2 : 1, roomCode);
            setTurnState(turnState === 1 ? 2 : 1);
        }
    }
    

    const { gameState, gameOver, playerNumber, turnState, winner, checkmateResult, setCheckmateResult, setGameState, setTurnState, setWinner, setGameOver, setIsPlayerInCheck } = props;
    
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
        </div>
    );
}
export default Chess;