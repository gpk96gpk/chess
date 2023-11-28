import axios from 'axios'
import { GameState } from '../types/clientTypes';
//axios creates a base url for us to use to not have to repeat the same url over and over again
export default axios.create({
    //uses this baseURL because all urls will start with this
    baseURL: 'http://localhost:3005/api/v1/chess'
})

export const saveGame = async (gameState: GameState) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post('/games/save', {
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
        const response = await axios.post('/users/login', {
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
        const response = await axios.get(`/api/v1/chess/games`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data.games;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Delete a saved game for a user
export const deleteGame = async (gameId: number) => {
    try {
        const response = await axios.delete(`/api/v1/chess/games/${gameId}`, {
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
        const response = await axios.post('/api/v1/chess/users/register', {
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