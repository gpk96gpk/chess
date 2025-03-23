import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { Props, GameStateType, Position, PieceType, PieceNames } from './types/clientTypes';
import resetGameState from './gameLogic/resetGameState';

const socket = io(`http://localhost:3004/`);

let index = 0;
let whitePawnIndex = 24;
let whiteMajorIndex = 16;

const createPiece = (type: PieceNames, color: 'black' | 'white' | 'none', position: Position, index: number): PieceType => ({ type, color, position, hasMoved: false, index });

const majorPieces: PieceNames[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

const initialBoard: GameStateType = {
    board: [
        majorPieces.map((type: PieceNames, i: number) => createPiece(type, 'black', [0, i], index++)),
        Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
        ...Array(4).fill(null).map(() =>
            Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, position: [], index } as PieceType))
        ),
        Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], whitePawnIndex++)),
        majorPieces.map((type, i) => createPiece(type, 'white', [7, i], whiteMajorIndex++)),
    ],
    history: [],
    turn: 'black',
    kingPositions: { black: [0, 4], white: [7, 4] },
    threateningPiecesPositions: {
        black: [
            // [0, -1] horizontal 0
            [[0, 3], [0, 2], [0, 1], [0, 0]],
            // [0, 1] horizontal 1
            [[0, 5], [0, 6], [0, 7]],
            // [-1, 0] vertical 2
            [],
            // [1, 0] vertical 3
            [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
            // [-1, -1] diagonal 4
            [],
            // [-1, 1] diagonal 5
            [],
            // [1, -1] diagonal 6
            [[1, 3], [2, 2], [3, 1], [4, 0]],
            // [1, 1] diagonal 7
            [[1, 5], [2, 6], [3, 7]],
            //knight moves
            // [-2, -1] knight vertical 8
            [],
            // [-2, 1] knight vertical 9
            [],
            // [2, -1] knight vertical 10
            [[2, 3]],
            // [2, 1] knight vertical 11
            [[2, 5]],
            // [-1, -2] knight horizontal 12
            [],
            // [-1, 2] knight horizontal 13
            [],
            // [1, -2] knight horizontal 14
            [[1, 2]],
            // [1, 2] knight horizontal 15
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
    username1: 'Guest Player 1',
    username2: 'Guest Player 2'
};


function App() {
    const [playerNumber, setPlayerNumber] = useState< 1 | 2 >(1);
    const [gameOver, setGameOver] = useState(false);
    const [turnState, setTurnState] = useState<0 | 1 | 2 | 3>(0);
    const [winner, setWinner] = useState<string | null>(null);
    const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);
    const [pieceToPromote, setPieceToPromote] = useState<PieceType | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<PieceType | null>(null);
    const [highlightedTiles, setHighlightedTiles] = useState<Position[]>([]);
    const { roomCode } = useParams()

      const [gameState, setGameState] = useState<GameStateType>( {
        board: [],
        history: [],
        turn: 'black',
        kingPositions: { black: [0,0], white: [7,7] },
        threateningPiecesPositions: { black: [], white: [] },
        piecePositions: { black: [], white: [] },
        checkStatus: { black: false, white: false, direction: -1 },
        checkmateStatus: { black: false, white: false },
        username1: '',
        username2: ''
      });
      

    useEffect(() => {
        socket.on('createRoom', (roomId) => {
            console.debug(`Socket Created room ${roomId}`);
            setWinner(null);
            setGameOver(false);
            console.debug('createRoom gameState', gameState, winner, gameOver)
        });

        return () => {
            socket.off('createRoom');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on('joinRoom', (roomId) => {
            console.debug(`Socket Joined room ${roomId}`);
            socket.emit('turn', turnState, roomId)
        });

        return () => {
            socket.off('joinRoom');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on('leaveRoom', (roomId) => {
            //setGameOver(true);
            setWinner(null);
            socket.emit('turn', 0, roomId);
            setTurnState(0)
            console.debug(`Socket Left room ${roomId}`);
        });

        return () => {
            socket.off('leaveRoom');
        };
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.debug('Socket Connected to the server');
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
            console.debug('Disconnected:', reason);
        });

        return () => {
            socket.off('disconnect');
        };
    }, []);

    useEffect(() => {
        socket.on('playerNumber', (number: 1) => {
            console.debug(`Socket Player number: ${number}`);
            setPlayerNumber(number);
        });

        return () => {
            socket.off('playerNumber');
        }
    }, []);

    useEffect(() => {
        const handleGameState = (arg:React.SetStateAction<GameStateType>) => {
            if (arg === null) {
                arg = resetGameState()
            }
            console.debug('gameState', arg)
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
            console.debug('gameOver00', arg)
            setGameOver(arg.isGameOver);
            setWinner(arg.winner);
        }
        console.debug('winner', winner)
        socket.on("gameOver", handleGameOver);
    
        return () => {
            socket.off("gameOver", handleGameOver)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on('loadSaveGame', (roomId, gameStateParameter) => {
            let turnNumber: 0 | 1 | 2 | 3;

            if (gameStateParameter && gameStateParameter.turn) {
                turnNumber = gameStateParameter.turn === 'black' ? 1 : 2;
                console.debug('turnNumber', turnNumber)
            } else {
                // Handle the case where gameStateParameter or gameStateParameter.turn is null
                turnNumber = 2;
            }            
            if (!gameStateParameter && gameState && gameState.history.length === 0) {
                console.debug('turnState change initial', turnNumber)
                turnNumber = 1
            } 
            console.debug('roomCode', roomCode, roomId)
            console.debug('emitting to guest client', gameStateParameter, gameState)
            socket.emit('gameState', gameStateParameter || gameState, roomId );
            console.debug('loadSave turn state management', turnNumber)
            
            setTurnState(turnNumber);
            
            socket.emit('turn', turnNumber, roomId)

        });    
    
        // Clean up the effect
        return () => {
            socket.off('loadSaveGame');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    useEffect(() => {
        const turnStateChange = (arg:React.SetStateAction< 0 | 1 | 2 | 3>) => {
            setTurnState(arg);
            console.debug('turnState', turnState)
            console.debug(`Socket Turn state: ${arg}`);
        }

        socket.on('turn', turnStateChange);

        return () => {
            socket.off('turn', turnStateChange)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        gameState: gameState || initialBoard,
        turnState,
        winner,
        isPlayerInCheck,
        username,
        showPromotionDialog,
        promotionPosition,
        pieceToPromote,
        selectedPiece,
        highlightedTiles,
        setPlayerNumber,
        setGameState,
        setGameOver,
        setTurnState,
        setWinner,
        setIsPlayerInCheck,
        handleReset,
        setUsername,
        setShowPromotionDialog,
        setPromotionPosition,
        setPieceToPromote,
        setSelectedPiece,
        setHighlightedTiles,
    };

    return (
    <SocketContext.Provider value={socket}>
        <Router>
            <Routes>
            <Route path="/lobby?/:username?" element={<Lobby setGameState={setGameState} setUsername={setUsername} username={username} />} />
            <Route path="/game/:roomCode" element={<Chess {...chessProps} />} />
            </Routes>
        </Router>
    </SocketContext.Provider>
    );
}

export default App;

