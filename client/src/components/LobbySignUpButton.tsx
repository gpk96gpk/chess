// import { useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { signUp, signIn } from '../apis/ChessGame';

// interface LobbySignInSignUpButtonProps {
//   username: string;
//   setUsername: React.Dispatch<React.SetStateAction<string>>;
// }

// const LobbySignUpButton = ({ setUsername }: LobbySignInSignUpButtonProps) => {
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [inputUsername, setInputUsername] = useState('');
//   const passwordRef = useRef<HTMLInputElement>(null);
//   const [errorMessage, setErrorMessage] = useState('');
//   const navigate = useNavigate();

//   const handleSignUp = async () => {
//     const password = passwordRef.current ? passwordRef.current.value : '';
//     const token = await signUp(inputUsername, password);
//     if (token) {
//       localStorage.setItem('jwt', token);
//       setUsername(inputUsername);
//       setShowSignUp(false);
//       navigate(`/lobby/${inputUsername}`);
//       // Sign in the user after successful sign up
//       const signInResult = await signIn(inputUsername, password);
//       if (signInResult) {
//         // Sign in was successful, do something here
//       } else {
//         // Sign in failed, handle error here
//       }
//     } else {
//       setErrorMessage('Failed to create account');
//     }
//   };

//   return (
//     <div>
//       {showSignUp ? (
//         <div>
//           <input type="text" value={inputUsername} onChange={e => setInputUsername(e.target.value)} placeholder="Username" />
//           <br />
//           <input type="password" ref={passwordRef} placeholder="Password" />
//           <br />
//           <button onClick={handleSignUp}>Sign Up</button>
//           {/* <button onClick={() => setShowSignUp(false)}>Exit</button> */}
//           {errorMessage && <p>{errorMessage}</p>}
//         </div>
//       ) : (
//         <button onClick={() => setShowSignUp(true)}>Sign Up</button>
//       )}
//     </div>
//   );
// };

// export default LobbySignUpButton;