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

const Lobby = () => {
  const [username, setUsername] = useState<string>('');

  return (
    <div>
      <h1>Welcome to Chess Game</h1>
      <button>Would you like to sign in and create an account?</button>\
      <div>
        <LobbySignInButton username={username} setUsername={setUsername}/>
        <LobbySignUpButton />
      </div>
      <LobbyGameButtons username={username} />
    </div>
  );
};

export default Lobby;