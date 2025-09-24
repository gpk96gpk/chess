import React, { Dispatch, SetStateAction, useState } from 'react';
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
  aiDifficulty,
  setAIDifficulty,
  setTurnState
}) => {
  const navigate = useNavigate();
  const [showDifficulty, setShowDifficulty] = useState(false);
  
  const handlePlayAgainstAI = () => {
    // Add fade transition like continue as guest
    const aiButton = document.querySelector('.ai-game-button') as HTMLElement;
    if (aiButton) {
      aiButton.style.transition = 'opacity 0.5s ease';
      aiButton.style.opacity = '0';
      
      setTimeout(() => {
        setShowDifficulty(true);
        // Make difficulty menu visible with fade in
        setTimeout(() => {
          const difficultyMenu = document.querySelector('.ai-difficulty-menu') as HTMLElement;
          if (difficultyMenu) {
            difficultyMenu.classList.add('visible');
          }
        }, 50);
      }, 500);
    }
  };

  const startAIGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    // Set the selected difficulty
    setAIDifficulty(difficulty);
    
    // Enable AI
    setPlayingAgainstAI(true);
    
    // Create a unique room code for the AI game
    const aiRoomCode = `ai-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Important: Directly set the turn state to player's turn (1)
    // This bypasses the "waiting for opponent" state (0)
    setTurnState(1);
    
    // For AI games, we don't emit to the server - everything is local
    console.log('Starting AI game with room code:', aiRoomCode, 'Difficulty:', difficulty);
    
    // Navigate to the game with the AI room code
    navigate(`/game/${aiRoomCode}`);
  };

  return (
    <div className="ai-settings">
      {!showDifficulty ? (
        <button 
          className="ai-game-button"
          onClick={handlePlayAgainstAI}
        >
          Play Against AI
        </button>
      ) : (
        <div className={`ai-difficulty-menu ${showDifficulty ? 'visible' : ''}`}>
          <button 
            className="ai-difficulty-button"
            onClick={() => startAIGame('easy')}
          >
            Easy
          </button>
          <button 
            className="ai-difficulty-button"
            onClick={() => startAIGame('medium')}
          >
            Medium
          </button>
          <button 
            className="ai-difficulty-button"
            onClick={() => startAIGame('hard')}
          >
            Hard
          </button>
        </div>
      )}
    </div>
  );
};

export default AISettings;