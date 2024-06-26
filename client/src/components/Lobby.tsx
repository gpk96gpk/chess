//TODO: 
// render component
//header Welcome to Chess Game
//render Welcome would you like to sign in and create account button 

//render LobbySignInSignUpButton component
//render LobbyGameButtons component

import LobbySignInSignUpButton from './LobbySignInSignUpButton';
import LobbyGameButtons from './LobbyGameButtons';
// import LobbySignUpButton from './LobbySignUpButton';
import { Dispatch, SetStateAction } from 'react';
import { GameStateType } from '../types/clientTypes';

const Lobby = ({ setGameState, setUsername, username }: { setGameState: Dispatch<SetStateAction<GameStateType>>, setUsername:  Dispatch<SetStateAction<string | null>>, username: string | null}): JSX.Element => {
  

  return (
    <div>
      <h1>Chess </h1> 
      <h1>By George</h1>
      {/* <span>Would you like to sign in and create an account?</span> */}
      <div>
        <LobbySignInSignUpButton username={username} setUsername={setUsername}/>
        {/* <LobbySignUpButton username={username} setUsername={setUsername}/> */}
      </div>
      <LobbyGameButtons setGameState={setGameState} username={username} />
    </div>
  );
};

export default Lobby;