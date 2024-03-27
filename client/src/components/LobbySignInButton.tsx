//render overlay with sign in form
//in overlay have a sign in form with username and password inputs
//in overlay have submit button and an exit button to close the overlay
//send api request to server with username and password from api saves in ChessGame in api folder
//if sign in button click and username and password are correct reload page with 
//username in corner and a new button from the LobbySavedGames component for loading saved games
//and username will be params of the react router link to the lobby page
//if not correct display error message
//pass username to LobbyGameButtons component
//pass username to LobbySavedGames component

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../apis/ChessGame';

interface LobbySignInButtonProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const LobbySignInButton = ({ setUsername }: LobbySignInButtonProps) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const token = await signIn(inputUsername, password);
    if (token) {
      localStorage.setItem('jwt', token);
      setUsername(inputUsername); // Set the username here
      setShowSignIn(false);
      navigate(`/lobby/${inputUsername}`);
      console.log('username', inputUsername); 
    } else {
      setErrorMessage('Incorrect username or password');
    }
  };

  return (
    <div>
      {showSignIn ? (
        <div>
          <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={() => setShowSignIn(false)}>Exit</button>
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ) : (
        <button onClick={() => setShowSignIn(true)}>Sign In</button>
      )}
    </div>
  );
};

export default LobbySignInButton;