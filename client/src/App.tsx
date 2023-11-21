//TODO:
//Create Socket event listeners for the following events:
//connect
//disconnect
//join room
//create room
//leave room connected to exit button on BoardButtons.tsx
//connection error
//player number
//turn state
//game state
//game over
//reset and emitter so both players can reset the game


//Render routes
//wrap routes in socket provider
//route for lobby
//route for game

type GameStateType = {
    board: Piece[][];
    history: Move[];
};

const initialBoard: GameStateType = {
    board: [
        majorPieces.map(type => createPiece(type, 'black')),
        Array(8).fill(createPawn('black')),
        ...Array(4).fill(Array(8).fill(null)),
        Array(8).fill(createPawn('white')),
        majorPieces.map(type => createPiece(type, 'white')),
    ],
    history: [],
};

import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { GameStateType } from './types/clientTypes';

const socket = io('http://localhost:3002');

const createPiece = (type, color) => ({ type, color, hasMoved: false, isHighlighted: false });
const createPawn = color => ({ type: 'pawn', color, hasMoved: false, isHighlighted: false });
const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

const initialBoard: GameStateType = {
    board: [
        majorPieces.map(type => createPiece(type, 'black')),
        Array(8).fill(createPawn('black')),
        ...Array(4).fill(Array(8).fill(null)),
        Array(8).fill(createPawn('white')),
        majorPieces.map(type => createPiece(type, 'white')),
    ],
    history: [],
};

function App() {
    const [playerNumber, setPlayerNumber] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameState, setGameState] = useState<GameStateType>(initialBoard);
    const [turnState, setTurnState] = useState<number>(0);
    const [highlightedTiles, setHighlightedTiles] = useState<Array<number[]>>([]);
    const [winner, setWinner] = useState<number | null>(null);
    const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);

    useEffect(() => {
        socket.on('createRoom', (roomId) => {
            console.log(`Created room ${roomId}`);
        });

        return () => {
            socket.off('createRoom');
        }
    }, []);

    useEffect(() => {
        socket.on('joinRoom', (roomId) => {
            console.log(`Joined room ${roomId}`);
        });

        return () => {
            socket.off('joinRoom');
        };
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to the server');
        });

        socket.on('connect_error', (error: Error) => {
            console.error('Connection error:', error);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
        }
    }, []);

    useEffect(() => {
        socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
        });

        return () => {
            socket.off('disconnect');
        };
    }, []);

    useEffect(() => {
        socket.on('playerNumber', (number: number) => {
            setPlayerNumber(number);
        });

        return () => {
            socket.off('playerNumber');
        }
    }, []);

    useEffect(() => {
        //TODO: Add GameStateType that is a 2D array of strings representing the chess board
        const handleGameState = (arg: GameStateType) => {
            setGameState([...arg]);
        }

        socket.on('gameState', handleGameState);

        return () => {
            socket.off('gameState', handleGameState)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const gameOver = (arg: React.SetStateAction<boolean>) => {
            setGameOver(arg);
        }

        socket.on("gameOver", gameOver);


        return () => {
            socket.off("gameOver", gameOver)
        }
    }, []);

    useEffect(() => {
        const turnStateChange = (arg: boolean | ((prevState: boolean | null) => boolean | null) | null) => {
            setTurnState(arg);
        }

        socket.on('turn', turnStateChange);

        return () => {
            socket.off('turn', turnStateChange)
        }
    }, []);

    useEffect(() => {
        const handleResetEvent = () => {
            handleReset();
        };

        socket.on('reset', handleResetEvent);

        return () => {
            socket.off('reset', handleResetEvent);
        };
    });

    const handleReset = () => {
        if (gameOver) {
            socket.emit('reset');
        }
        resetGame();
    };

    const resetGame = () => {
        setGameState(initialBoard);
        setGameOver(false);
    };

    const chessProps = {
        playerNumber,
        gameOver,
        gameState,
        turnState,
        highlightedTiles,
        winner,
        isPlayerInCheck,
        setPlayerNumber,
        setGameState,
        setGameOver,
        setTurnState,
        setHighlightedTiles,
        setWinner,
        setIsPlayerInCheck,
    };

    return (
        <SocketContext.Provider value={socket}>
            <Router>
                <Routes>
                    <Route path="/" element={<Lobby />} />
                    <Route path="/game/:roomCode" element={<Chess {...chessProps} />} />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;

