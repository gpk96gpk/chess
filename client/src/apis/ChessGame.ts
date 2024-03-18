import axios from 'axios'
import { GameStateType } from '../types/clientTypes';

export const API_URL = 'http://34.224.30.160';
// const API_URL = 'http://localhost:3005';
//axios creates a base url for us to use to not have to repeat the same url over and over again
const axiosInstance = axios.create({
    baseURL: `${API_URL}/api/v1/chess`
});
 
export const saveGame = async (gameState: GameStateType) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axiosInstance.post('/games/save', {
            gameState,
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.status === 'success') {
            console.log('Game saved successfully');
            return true;
        } else {
            console.log('Failed to save game');
            return false;
        }
    } catch (error) {
        console.log('An error occurred while saving the game', error);
        return false;
    }
};

export const signIn = async (username: string, password: string) => {
    try {
        const response = await axiosInstance.post('/users/login', {
            username,
            password,
        });

        if (response.data.status === 'success') {
            console.log('User signed in successfully');
            const token = response.data.data.token;
            localStorage.setItem('jwt', token);
            return token;
        } else {
            console.log('Failed to sign in');
            return null;
        }
    } catch (error) {
        console.log('An error occurred while signing in', error);
        return null;
    }
};
// Get the list of saved games for a user
export const getSavedGames = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axiosInstance.get('/games', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.status === 'success') {
        if (response.data.data.length === 0) {
          return 'No Saved Games';
        } else {
          return response.data.data;
        }
      }
    } catch (error) {
      console.error(error);
      return 'Error fetching saved games';
    }
  };
// Delete a saved game for a user
export const deleteGame = async (gameId: number) => {
    try {
        const response = await axiosInstance.delete(`/games/${gameId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data.game;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Sign up a new user
export const signUp = async (username: string, password: string) => {
    try {
        const response = await axiosInstance.post('/users/register', {
            username,
            password
        });

        // The server should return a token for the new user
        const token = response.data.data.token;

        // Store the token in local storage
        localStorage.setItem('token', token);

        return response.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};