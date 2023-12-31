//TODO:
//render 2 buttons
// exit button to open overlay asking are you sure you want to leave
//in that overlay render a button yes im sure and cancel
// im sure button is a react router link to the home page
//cancel button closes the overlay

//save button that will pass the gameState and playerTurn 
//to the server as variables for PSQL db query with a unique
//key  and usernames of both players if a plyer doesn't have username saved as guest
//for the game that key can then be rendered in SavedGames.tsx
//with a react router link to the game page with the saved game state

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from "../context/SocketContext";
import BoardSaveGameButton from './BoardSaveGameButton';
import { BoardButtonsProps } from '../types/clientTypes';

const BoardButtons: React.FC<BoardButtonsProps> = ({ gameState }) => {
  const socket = useContext(SocketContext);
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const navigate = useNavigate();

  const handleExit = () => {
    setShowExitOverlay(true);
  };

  const handleConfirmExit = () => {
    navigate('/');
    if (socket) {
      socket.emit('leaveRoom')
    }
  };

  return (
    <div>
      <button onClick={handleExit}>Exit</button>
      {/* <button onClick={handleSave}>Save</button> */}
      <BoardSaveGameButton gameState={gameState} />

      {showExitOverlay && (
        <div>
          <p>Are you sure you want to leave?</p>
          <button onClick={handleConfirmExit}>Yes, I'm sure</button>
          <button onClick={() => setShowExitOverlay(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default BoardButtons;