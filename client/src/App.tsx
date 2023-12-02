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


import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { Props, GameStateType, Position, HighlightedTile } from './types/clientTypes';

const socket = io('http://localhost:3004');

let index = 0;

const createPiece = (type: string, color: string, position: Position, index: number) => ({ type, color, position, hasMoved: false, isHighlighted: false, index });
const createPawn = (color: string, position: Position, index: number) => ({ type: 'pawn', color, position, hasMoved: false, isHighlighted: false, index });
const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

const initialBoard: GameStateType = {
    board: [
        majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
        Array(8).fill(null).map((_, i) => createPawn('black', [1, i], index++)),
        ...Array(4).fill(null).map((_, rowIndex) =>
            Array(8).fill(null).map((_, colIndex) => ({
                type: 'empty',
                color: 'none',
                position: [2 + rowIndex, colIndex],
                hasMoved: false,
                isHighlighted: false,
                index: index++
            }))
        ),
        Array(8).fill(null).map((_, i) => createPawn('white', [6, i], index++)),
        majorPieces.map((type, i) => createPiece(type, 'white', [7, i], index++)),
    ],
    history: [],
    turn: 'black',
};

function App() {
    const [playerNumber, setPlayerNumber] = useState<number>(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameState, setGameState] = useState<GameStateType>(initialBoard);
    const [turnState, setTurnState] = useState<0 | 1 | 2>(1);
    const [highlightedTiles, setHighlightedTiles] = useState<HighlightedTile[]>([]);
    const [winner, setWinner] = useState<string | null>(null);
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
        socket.on('leaveRoom', (roomId) => {
            setGameOver(true);
            setWinner(null);
            console.log(`Left room ${roomId}`);
        });

        return () => {
            socket.off('leaveRoom');
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
        const handleGameState = (arg:React.SetStateAction<GameStateType>) => {
            setGameState(arg);
        }

        socket.on('gameState', handleGameState);

        return () => {
            socket.off('gameState', handleGameState)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleGameOver = (arg: React.SetStateAction<boolean>) => {
            setGameOver(arg);
        }

        socket.on("gameOver", handleGameOver);


        return () => {
            socket.off("gameOver", handleGameOver)
        }
    }, []);

    useEffect(() => {
        const turnStateChange = (arg:React.SetStateAction< 0| 1 | 2 >) => {
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

    const chessProps: Props = {
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
        handleReset,
    };

    return (
        <SocketContext.Provider value={socket}>
            <Router>
                <Routes>
                    <Route path="/lobby?/:username?" element={<Lobby />} />
                    <Route path="/game/:roomCode" element={<Chess {...chessProps} />} />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;

