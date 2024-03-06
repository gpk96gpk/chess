//TODO:
// take username from LobbySignInButtons
// render button component
//on button click display overlay with list of saved games
//list of saved games with columns (username1 and username2's game), date, load button, delete button 
//load button will trigger db query from the database and render the game page with the 
//saved game state using react router link gameState from server passed to game page

import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getSavedGames, deleteGame } from '../apis/ChessGame';
import { SocketContext } from "../context/SocketContext";

interface Game {
  id: number;
  username1: string;
  username2: string;
  date: string;
}

const LobbySavedGames = ({ username, setGameState }: { username: string }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [showGames, setShowGames] = useState(false);
  const socket = useContext(SocketContext);
  
  useEffect(() => {
    const fetchGames = async () => {
      if (games.length === 0) {
        const savedGames = await getSavedGames();
        if (Array.isArray(savedGames.games)) {
          setGames(savedGames);
        } else {
          console.log(savedGames); // Log the message
        }
      }
    };
  
    fetchGames();
  }, [username, games]);

  const handleDeleteGame = async (gameId: number) => {
    await deleteGame(gameId);
    setGames(games.filter(game => game.id !== gameId));
  };
  console.log('games', games);

  return (
    <div>
      <button onClick={() => setShowGames(!showGames)}>Show Saved Games</button>
      {showGames && (
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