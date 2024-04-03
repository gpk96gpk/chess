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
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
}

const LobbySignInSignUpButton = ({ setUsername }: LobbySignInSignUpButtonProps) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  //const [hide, setHide] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    let signUpPassword = '';
    signUpPassword = passwordRef.current ? passwordRef.current.value : password;
    setPassword(signUpPassword);
    const token = await signUp(inputUsername, password);
    if (token) {
      localStorage.setItem('jwt', token);
      // Sign in the user after successful sign up
      signIn(inputUsername, password).then((signInResult) => {
        if (signInResult) {
          setUsername(inputUsername);
          setShowSignUp(false);
          setShowSignIn(false);
          navigate(`/lobby/${inputUsername}`);
          setShowSignIn(true);
          handleContinueAsGuest();
          const element: HTMLElement | null = document.querySelector('.ConnectionManager');
          const showSavedGames = document.querySelector('.show-saved-games-button') as HTMLElement;
          if (element) {
            element.classList.add('visible');
            showSavedGames.classList.add('visible');

          }
        }
      });
    } else {
      setErrorMessage('');
      setTimeout(() => setErrorMessage('Incorrect username or password'), 0); // Set errorMessage after a delay
    }
  };

  const handleSignIn = async () => {
    const token = await signIn(inputUsername, password);
    if (token) {
      localStorage.setItem('jwt', token);
      setUsername(inputUsername); // Set the username here
      setPassword(password);
      setShowSignUp(false);
      setShowSignIn(false);
      setIsGuest(true);
      // navigate(`/lobby/${inputUsername}`);
      console.log('username', inputUsername); 
      setIsSignedIn(true); // Update the sign-in status
      handleContinueAsGuest();
    } else {
      setErrorMessage('');
      setTimeout(() => setErrorMessage('Incorrect username or password'), 0); // Set errorMessage after a delay
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
  
    // If the user is signed in, update the visibility
    if (isSignedIn && element && showSavedGames) {
      element.classList.add('visible');
      showSavedGames.classList.add('visible');
    }
  
    // Clean up the event listener when the component is unmounted
    return () => {
      if (button) {
        button.removeEventListener('click', handleClick);
      }
    };
  }, [isSignedIn]);

  // if (hide) {
  //   return null;
  // }

  return (
    <div className={`LobbySignInSignUpButton ${isGuest ? 'hide' : ''}`}>
      {showSignUp ? (
        <div>
          <input type="text" className={errorMessage ? 'error' : ''} value={inputUsername} onChange={e => setInputUsername(e.target.value)} onAnimationEnd={e => e.currentTarget.classList.remove('error')}
 placeholder="Enter Username" />
          <input type="password" className={errorMessage ? 'error' : ''} ref={passwordRef} placeholder="Enter Password" />
          <br />
          
          {/* <button onClick={() => setShowSignUp(false)}>Exit</button> */}
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ): <div>
        <input type="text" className={errorMessage ? 'error' : ''} value={inputUsername} onChange={e => setInputUsername(e.target.value)} onAnimationEnd={e => e.currentTarget.classList.remove('error')}
 placeholder="Enter Username" />
        <input type="password" className={errorMessage ? 'error' : ''} value={password} onChange={e => setPassword(e.target.value)} onAnimationEnd={e => e.currentTarget.classList.remove('error')}
 placeholder="Enter Password" />  
        {/* <button onClick={() => setShowSignIn(false)}>Exit</button> */}
      </div>
      }
      {showSignIn ? (
        <div>
          <input type="text" className={errorMessage ? 'error' : ''} value={inputUsername} onChange={e => setInputUsername(e.target.value)} onAnimationEnd={e => e.currentTarget.classList.remove('error')}
 placeholder="Username" />
          <input type="password" className={errorMessage ? 'error' : ''} value={password} onChange={e => setPassword(e.target.value)} onAnimationEnd={e => e.currentTarget.classList.remove('error')}
 placeholder="Password" />
          <br />
          
          {/* <button onClick={() => setShowSignIn(false)}>Exit</button> */}
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ) : (
        <div>
          <button className='signInButton' onClick={handleSignIn}>Sign In</button>
          <button className='signUp' onClick={handleSignUp}>Sign Up</button>
          <button className='continue-as-guest-button' onClick={handleContinueAsGuest}>Continue as Guest</button>
        </div>
      )}
    </div>
  );
};

export default LobbySignInSignUpButton;