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
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { Props, GameStateType, Position, HighlightedTile } from './types/clientTypes';
import calculateThreateningSquares from './gameLogic/calculateThreateningSquares';

const socket = io('http://localhost:3004');

let index = 0;
let whitePawnIndex = 24;
let whiteMajorIndex = 16;

const createPiece = (type: string, color: string, position: Position, index: number) => ({ type, color, position, hasMoved: false, isHighlighted: false, index });
const createPawn = (color: string, position: Position, index: number) => ({ type: 'pawn', color, position, hasMoved: false, isHighlighted: false, index });

const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];



// const testBoard: GameStateType = {
//     board: [
//         majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
//         Array(8).fill(null).map((_, i) => ({ type: 'empty', color: 'none', position: [1, i], hasMoved: false, isHighlighted: false, index: index++ })),
//         ...Array(4).fill(null).map((_, rowIndex) =>
//             Array(8).fill(null).map((_, colIndex) => ({ type: 'empty', color: 'none', position: [2 + rowIndex, colIndex], hasMoved: false, isHighlighted: false, index: index++ }))
//         ),
//         Array(8).fill(null).map((_, i) => ({ type: 'empty', color: 'none', position: [6, i], hasMoved: false, isHighlighted: false, index: index++ })),
//         majorPieces.map((type, i) => i === 4 ? createPiece('king', 'white', [7, 4], index++) : { type: 'empty', color: 'none', position: [7, i], hasMoved: false, isHighlighted: false, index: index++ }),
//     ],
//     history: [],
//     turn: 'black',
//     kingPositions: {black: [0, 4], white: [7, 4]}, 
//     threateningPiecesPositions: {
//          black: [],
//          white: [],
//      },
//      piecePositions: {
//         black: [
//             { id: 1, type: 'rook', position: [0, 0] },
//             { id: 2, type: 'knight', position: [0, 1] },
//             { id: 3, type: 'bishop', position: [0, 2] },
//             { id: 4, type: 'queen', position: [0, 3] },
//             { id: 5, type: 'king', position: [0, 4] },
//             { id: 6, type: 'bishop', position: [0, 5] },
//             { id: 7, type: 'knight', position: [0, 6] },
//             { id: 8, type: 'rook', position: [0, 7] },
//             { id: 9, type: 'pawn', position: [1, 0] },
//             { id: 10, type: 'pawn', position: [1, 1] },
//             { id: 11, type: 'pawn', position: [1, 2] },
//             { id: 12, type: 'pawn', position: [1, 3] },
//             { id: 13, type: 'pawn', position: [1, 4] },
//             { id: 14, type: 'pawn', position: [1, 5] },
//             { id: 15, type: 'pawn', position: [1, 6] },
//             { id: 16, type: 'pawn', position: [1, 7] },
//         ],
//         white: [
//             { id: 17, type: 'rook', position: [7, 0] },
//             { id: 18, type: 'knight', position: [7, 1] },
//             { id: 19, type: 'bishop', position: [7, 2] },
//             { id: 20, type: 'queen', position: [7, 3] },
//             { id: 21, type: 'king', position: [7, 4] },
//             { id: 22, type: 'bishop', position: [7, 5] },
//             { id: 23, type: 'knight', position: [7, 6] },
//             { id: 24, type: 'rook', position: [7, 7] },
//             { id: 25, type: 'pawn', position: [6, 0] },
//             { id: 26, type: 'pawn', position: [6, 1] },
//             { id: 27, type: 'pawn', position: [6, 2] },
//             { id: 28, type: 'pawn', position: [6, 3] },
//             { id: 29, type: 'pawn', position: [6, 4] },
//             { id: 30, type: 'pawn', position: [6, 5] },
//             { id: 31, type: 'pawn', position: [6, 6] },
//             { id: 32, type: 'pawn', position: [6, 7] },
//         ],
//     },
// };


