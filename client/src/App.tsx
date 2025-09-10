import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState, useRef } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { Props, GameStateType, Position, PieceType, PieceNames } from './types/clientTypes';
// import resetGameState from './gameLogic/resetGameState';
import { getAIMove } from "./ai/aiEngine";
//import { knightCheckmateBoard, pawnTestBoard, basicMoveBoard } from './testUtils/testBoards';

//import { API_URL } from './apis/ChessGame';
//import calculateThreateningSquares from './gameLogic/calculateThreateningSquares';

// const socket = io(`wss://api.chessbygeorge.com:3004/`, { secure: true, rejectUnauthorized: true});
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


// Ensure any inbound game state from the server is valid and merged with defaults
function sanitizeGameState(input: unknown): GameStateType {
    try {
        if (!input || typeof input !== 'object') return initialBoard;
        const obj = input as Partial<GameStateType>;
        const merged: GameStateType = {
            ...initialBoard,
            ...obj,
            // Deep-merge a few nested structures to avoid missing keys
            kingPositions: {
                ...initialBoard.kingPositions,
                ...(obj.kingPositions || {}),
            },
            threateningPiecesPositions: {
                ...initialBoard.threateningPiecesPositions,
                ...(obj.threateningPiecesPositions || {}),
            },
            piecePositions: {
                ...initialBoard.piecePositions,
                ...(obj.piecePositions || {}),
            },
            checkStatus: {
                ...initialBoard.checkStatus,
                ...(obj.checkStatus || {}),
            },
            checkmateStatus: {
                ...initialBoard.checkmateStatus,
                ...(obj.checkmateStatus || {}),
            },
        };
        // Basic sanity checks
        if (!Array.isArray(merged.board)) merged.board = initialBoard.board;
        if (merged.turn !== 'black' && merged.turn !== 'white') merged.turn = initialBoard.turn;
        return merged;
    } catch {
        return initialBoard;
    }
}





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
    const aiMoveInProgress = useRef(false);
    const [playerNumber, setPlayerNumber] = useState< 1 | 2 >(1);
    const [gameOver, setGameOver] = useState(false);
    const [turnState, setTurnState] = useState<0 | 1 | 2 | 3>(0);
    //const [gameState, setGameState] = useState<GameStateType>(initialBoard);
    const [winner, setWinner] = useState<string | null>(null);
    const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);
    const [pieceToPromote, setPieceToPromote] = useState<PieceType | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<PieceType | null>(null);
    const [highlightedTiles, setHighlightedTiles] = useState<Position[]>([]);
    const { roomCode } = useParams()
    //const [highlightedTiles, setHighlightedTiles] = useState<HighlightedTile[]>([]);

    // Add state for AI settings
    const [playingAgainstAI, setPlayingAgainstAI] = useState(false);
    const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    // const [aiThinking, setAIThinking] = useState(false);

    // AI move function
    // Replace your makeAIMove function with this complete implementation:
    const makeAIMove = async () => {
        // Prevent concurrent AI moves
        if (aiMoveInProgress.current) {
          console.log("AI move already in progress, skipping");
          return;
        }
        
        // Set flag to block additional moves
        aiMoveInProgress.current = true;
    // setAIThinking(true);
        
        try {
          console.log("Calculating AI move...");
          
          // Calculate the AI's move
                    const aiMove = await getAIMove(gameState, aiDifficulty);
          console.log("AI selected move:", aiMove);
          
                    if (aiMove && Array.isArray(aiMove.from) && Array.isArray(aiMove.to) && aiMove.from.length === 2 && aiMove.to.length === 2) {
            console.log("Executing AI move from", aiMove.from, "to", aiMove.to);
            
            // Create a deep copy of the current game state
            const updatedGameState = JSON.parse(JSON.stringify(gameState));
            
            // Get piece from the board
            const [fromX, fromY] = aiMove.from as [number, number];
            const [toX, toY] = aiMove.to as [number, number];
                        if ([fromX, fromY, toX, toY].some(v => typeof v !== 'number')) {
                            console.warn('Invalid AI move indices, skipping move');
                            return;
                        }
            const movingPiece = {...updatedGameState.board[fromX][fromY]};
            
            // Get target piece BEFORE updating the board
                        const targetPiece = {...updatedGameState.board[toX][toY]};
            const isCapturingMove = targetPiece.type !== 'empty' && targetPiece.color !== movingPiece.color;

                        if (isCapturingMove) {
            console.log("About to capture:", targetPiece);
            
            // Only remove opponent's pieces from their piece array
                        if (targetPiece.color === 'black') {
                                updatedGameState.piecePositions.black = updatedGameState.piecePositions.black.filter(
                                    (p: { position?: [number, number] }) => !(p.position && p.position[0] === toX && p.position[1] === toY)
                                );
                        }
            }
            
            // Update piece properties
            movingPiece.hasMoved = true;
            movingPiece.position = [toX, toY];
            
            // Clear the original position
                        updatedGameState.board[fromX][fromY] = {
              type: 'empty',
              color: 'none',
              hasMoved: false,
              position: [fromX, fromY],
              index: -1
            };
            
            // Set the new position
            updatedGameState.board[toX][toY] = movingPiece;
            
            // Update piecePositions arrays
            if (updatedGameState.piecePositions) {
                // First, properly update the piece ID before updating positions
                if (!movingPiece.id) {
                console.log("Missing piece ID for moving piece:", movingPiece);
                // Set ID based on index if missing
                movingPiece.id = movingPiece.index;
                }
                
                // Update AI piece position with safer id-based lookup
                                const pieceIdx = updatedGameState.piecePositions.white.findIndex(
                                    (p: { id?: number; position?: [number, number]; type?: string }) => p.id === movingPiece.id || 
                                        (p.position && 
                                                p.position[0] === fromX && 
                                                p.position[1] === fromY &&
                                                p.type === movingPiece.type)
                                );
                
                if (pieceIdx !== -1) {
                // Update position
                updatedGameState.piecePositions.white[pieceIdx].position = [toX, toY];
                // Mark as moved
                updatedGameState.piecePositions.white[pieceIdx].hasMoved = true;
                console.log("Updated piece position:", updatedGameState.piecePositions.white[pieceIdx]);
                } else {
                console.warn("Could not find piece in piecePositions array:", movingPiece);
                }
                
                // If capturing, log and remove the captured piece from player's pieces
                if (isCapturingMove) {
                                console.log("Capturing piece at:", [toX, toY]);
                
                // Remove captured piece from pieces array
                                updatedGameState.piecePositions.black = updatedGameState.piecePositions.black.filter(
                                    (p: { position?: [number, number] }) => !(p.position && p.position[0] === toX && p.position[1] === toY)
                                );
                }
            }
            
            // Special handling for king moves (update king position)
            if (movingPiece.type === 'king') {
              updatedGameState.kingPositions.white = [toX, toY];
            }
            
            // Change turn to player
            updatedGameState.turn = 'black';
            
            // Update game state
            setGameState(updatedGameState);
            // After AI move completes, manually set turn back to player
            setTurnState(1); // Set to player's turn
          } else {
            console.warn("AI couldn't find a move!");
          }
        } catch (error) {
          console.error("Error in AI move:", error);
        } finally {
          // setAIThinking(false);
          
          // Release the lock with a delay
          setTimeout(() => {
            aiMoveInProgress.current = false;
          }, 500);
        }
    };

    // Call AI move when it's AI's turn
    

    // const testBoards = {
    //     none: null,
    //     knightCheckmate: knightCheckmateBoard,
    //     pawnTest: pawnTestBoard,
    //     basicMove: basicMoveBoard
    //   };
    
      //const [selectedTestBoard, setSelectedTestBoard] = useState<TestBoard>('none');
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
      
      // On test board selection change, update gameState
    //   useEffect(() => {
    //     if (testBoards[selectedTestBoard]) {
    //       setGameState(testBoards[selectedTestBoard]!);
    //     }
      
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    //   }, [selectedTestBoard]);

    useEffect(() => {
        socket.on('createRoom', (roomId) => {
            console.log(`Socket Created room ${roomId}`);
            // const {initialBoard} = resetGameState();
            // setGameState(initialBoard);
            setWinner(null);
            setGameOver(false);
            console.log('createRoom gameState', gameState, winner, gameOver)
        });
    
        return () => {
        socket.off('createRoom');
        };
    }, []);
    useEffect(() => {
        socket.on('joinRoom', (roomId) => {
            console.log(`Socket Joined room ${roomId}`);
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
            console.log(`Socket Left room ${roomId}`);
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
        const handleGameState = (arg: unknown) => {
            // Normalize and guard against undefined/null or malformed payloads
            const safe = sanitizeGameState(arg);
            console.log('gameState (sanitized)', safe);
            setGameState(safe);
        };

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
                //console.log('turnNumber', turnNumber)
                turnNumber = 2;
            }            
            if (!gameStateParameter && gameState && gameState.history.length === 0) {
                console.debug('turnState change initial', turnNumber)
                turnNumber = 1
            } 
            console.debug('roomCode', roomCode, roomId)
            console.debug('emitting to guest client', gameStateParameter, gameState)
            socket.emit('gameState', gameStateParameter || gameState, roomId );
            console.log('loadSave turn state management', turnNumber)
            
            setTurnState(turnNumber);
            
            socket.emit('turn', turnNumber, roomId)

        });
        // const handleLoadSaveGame = () => {
        //     // Emit the current game state
        // }
    
    
        // Clean up the effect
        return () => {
            socket.off('loadSaveGame');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);
    useEffect(() => {
        // Don't attempt another AI move if one is already in progress
        if (aiMoveInProgress.current) return;

        const isAIGame = roomCode && roomCode.startsWith('ai-');
        const currentTurn = gameState?.turn ?? 'black';
        const isAITurn = playingAgainstAI &&
            ((playerNumber === 1 && currentTurn === 'white') ||
             (playerNumber === 2 && currentTurn === 'black') ||
             (isAIGame && currentTurn === 'white'));

        if (isAITurn && !gameOver && (gameState?.board?.length ?? 0) > 0) {
            console.log("AI turn detected, triggering move...");
            
            // Use longer delay to ensure state updates have settled
            const timer = setTimeout(() => {
                makeAIMove();
            }, 800);
            
            return () => clearTimeout(timer);
        }
    }, [gameState?.turn, gameState?.board?.length, playerNumber, playingAgainstAI, roomCode, gameOver]); 
    useEffect(() => {
        const turnStateChange = (arg:React.SetStateAction< 0 | 1 | 2 | 3>) => {
            setTurnState(arg);
            console.log('turnState', turnState)
            console.log(`Socket Turn state: ${arg}`);
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
            {/* 
            Display a test board selector for debugging.
            In production this component remove or hide.
            */}
            {/* <div style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}> */}
            {/* <label htmlFor="testBoardSelect">Select test board:</label>
            <select
                id="testBoardSelect"
                value={selectedTestBoard}
                onChange={(e) => setSelectedTestBoard(e.target.value as TestBoard)}
                style={{ zIndex: 9999, position: 'relative' }}
            >
                <option value="">-- Standard Game --</option>
                <option value="knightCheckmate">Knight Checkmate</option>
                <option value="pawnTest">Pawn Test</option>
                <option value="basicMove">Basic Move</option>
            </select> */}
            {/* </div> */}
            <Routes>
                <Route 
                    path="/lobby?/:username?" 
                    element={
                    <Lobby 
                        setGameState={setGameState} 
                        setUsername={setUsername} 
                        username={username}
                        playingAgainstAI={playingAgainstAI}
                        setPlayingAgainstAI={setPlayingAgainstAI}
                        aiDifficulty={aiDifficulty}
                        setAIDifficulty={setAIDifficulty}
                        turnState={turnState}
                        setTurnState={setTurnState}
                    />
                    } 
                />
                <Route path="/game/:roomCode" element={<Chess {...chessProps} />} />
            </Routes>
        </Router>
    </SocketContext.Provider>
    );
}

export default App;