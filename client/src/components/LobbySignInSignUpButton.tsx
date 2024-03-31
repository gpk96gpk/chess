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

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../apis/ChessGame';

interface LobbySignInSignUpButtonProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const LobbySignInSignUpButton = ({ setUsername }: LobbySignInSignUpButtonProps) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [hide, setHide] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const password = passwordRef.current ? passwordRef.current.value : '';
    const token = await signUp(inputUsername, password);
    if (token) {
      localStorage.setItem('jwt', token);
      setUsername(inputUsername);
      setShowSignUp(false);
      setShowSignIn(false);
      navigate(`/lobby/${inputUsername}`);
      // Sign in the user after successful sign up
      const signInResult = await signIn(inputUsername, password);
      if (signInResult) {
        // Sign in was successful, do something here
      } else {
        // Sign in failed, handle error here
      }
    } else {
      setErrorMessage('Failed to create account');
    }
  };

  const handleSignIn = async () => {
    const token = await signIn(inputUsername, password);
    if (token) {
      localStorage.setItem('jwt', token);
      setUsername(inputUsername); // Set the username here
      setShowSignUp(false);
      setShowSignIn(false);
      setShowSignUp(false);
      navigate(`/lobby/${inputUsername}`);
      console.log('username', inputUsername); 
    } else {
      setErrorMessage('Incorrect username or password');
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    //setTimeout(() => setHide(true), 500);
    //if (document.querySelector('.continue-as-guest-button')) {
      document.querySelector('.continue-as-guest-button')!.addEventListener('click', function() {
        const element: HTMLElement | null = document.querySelector('.ConnectionManager');
        const showSavedGames = document.querySelector('.show-saved-games-button') as HTMLElement;
        if (element) {
          element.style.visibility = 'visible';
          showSavedGames.style.visibility = 'visible';
        }
      });
    //}
  };

  useEffect(() => {
    const button = document.querySelector('.continue-as-guest-button');
    const element = document.querySelector('.ConnectionManager');
    const showSavedGames = document.querySelector('.show-saved-games-button');
  
    const handleClick = () => {
      setIsGuest(true);
      if (element && showSavedGames) {
        element.classList.add('visible');
        showSavedGames.classList.add('visible');
      }
    };
  
    if (button) {
      button.addEventListener('click', handleClick);
    }
  
    // Clean up the event listener when the component is unmounted
    return () => {
      if (button) {
        button.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // if (hide) {
  //   return null;
  // }

  return (
    <div className={`LobbySignInSignUpButton ${isGuest ? 'hide' : ''}`}>
      {showSignUp ? (
        <div>
          <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Enter Username" />
          <input type="password" ref={passwordRef} placeholder="Enter Password" />
          <br />
          
          {/* <button onClick={() => setShowSignUp(false)}>Exit</button> */}
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ): <div>
        <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Enter Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Password" />  
        {/* <button onClick={() => setShowSignIn(false)}>Exit</button> */}
        {errorMessage && <p>{errorMessage}</p>}
      </div>
      }
      {showSignIn ? (
        <div>
          <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <br />
          
          {/* <button onClick={() => setShowSignIn(false)}>Exit</button> */}
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
          <button className='continue-as-guest-button' onClick={handleContinueAsGuest}>Continue as Guest</button>
        </div>
      )}
    </div>
  );
};

export default LobbySignInSignUpButton;