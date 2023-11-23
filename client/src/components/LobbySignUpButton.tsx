import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../apis/ChessGame';

const LobbySignUpButton = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const passwordRef = useRef();
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const password = passwordRef.current.value;
    const token = await signUp(username, password);
    if (token) {
      localStorage.setItem('jwt', token);
      setShowSignUp(false);
      navigate(`/lobby/${username}`);
    } else {
      setErrorMessage('Failed to create account');
    }
  };

  return (
    <div>
      {showSignUp ? (
        <div>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" ref={passwordRef} placeholder="Password" />
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={() => setShowSignUp(false)}>Exit</button>
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      ) : (
        <button onClick={() => setShowSignUp(true)}>Sign Up</button>
      )}
    </div>
  );
};

export default LobbySignUpButton;