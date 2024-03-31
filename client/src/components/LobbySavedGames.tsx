//TODO:
// take username from LobbySignInSignUpButton
// render button component
//on button click display overlay with list of saved games
//list of saved games with columns (username1 and username2's game), date, load button, delete button 
//load button will trigger db query from the database and render the game page with the 
//saved game state using react router link gameState from server passed to game page

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getSavedGames, deleteGame } from '../apis/ChessGame';
import { SocketContext } from "../context/SocketContext";
import { Dispatch, SetStateAction } from "react";
import { GameStateType } from '../types/clientTypes';


interface Game {
  id: number;
  username1: string;
  username2: string;
  date: string;
  gamestate: string;
}

interface SavedGames {
  games: Game[];
}

interface LobbySavedGamesProps {
  setGameState: Dispatch<SetStateAction<GameStateType>>;
  username: string;
}

const LobbySavedGames = ({ setGameState, username }: LobbySavedGamesProps) => {
  const [games, setGames] = useState<SavedGames | null>(null);
  const [showGames, setShowGames] = useState(false);
  const socket = useContext(SocketContext);
  
  useEffect(() => {
    const fetchGames = async () => {
      if (!games) {
        const savedGames = await getSavedGames();
        setGames(savedGames);
      }
    };
  
    fetchGames();
  }, [username, games]);

  const handleDeleteGame = async (gameId: number) => {
    await deleteGame(gameId);
    if (games) {
      setGames({
        games: games.games.filter(game => game.id !== gameId)
      });
    }
  };

  console.log('games', games);

  return (
    <div>
      <button className='show-saved-games-button' onClick={() => setShowGames(!showGames)}>Show Saved Games</button>
      {showGames && games && games.games && (
        <table className="table table-hover table-dark">
          <thead>
            <tr>
              <th className="bg-primary" scope='col'>Game</th>
              <th className="bg-primary" scope='col'>Date</th>
              <th className="bg-primary" scope='col'>Load</th>
              <th className="bg-primary" scope='col'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {games.games.map(game => (
              <tr key={game.id}>
                <td>{username} and {game.username2 || 'guest'}'s game</td>
                <td>{game.date}</td>
                <td>
                  <Link
                    to={`/game/${game.id}`}
                    className="btn btn-warning"
                    onClick={() => {
                      setGameState(JSON.parse(game.gamestate));
                      console.log('loading game0', JSON.parse(game.gamestate), game.id)
                      if (socket) {
                        // Emit an event to the server to create a new room
                        socket.emit('createRoom', game.id, JSON.parse(game.gamestate));
                      }
                    }}
                  >
                    Load
                  </Link>
                </td>          
                <td><button onClick={() => handleDeleteGame(game.id)} className="btn btn-danger">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LobbySavedGames;