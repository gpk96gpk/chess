import React, { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

interface AISettingsProps {
  playingAgainstAI: boolean;
  setPlayingAgainstAI: (value: boolean) => void;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  setAIDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
  turnState: 0 | 1 | 2 | 3;
  setTurnState: Dispatch<SetStateAction<0 | 1 | 2 | 3>>;
}

const AISettings: React.FC<AISettingsProps> = ({
  setPlayingAgainstAI,
  setTurnState
}) => {
  const navigate = useNavigate();
  
  const startAIGame = () => {
    // Enable AI
    setPlayingAgainstAI(true);
    
    // Create a unique room code for the AI game
    const aiRoomCode = `ai-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Important: Directly set the turn state to player's turn (1)
    // This bypasses the "waiting for opponent" state (0)
    setTurnState(1);
    
    // For AI games, we don't emit to the server - everything is local
    console.log('Starting AI game with room code:', aiRoomCode);
    
    // Navigate to the game with the AI room code
    navigate(`/game/${aiRoomCode}`);
  };

  return (
    <div className="ai-settings">
      <button 
        className="ai-game-button"
        onClick={startAIGame}
      >
        Play Against AI
      </button>
    </div>
  );
};

export default AISettings;