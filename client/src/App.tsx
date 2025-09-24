import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import Chess from './components/Chess';
import Lobby from './components/Lobby';
import { Props, GameStateType, Position, PieceType, PieceNames } from './types/clientTypes';
import { getAIMove } from "./ai/optimizedAiEngine";
import resetGameState from './gameLogic/resetGameState';

// Connect to the real server for multiplayer games
const realSocket = io(`http://localhost:3004/`);

// Simple local socket for AI games
const createLocalSocket = () => ({
    emit: () => console.log('AI game - local emit (no server)'),
    on: () => console.log('AI game - local on (no server)'),
    off: () => console.log('AI game - local off (no server)'),
});




// Ensure any inbound game state from the server is valid and merged with defaults
function sanitizeGameState(input: unknown): GameStateType {
    try {
        if (!input || typeof input !== 'object') return resetGameState();
        const obj = input as Partial<GameStateType>;
        const freshBoard = resetGameState();
        const merged: GameStateType = {
            ...freshBoard,
            ...obj,
            // Deep-merge a few nested structures to avoid missing keys
            kingPositions: {
                ...freshBoard.kingPositions,
                ...(obj.kingPositions || {}),
            },
            threateningPiecesPositions: {
                ...freshBoard.threateningPiecesPositions,
                ...(obj.threateningPiecesPositions || {}),
            },
            piecePositions: {
                ...freshBoard.piecePositions,
                ...(obj.piecePositions || {}),
            },
            checkStatus: {
                ...freshBoard.checkStatus,
                ...(obj.checkStatus || {}),
            },
            checkmateStatus: {
                ...freshBoard.checkmateStatus,
                ...(obj.checkmateStatus || {}),
            },
        };
        // Basic sanity checks
        if (!Array.isArray(merged.board)) merged.board = freshBoard.board;
        if (merged.turn !== 'black' && merged.turn !== 'white') merged.turn = freshBoard.turn;
        return merged;
    } catch {
        return resetGameState();
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
    const [winner, setWinner] = useState<string | null>(null);
    const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);
    const [pieceToPromote, setPieceToPromote] = useState<PieceType | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<PieceType | null>(null);
    const [highlightedTiles, setHighlightedTiles] = useState<Position[]>([]);
    const { roomCode } = useParams()

    // Add state for AI settings
    const [playingAgainstAI, setPlayingAgainstAI] = useState(false);
    const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    // Check if this is an AI game
    const isAIGame = (roomCode && roomCode.startsWith('ai-')) || playingAgainstAI;
    
    console.log("App.tsx - Room/AI Detection:", { 
        roomCode, 
        playingAgainstAI, 
        isAIGame,
        startsWithAI: roomCode && roomCode.startsWith('ai-')
    });

    // Get the appropriate socket (real or local AI socket)
    const socket = isAIGame ? createLocalSocket() : realSocket;

    // Initialize game state
    const [gameState, setGameState] = useState<GameStateType>(() => resetGameState());

    // AI move function
    const makeAIMove = useCallback(async () => {
        console.log("🤖 makeAIMove called!");
        
        // Prevent concurrent AI moves
        if (aiMoveInProgress.current) {
          console.log("AI move already in progress, skipping");
          return;
        }
        
        // Set flag to block additional moves
        aiMoveInProgress.current = true;
        
        try {
          console.log("🤖 Calculating AI move for game state:", gameState?.turn);
          console.log("🤖 Current board state:", gameState?.board?.length);
          
          // Calculate the AI's move
          const aiMove = await getAIMove(gameState, aiDifficulty);
          console.log("🤖 AI selected move:", aiMove);
          
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

            // Check if a king is being captured (should end the game)
            if (targetPiece.type === 'king') {
                console.log('🤖 AI captured the king! Game over.', targetPiece.color, 'king was captured by AI');
                setGameOver(true);
                setWinner('AI (White)');
                setTurnState(3);
                
                // Release AI move lock immediately since game is over
                aiMoveInProgress.current = false;
                return;
            }

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
          // Release the lock with a delay
          setTimeout(() => {
            aiMoveInProgress.current = false;
          }, 500);
        }
    }, [gameState, aiDifficulty]);
    
    // Initialize AI game when entering an AI room
    useEffect(() => {
        if (isAIGame) {
            console.log('Initializing AI game for room:', roomCode);
            console.log('Initializing fresh board state for AI game');
            
            // Set up AI game state
            setPlayingAgainstAI(true);
            setPlayerNumber(1); // Player is always player 1 (black)
            setGameState(resetGameState()); // Start with fresh board
            setTurnState(1); // Player (black) starts first
            setGameOver(false);
            setWinner(null);
            
            // Clear any existing selections
            setSelectedPiece(null);
            setHighlightedTiles([]);
            
            console.log('AI game initialization complete');
        }
    }, [roomCode, isAIGame]);

    // Call AI move when it's AI's turn
      
      // On test board selection change, update gameState
    //   useEffect(() => {
    //     if (testBoards[selectedTestBoard]) {
    //       setGameState(testBoards[selectedTestBoard]!);
    //     }
      
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    //   }, [selectedTestBoard]);

    useEffect(() => {
        // Skip server socket events for AI games
        if (isAIGame) return;
        
        const handleCreateRoom = (...args: unknown[]) => {
            const roomId = args[0] as string;
            console.log(`Socket Created room ${roomId}`);
            setWinner(null);
            setGameOver(false);
            console.log('createRoom gameState', gameState, winner, gameOver);
        };

        socket.on('createRoom', handleCreateRoom);
    
        return () => {
            socket.off('createRoom', handleCreateRoom);
        };
    }, [roomCode, isAIGame, socket, gameState, winner, gameOver]);
    useEffect(() => {
        if (isAIGame) return;
        
        const handleJoinRoom = (...args: unknown[]) => {
            const roomId = args[0] as string;
            console.log(`Socket Joined room ${roomId}`);
        };

        socket.on('joinRoom', handleJoinRoom);

        return () => {
            socket.off('joinRoom', handleJoinRoom);
        };
    }, [isAIGame, socket]);

    useEffect(() => {
        if (isAIGame) return;
        
        const handleLeaveRoom = (...args: unknown[]) => {
            const roomId = args[0] as string;
            setWinner(null);
            socket.emit('turn', 0, roomId);
            setTurnState(0);
            console.log(`Socket Left room ${roomId}`);
        };

        socket.on('leaveRoom', handleLeaveRoom);

        return () => {
            socket.off('leaveRoom', handleLeaveRoom);
        };
    }, [isAIGame, socket]);

    useEffect(() => {
        if (isAIGame) return;
        
        const handleConnect = () => {
            console.debug('Socket Connected to the server');
        };
        
        const handleConnectError = (...args: unknown[]) => {
            const error = args[0] as Error;
            console.error('Connection error:', error);
        };

        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('connect_error', handleConnectError);
        }
    }, [isAIGame, socket]);

    useEffect(() => {
        socket.on('Socket disconnect', (reason) => {
            console.debug('Disconnected:', reason);
        });

        return () => {
            socket.off('disconnect');
        };
    }, [socket]);

    useEffect(() => {
        socket.on('playerNumber', (number: 1) => {
            console.debug(`Socket Player number: ${number}`);
            setPlayerNumber(number);
        });

        return () => {
            socket.off('playerNumber');
        }
    }, [socket]);

    useEffect(() => {
        if (isAIGame) return;
        
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
    }, [isAIGame, socket]);

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
            
            //socket.emit('turn', turnNumber, roomId)

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
        console.log("AI Move Detection - State Check:", {
            aiMoveInProgress: aiMoveInProgress.current,
            roomCode,
            isAIGame,
            currentTurn: gameState?.turn,
            gameOver,
            boardLength: gameState?.board?.length,
            playingAgainstAI
        });

        // Don't attempt another AI move if one is already in progress
        if (aiMoveInProgress.current) {
            console.log("AI move already in progress, skipping");
            return;
        }

        const currentTurn = gameState?.turn ?? 'black';
        
        // In AI games: Player is always black (1), AI is white (2)
        // AI should move when it's white's turn
        const isAITurn = isAIGame && currentTurn === 'white' && !gameOver;

        console.log("AI Turn Check:", { isAIGame, currentTurn, gameOver, isAITurn });

        if (isAITurn && gameState?.board?.length > 0) {
            console.log("🤖 AI turn detected! Triggering move. Current turn:", currentTurn);
            
            // Use longer delay to ensure state updates have settled
            const timer = setTimeout(() => {
                makeAIMove();
            }, 1000);
            
            return () => clearTimeout(timer);
        } else {
            console.log("AI turn not detected:", { 
                isAITurn, 
                boardLength: gameState?.board?.length,
                reason: !isAIGame ? 'Not AI game' : 
                       currentTurn !== 'white' ? 'Not white turn' : 
                       gameOver ? 'Game over' : 
                       !gameState?.board?.length ? 'No board' : 'Unknown'
            });
        }
    }, [gameState?.turn, gameState?.board?.length, isAIGame, gameOver, makeAIMove, playingAgainstAI, roomCode]); 
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
        // Create a fresh initial board state to prevent shared state issues
        setGameState(resetGameState());
        setGameOver(false);
        setWinner(null); // Clear winner
        
        // Reset AI-related states
        if (isAIGame) {
            aiMoveInProgress.current = false;
        }
    };

    const chessProps: Props = {
        playerNumber,
        gameOver,
        gameState: gameState || resetGameState(),
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
        setPlayingAgainstAI,
        isAIGame,
        aiDifficulty,
    };

    // Debug logging for AI games
    if (isAIGame) {
        console.log('AI Game - Props check:', {
            gameState: gameState?.board?.length,
            turn: gameState?.turn,
            playerNumber,
            turnState,
            playingAgainstAI
        });
    }

    return (
    <SocketContext.Provider value={realSocket}>
        <Router>
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