import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketContext } from './context/SocketContext';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Chess from './components/Chess';
import { useState, useEffect } from 'react';
import { Props, GameStateType, Position, PieceType, PieceNames } from './types/clientTypes';
import resetGameState from './gameLogic/resetGameState';

// Init socket (adjust URL if needed)
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3004'
  : 'https://api.chessbygeorge.com';

const socket = io(API_URL, { transports: ['websocket', 'polling'] });

const App = () => {
  // Minimal required state so components don’t crash
  const initial = resetGameState();
  const [gameState, setGameState] = useState<GameStateType>(initial);
  const [turnState, setTurnState] = useState<0 | 1 | 2 | 3>(0);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isPlayerInCheck, setIsPlayerInCheck] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);
  const [pieceToPromote, setPieceToPromote] = useState<PieceType | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<PieceType | null>(null);
  const [highlightedTiles, setHighlightedTiles] = useState<Position[]>([]);

  const chessProps: Props = {
    playerNumber,
    gameOver,
    gameState,
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
    setUsername,
    setShowPromotionDialog,
    setPromotionPosition,
    setPieceToPromote,
    setSelectedPiece,
    setHighlightedTiles,
    handleReset: () => {
      setGameState(resetGameState());
      setGameOver(false);
      setTurnState(1);
    }
  };

  useEffect(() => {
    socket.on('createRoom', (roomId) => {
        console.debug(`Socket Created room ${roomId}`);
        setWinner(null);
        setGameOver(false);
        // Host always becomes player 1 and starts (turnState 1 -> black's move)
        setPlayerNumber(1);
        setTurnState(1);
        // Ensure underlying game state's turn aligns
        setGameState(prev => ({ ...prev, turn: 'black' } as GameStateType));
    });

    return () => {
        socket.off('createRoom');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      socket.on('joinRoom', (roomId) => {
          console.debug(`Socket Joined room ${roomId}`);
          // Guest becomes player 2
          setPlayerNumber(2);
          // If game hasn't started yet (still waiting), start it now with player 1's turn
          setTurnState(prev => (prev === 0 ? 1 : prev));
          socket.emit('turn', turnState === 0 ? 1 : turnState, roomId);
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
      socket.on('playerNumber', (number: 1 | 2) => {
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
          // Removed undefined roomCode reference
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
            setGameOver(false);
            setTurnState(1);
            setPlayerNumber(1);
            setGameState(resetGameState());
            setGameState(prev => ({ ...prev, turn: 'black' } as GameStateType));
    };

  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/lobby" replace />} />
            <Route
              path="/lobby"
              element={
                <Lobby
                  setGameState={setGameState}
                  setUsername={setUsername}
                  username={username}
                />
              }
            />
            <Route path="/game/:roomCode" element={<Chess {...(chessProps)} />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </SocketContext.Provider>
  );
};

export default App;

