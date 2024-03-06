//TODO: 
// render component
//header Welcome to Chess Game
//render Welcome would you like to sign in and create account button 

//render LobbySignInButtons component
//render LobbyGameButtons component

import LobbySignInButton from './LobbySignInButton';
import LobbyGameButtons from './LobbyGameButtons';
import LobbySignUpButton from './LobbySignUpButton';
import { useState } from 'react';

const Lobby = ({ setGameState }) => {
  const [username, setUsername] = useState<string>('');

  return (
    <div>
      <h1>Welcome {username} to Chess Game</h1>
      <span>Would you like to sign in and create an account?</span>
      <div>
        <LobbySignInButton username={username} setUsername={setUsername}/>
        <LobbySignUpButton />
      </div>
      <LobbyGameButtons setGameState={setGameState} username={username} />
    </div>
  );
};

export default Lobby;