//TODO:
//render overlay with 2 buttons
//Reset button will be a react router link to the game page to reset the game state
//Exit button will be a react router link to the lobby page
import { useNavigate } from 'react-router-dom';
import { saveGame } from '../apis/ChessGame';
import { useState } from 'react';
import { GameState } from '../types/clientTypes';


function GameOver({ gameState, winner }: { gameState: GameState, winner: string | null }) {
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
        navigate('/');
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