const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

const createUser = async (username, password) => {
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByUsername = async (username) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

const saveGame = async (userId, gameState, name) => {
  try {
    const result = await pool.query(
      'INSERT INTO savedGames (user_id, gameState, name) VALUES ($1, $2, $3) RETURNING *',
      [userId, JSON.stringify(gameState), name]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

const getSavedGames = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM savedGames WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting saved games:', error);
    throw error;
  }
};

const deleteGame = async (gameId, userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM savedGames WHERE id = $1 AND user_id = $2 RETURNING *',
      [gameId, userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByUsername,
  saveGame,
  getSavedGames,
  deleteGame
};