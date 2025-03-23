//TODO:
// component with try catch to make POST request to save game
// takes in gameState playerTurn and player1 and player2 usernames as props
//render button to trigger function for POST request
import { useState } from 'react';
import { saveGame } from '../apis/ChessGame';
import { BoardSaveGameButtonProps } from '../types/clientTypes';


const BoardSaveGameButton: React.FC<BoardSaveGameButtonProps> = ({ gameState }) => {
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [buttonClass, setButtonClass] = useState<string>('');    
    
    const handleSave = async () => {
        try {
            const success = await saveGame(gameState);
            if (success) {
                setButtonClass('success');
            } else {
                setButtonClass('error');
            }
            
            // Reset class after animation/display
            setTimeout(() => {
                setButtonClass('');
            }, 2000);
        } catch (err) {
            setSaveStatus('Error saving game');
            setButtonClass('error');
            
            // Reset class after animation/display
            setTimeout(() => {
                setButtonClass('');
            }, 2000);
        }
    };
    return (
        <div>
            <button onClick={handleSave} className={buttonClass}>Save</button>
            {saveStatus && <p className={buttonClass}>{saveStatus}</p>}
        </div>
    );
};

export default BoardSaveGameButton;
















