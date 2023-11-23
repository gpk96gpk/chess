//TODO: 
// render component
//header Welcome to Chess Game
//render Welcome would you like to sign in and create account button 

//render LobbySignInButtons component
//render LobbyGameButtons component

import LobbySignInButtons from './LobbySignInButton';
import LobbyGameButtons from './LobbyGameButtons';
import LobbySignUpButton from './LobbySignUpButton';

const Lobby = () => {
  return (
    <div>
      <h1>Welcome to Chess Game</h1>
      <button>Would you like to sign in and create an account?</button>\
      <div>
        <LobbySignInButtons />
        <LobbySignUpButton />
      </div>
      <LobbyGameButtons />
    </div>
  );
};

export default Lobby;