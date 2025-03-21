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
  games: Game[] | string;
}

interface LobbySavedGamesProps {
  setGameState: Dispatch<SetStateAction<GameStateType>>;
  username: string | null;
}

const LobbySavedGames = ({ setGameState, username }: LobbySavedGamesProps) => {
  const [games, setGames] = useState<SavedGames | string | null>(null);
  const [showGames, setShowGames] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useContext(SocketContext);
    
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const savedGames: SavedGames = await getSavedGames();
        setGames(savedGames);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchGames();
  }, [username]);

  useEffect(() => {
    const showSavedGamesButton = document.querySelector('.show-saved-games-button');

    const handleClick = () => {
      console.log('games', games);
      if (error || games === 'Error fetching saved games' || (games && typeof games !== 'string' && Array.isArray(games.games) && games.games.length === 0 )) {
        if (showSavedGamesButton) {
          showSavedGamesButton.classList.add('error');
          showSavedGamesButton.addEventListener('animationend', () => {
            showSavedGamesButton.classList.remove('error');
          });
        }
      } else {
        setShowGames(!showGames);
        if (showSavedGamesButton) {
          showSavedGamesButton.classList.remove('error');
        }
      }
    };

    if (showSavedGamesButton) {
      showSavedGamesButton.addEventListener('click', handleClick);
    }

    // Clean up the event listener when the component is unmounted
    return () => {
      if (showSavedGamesButton) {
        showSavedGamesButton.removeEventListener('click', handleClick);
      }
    };
  }, [error, games, showGames]);

    const handleDeleteGame = async (gameId: number) => {
      await deleteGame(gameId);
      if (games && typeof games !== 'string') {
        setGames({
          games: (games.games as Game[]).filter((game: Game) => game.id !== gameId)
        });
      }
    };

    return (
      <div>
        <button className={`show-saved-games-button ${error ? 'error' : ''}`}>Show Saved Games</button>
        {showGames && games && typeof games !== 'string' && games.games && (
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
                {(games.games as Game[]).map((game: Game) => (
                <tr key={game.id}>
                  <td>{game.username1 || 'guest'} and {game.username2 || 'guest'}'s game</td>
                  <td>{game.date}</td>
                  <td>
                  <Link
                    to={`/game/${game.id}`}
                    className="btn btn-warning"
                    onClick={() => {
                    const parsedGameState: GameStateType = JSON.parse(game.gamestate);
                    setGameState(parsedGameState);
                    console.log('loading game0', parsedGameState, game.id);
                    if (socket) {
                      // Emit an event to the server to create a new room
                      socket.emit('createRoom', game.id, parsedGameState);
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