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
import calculateThreateningSquares from './gameLogic/calculateThreateningSquares';

const socket = io('http://localhost:3004');

let index = 0;

const createPiece = (type: string, color: string, position: Position, index: number) => ({ type, color, position, hasMoved: false, isHighlighted: false, index });
const createPawn = (color: string, position: Position, index: number) => ({ type: 'pawn', color, position, hasMoved: false, isHighlighted: false, index });

const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];



const testBoard: GameStateType = {
    board: [
        majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
        Array(8).fill(null).map((_, i) => ({ type: 'empty', color: 'none', position: [1, i], hasMoved: false, isHighlighted: false, index: index++ })),
        ...Array(4).fill(null).map((_, rowIndex) =>
            Array(8).fill(null).map((_, colIndex) => ({ type: 'empty', color: 'none', position: [2 + rowIndex, colIndex], hasMoved: false, isHighlighted: false, index: index++ }))
        ),
        Array(8).fill(null).map((_, i) => ({ type: 'empty', color: 'none', position: [6, i], hasMoved: false, isHighlighted: false, index: index++ })),
        majorPieces.map((type, i) => i === 4 ? createPiece('king', 'white', [7, 4], index++) : { type: 'empty', color: 'none', position: [7, i], hasMoved: false, isHighlighted: false, index: index++ }),
    ],
    history: [],
    turn: 'black',
    kingPositions: {black: [0, 4], white: [7, 4]}, 
    threateningPiecesPositions: {
         black: [],
         white: [],
     },
};


// const initialBoard: GameStateType = {
//     board: [
//         majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
//         Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
//         ...Array(4).fill(null).map(() =>
//             Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: index++ }))
//         ),
//         Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], index++)),
//         majorPieces.map((type, i) => createPiece(type, 'white', [7, i], index++)),
//     ],
//     history: [],
//     turn: 'black',
//     kingPositions: { black: [0, 4], white: [7, 4] },
//     threateningPiecesPositions: {
//         black: [[0, 1], [0, 6], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7]],
//         white: [[7, 1], [7, 6], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]],
//     },
// };






// const initialBoard: GameStateType = {
//     board: [
//         majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
//         Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
//         ...Array(4).fill(null).map(() =>
//             Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, isHighlighted: false, index: index++ }))
//         ),
//         Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], index++)),
//         majorPieces.map((type, i) => createPiece(type, 'white', [7, i], index++)),
//     ],
//     history: [],
//     turn: 'black',
//     kingPositions: {black: [0, 4], white: [7, 4]}, 
//     threateningPiecesPositions: {
//          black: [[0, 1], [0, 6], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7]],
//          white: [[7, 1], [7, 6], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]],
//      },

// };


function App() {
    const [playerNumber, setPlayerNumber] = useState<number>(0);
    const [gameOver, setGameOver] = useState(false);
    const [turnState, setTurnState] = useState<0 | 1 | 2>(1);
    const [gameState, setGameState] = useState<GameStateType>(testBoard);
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
            //arg.turn === 1 ? arg.turn = 'black' : arg.turn = 'white'; 
            console.log('gameState', arg)
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
            console.log('turnState', turnState)
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

