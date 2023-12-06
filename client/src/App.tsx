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
//Render ro


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
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null).map((_, i) => i === 5 ? createPiece('king', 'white', [6, i], index++) : null),
        Array(8).fill(null).map((_, i) => i === 0 || i === 7 ? createPiece('rook', 'black', [7, i], index++) : null),
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
    const [checkmateResult, setCheckmateResult] = useState<{ isInCheckmate: boolean, loser: string | null }>({ isInCheckmate: false, loser: null });

    useEffect(() => {
        socket.on('createRoom', (roomId) => {
            console.log(`Socket Created room ${roomId}`);
        });

        return () => {
            socket.off('createRoom');
        }
    }, []);

    useEffect(() => {
        socket.on('joinRoom', (roomId) => {
            console.log(`Socket Joined room ${roomId}`);
        });

        return () => {
            socket.off('joinRoom');
        };
    }, []);

    useEffect(() => {
        socket.on('leaveRoom', (roomId) => {
            //setGameOver(true);
            setWinner(null);
            console.log(`Socket Left room ${roomId}`);
        });

        return () => {
            socket.off('leaveRoom');
        };
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket Connected to the server');
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
        socket.on('Socket disconnect', (reason) => {
            console.log('Disconnected:', reason);
        });

        return () => {
            socket.off('disconnect');
        };
    }, []);

    useEffect(() => {
        socket.on('playerNumber', (number: number) => {
            console.log(`Socket Player number: ${number}`);
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
        const handleGameOver = (arg: { isGameOver: boolean, winner: string | null }) => {
            console.log('gameOver00', arg)
            setGameOver(arg.isGameOver);
            setWinner(arg.winner);
        }
        console.log('winner', winner)
        socket.on("gameOver", handleGameOver);
    
        return () => {
            socket.off("gameOver", handleGameOver)
        }
    }, []);

    useEffect(() => {
        const turnStateChange = (arg:React.SetStateAction< 0| 1 | 2 >) => {
            setTurnState(arg);
            console.log(`Socket Turn state: ${arg}`);
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
        checkmateResult,
        setCheckmateResult,
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

