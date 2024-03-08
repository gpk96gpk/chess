//TODO:
//render overlay with 2 buttons
//Reset button will be a react router link to the game page to reset the game state
//Exit button will be a react router link to the lobby page
import { useNavigate } from 'react-router-dom';
import { saveGame } from '../apis/ChessGame';
import { useState, useContext } from 'react';
import { SocketContext } from "../context/SocketContext";
import resetGameState from '../gameLogic/resetGameState';
//import { GameState } from '../types/clientTypes';


function GameOver( {gameState, winner, setWinner, setGameState, setTurnState}) {
    const socket = useContext(SocketContext);
    console.log('winner',winner)
    const [saveStatus, setSaveStatus] = useState<null | string>(null);
    const navigate = useNavigate();
    let headerText = '';
    const handleSave = async () => {
        const success = await saveGame(gameState);
        if (success) {
            setSaveStatus('Game saved successfully');
        } else {
            setSaveStatus('Failed to save game');
        }
    };


    if (!winner) {
        headerText = 'Opponent disconnected would you like to save the game?';
    } else {
        headerText = `Game Over ${winner} wins!`;
    }

    const handleExit = () => {
        const { initialBoard } = resetGameState()
        gameState = initialBoard;
        setGameState(initialBoard);
        setWinner(null);
        setTurnState(1);
        navigate('/');
        if (socket) {
            socket.emit('leaveRoom')
        }
    };

    return (
        <div>
            <h1>{headerText}</h1>
            {!winner && <button onClick={handleSave}>Save</button>}
            <button onClick={handleExit}>Exit to Lobby</button>
            {saveStatus && <p>{saveStatus}</p>}
        </div>
    );
}

export default GameOver;