import LobbySignInSignUpButton from './LobbySignInSignUpButton';
import LobbyGameButtons from './LobbyGameButtons';
import { Dispatch, SetStateAction } from 'react';
import { GameStateType } from '../types/clientTypes';

interface LobbyProps {
  setGameState: Dispatch<SetStateAction<GameStateType>>;
  setUsername: Dispatch<SetStateAction<string | null>>;
  username: string | null;
  playingAgainstAI: boolean;
  setPlayingAgainstAI: (value: boolean) => void;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  setAIDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
  // Add these new props
  turnState: 0 | 1 | 2 | 3;
  setTurnState: Dispatch<SetStateAction<0 | 1 | 2 | 3>>;
}

const Lobby = ({ 
  setGameState, 
  setUsername, 
  username,
  playingAgainstAI,
  setPlayingAgainstAI,
  aiDifficulty,
  setAIDifficulty,
  turnState,
  setTurnState
}: LobbyProps): JSX.Element => {
  return (
    <div>
      <h1>Chess </h1> 
      <h1>By George</h1>
      <div>
        <LobbySignInSignUpButton username={username} setUsername={setUsername}/>
      </div>
      <LobbyGameButtons 
        setGameState={setGameState} 
        username={username}
        playingAgainstAI={playingAgainstAI}
        setPlayingAgainstAI={setPlayingAgainstAI}
        aiDifficulty={aiDifficulty}
        setAIDifficulty={setAIDifficulty}
        turnState={turnState}
        setTurnState={setTurnState}
      />
    </div>
  );
};

export default Lobby;