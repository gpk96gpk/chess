import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

interface AISettingsProps {
  playingAgainstAI: boolean;
  setPlayingAgainstAI: (value: boolean) => void;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  setAIDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
  turnState: 0 | 1 | 2 | 3;
  setTurnState: Dispatch<SetStateAction<0 | 1 | 2 | 3>>;
}

const AISettings: React.FC<AISettingsProps> = ({
  playingAgainstAI,
  setPlayingAgainstAI,
  aiDifficulty,
  setAIDifficulty,
  turnState,
  setTurnState
}) => {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  
  const startAIGame = () => {
    // Enable AI
    setPlayingAgainstAI(true);
    
    // Create a unique room code for the AI game
    const aiRoomCode = `ai-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Important: Directly set the turn state to player's turn (1)
    // This bypasses the "waiting for opponent" state (0)
    setTurnState(1);
    
    // Emit events to update server state
    socket.emit('createRoom', aiRoomCode);
    socket.emit('turn', 1, aiRoomCode);
    
    // Navigate to the game with the AI room code
    navigate(`/game/${aiRoomCode}`);
  };

  return (
    <div className="ai-settings">
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={playingAgainstAI}
            onChange={(e) => setPlayingAgainstAI(e.target.checked)}
          />
          Play against AI
        </label>
      </div>
      
      {playingAgainstAI && (
        <div className="setting-group">
          <label>AI Difficulty:</label>
          <select
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value as any)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}
      
      <div className="ai-action">
        <button 
          className="play-ai-button"
          onClick={startAIGame}
        >
          Start Game with AI
        </button>
      </div>
    </div>
  );
};

export default AISettings;