const initialBoard: GameStateType = {
    board: [
        majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
        Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
        ...Array(4).fill(null).map(() =>
            Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, isHighlighted: false }))
        ),
        Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], whitePawnIndex++)),
        majorPieces.map((type, i) => createPiece(type, 'white', [7, i], whiteMajorIndex++)),
    ],
    history: [],
    turn: 'black',
    kingPositions: { black: [0, 4], white: [7, 4] },
    threateningPiecesPositions: {
        black: [
            // [0, -1] horizontal
            [[0, 3], [0, 2], [0, 1], [0, 0]],
            // [0, 1] horizontal
            [[0, 5], [0, 6], [0, 7]],
            // [-1, 0] vertical
            [],
            // [1, 0] vertical
            [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
            // [-1, -1] diagonal
            [],
            // [-1, 1] diagonal
            [],
            // [1, -1] diagonal
            [[1, 3], [2, 2], [3, 1], [4, 0]],
            // [1, 1] diagonal
            [[1, 5], [2, 6], [3, 7]],
            //knight moves
            // [-2, -1] knight vertical
            [],
            // [-2, 1] knight vertical
            [],
            // [2, -1] knight vertical
            [[2, 3]],
            // [2, 1] knight vertical
            [[2, 5]],
            // [-1, -2] knight horizontal
            [],
            // [-1, 2] knight horizontal
            [],
            // [1, -2] knight horizontal
            [[1, 2]],
            // [1, 2] knight horizontal
            [[1, 6]]
        ],
        white: [
            // [0, -1] horizontal
            [[7, 3], [7, 2], [7, 1], [7, 0]],
            // [0, 1] horizontal
            [[7, 5], [7, 6], [7, 7]],
            // [-1, 0] vertical
            [[6, 4], [5, 4], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
            // [1, 0] vertical
            [],
            // [-1, -1] diagonal
            [[6, 3], [5, 2], [4, 1], [3, 0]],
            // [-1, 1] diagonal
            [[6, 5], [5, 6], [4, 7]],
            // [1, -1] diagonal
            [],
            // [1, 1] diagonal
            [],
            // [-2, -1] knight vertical
            [[5, 3]],
            // [-2, 1] knight vertical
            [[5, 5]],
            // [2, -1] knight vertical
            [],
            // [2, 1] knight vertical
            [],
            // [-1, -2] knight horizontal
            [[6, 2]],
            // [-1, 2] knight horizontal
            [[6, 6]],
            // [1, -2] knight horizontal
            [],
            // [1, 2] knight horizontal
            []
        ]
    },
    piecePositions: {
        black: [
            { id: 0, type: 'rook', position: [0, 0], color: 'black' },
            { id: 1, type: 'knight', position: [0, 1], color: 'black' },
            { id: 2, type: 'bishop', position: [0, 2], color: 'black' },
            { id: 3, type: 'queen', position: [0, 3], color: 'black' },
            { id: 4, type: 'king', position: [0, 4], color: 'black' },
            { id: 5, type: 'bishop', position: [0, 5], color: 'black' },
            { id: 6, type: 'knight', position: [0, 6], color: 'black' },
            { id: 7, type: 'rook', position: [0, 7], color: 'black' },
            { id: 8, type: 'pawn', position: [1, 0], color: 'black' },
            { id: 9, type: 'pawn', position: [1, 1], color: 'black' },
            { id: 10, type: 'pawn', position: [1, 2], color: 'black' },
            { id: 11, type: 'pawn', position: [1, 3], color: 'black' },
            { id: 12, type: 'pawn', position: [1, 4], color: 'black' },
            { id: 13, type: 'pawn', position: [1, 5], color: 'black' },
            { id: 14, type: 'pawn', position: [1, 6], color: 'black' },
            { id: 15, type: 'pawn', position: [1, 7], color: 'black' },
        ],
        white: [
            { id: 16, type: 'rook', position: [7, 0], color: 'white' },
            { id: 17, type: 'knight', position: [7, 1], color: 'white' },
            { id: 18, type: 'bishop', position: [7, 2], color: 'white' },
            { id: 19, type: 'queen', position: [7, 3], color: 'white' },
            { id: 20, type: 'king', position: [7, 4], color: 'white' },
            { id: 21, type: 'bishop', position: [7, 5], color: 'white' },
            { id: 22, type: 'knight', position: [7, 6], color: 'white' },
            { id: 23, type: 'rook', position: [7, 7], color: 'white' },
            { id: 24, type: 'pawn', position: [6, 0], color: 'white' },
            { id: 25, type: 'pawn', position: [6, 1], color: 'white' },
            { id: 26, type: 'pawn', position: [6, 2], color: 'white' },
            { id: 27, type: 'pawn', position: [6, 3], color: 'white' },
            { id: 28, type: 'pawn', position: [6, 4], color: 'white' },
            { id: 29, type: 'pawn', position: [6, 5], color: 'white' },
            { id: 30, type: 'pawn', position: [6, 6], color: 'white' },
            { id: 31, type: 'pawn', position: [6, 7], color: 'white' },
        ],
    },
    checkStatus: {
        black: false,
        white: false,
        direction: -1,
    },
    checkmateStatus: {
        black: false,
        white: false,
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
//     kingPositions: {black: [0, 4], white: [7, 4]}, 
//     threateningPiecesPositions: {
//          black: [[0, 1], [0, 6], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7]],
//          white: [[7, 1], [7, 6], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]],
//      },

// };


function App() {
    const [playerNumber, setPlayerNumber] = useState<number>(1);
    const [gameOver, setGameOver] = useState(false);
    const [turnState, setTurnState] = useState<0 | 1 | 2>(1);
    const [gameState, setGameState] = useState<GameStateType>(initialBoard);
    const [highlightedTiles, setHighlightedTiles] = useState<HighlightedTile[]>([]);
    const [winner, setWinner] = useState<string | null>(null);
    const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);
    const [checkmateResult, setCheckmateResult] = useState<{ isInCheckmate: boolean, loser: string | null }>({ isInCheckmate: false, loser: null });
    const { roomCode } = useParams()

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
        socket.on('loadSaveGame', (roomId, gameState) => {
            console.log('roomCode', roomCode, roomId)
            socket.emit('gameState', gameState, roomId );
            console.log('emitting to guest client', gameState)

        });
        // const handleLoadSaveGame = () => {
        //     // Emit the current game state
        // }
    
    
        // Clean up the effect
        return () => {
            socket.off('loadSaveGame');
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
        setPlayerNumber,
        setGameState,
        setGameOver,
        setTurnState,
        setHighlightedTiles,
        setWinner,
        setIsPlayerInCheck,
        handleReset,
        setCheckmateResult,
    };

    return (
        <SocketContext.Provider value={socket}>
            <Router>
                <Routes>
                    <Route path="/lobby?/:username?" element={<Lobby setGameState={ setGameState } />} />
                    <Route path="/game/:roomCode" element={<Chess {...chessProps} />} />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;

