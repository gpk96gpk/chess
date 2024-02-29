//TODO:
//render 2 button and 1 inputs
//Button will be a react router link to the game page with 
//unique game key for saves and socket room Code
//Input for Join Game will be a react router link and socket join room for game
//Button for Load Game will Load saved games from data base and render a list of games SavedGames.tsx
//pass username to SavedGames.tsx
//that list of games will be rendered as buttons that will be react router links to the game page
//when that page loads it will pull the game from the database and render the game page with gameState
//and player turn with a roomCode another player can use to join the game
//that will load a game from the database and render the game page
//with the saved game state and player turn

import ConnectionManager from "./ConnectionManager";
import LobbySavedGames from "./LobbySavedGames";


const LobbyGameButtons = ({ username }: { username: string }) => {

return (
    <>
        <ConnectionManager />
        <LobbySavedGames username={username}/>
    </>
);
}

export default LobbyGameButtons;