//TODO:
// component with try catch to make POST request to save game
// takes in gameState playerTurn and player1 and player2 usernames as props
//render button to trigger function for POST request
import { useState } from 'react';
import { saveGame } from '../apis/ChessGame';
import { BoardSaveGameButtonProps } from '../types/clientTypes';


const BoardSaveGameButton: React.FC<BoardSaveGameButtonProps> = ({ gameState }) => {
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const handleSave = async () => {
        const success = await saveGame(gameState);
        if (success) {
            setSaveStatus('Game saved successfully');
        } else {
            setSaveStatus('Failed to save game');
        }
    };

    return (
        <div>
            <button onClick={handleSave}>Save</button>
            {saveStatus && <p>{saveStatus}</p>}
        </div>
    );
};

export default BoardSaveGameButton;
















