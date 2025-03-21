const { Pool } = require('pg');
require('dotenv').config();

// Create a test database connection
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'chess_test',
  password: process.env.PGPASSWORD || 'password',
  port: parseInt(process.env.PGPORT || '5432')
});

// Import database functions (adjust path as needed)
const {
  createUser,
  getUserByUsername,
  saveGame,
  getSavedGames,
  deleteGame
} = require('../db/queries');

describe('PostgreSQL Database Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS savedGames (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id),
        gameState JSONB NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        name VARCHAR(255)
      );
    `);
  });
  
  afterAll(async () => {
    // Clean up test database
    await pool.query(`
      DROP TABLE IF EXISTS savedGames;
      DROP TABLE IF EXISTS users;
    `);
    await pool.end();
  });
  
  beforeEach(async () => {
    // Clear tables before each test
    await pool.query('DELETE FROM savedGames;');
    await pool.query('DELETE FROM users;');
  });
  
  test('should create a new user', async () => {
    const username = 'testuser';
    const password = 'testpassword';
    
    const result = await createUser(username, password);
    expect(result.username).toBe(username);
    expect(result.id).toBeDefined();
  });
  
  test('should get user by username', async () => {
    const username = 'testuser2';
    const password = 'testpassword';
    
    await createUser(username, password);
    const user = await getUserByUsername(username);
    
    expect(user).toBeDefined();
    expect(user.username).toBe(username);
  });
  
  test('should save a game', async () => {
    // First create a user
    const username = 'testuser3';
    const password = 'testpassword';
    const user = await createUser(username, password);
    
    // Save a game for this user
    const gameState = {
      board: Array(8).fill(Array(8).fill(null)),
      turn: 'white'
    };
    const gameName = 'Test Game';
    
    const result = await saveGame(user.id, gameState, gameName);
    expect(result.id).toBeDefined();
    expect(result.name).toBe(gameName);
  });
  
  test('should get saved games for a user', async () => {
    // First create a user
    const username = 'testuser4';
    const password = 'testpassword';
    const user = await createUser(username, password);
    
    // Save a couple of games
    const gameState1 = { board: [], turn: 'white' };
    const gameState2 = { board: [], turn: 'black' };
    
    await saveGame(user.id, gameState1, 'Game 1');
    await saveGame(user.id, gameState2, 'Game 2');
    
    // Get saved games
    const games = await getSavedGames(user.id);
    expect(games.length).toBe(2);
    expect(games[0].name).toBe('Game 1');
    expect(games[1].name).toBe('Game 2');
  });
  
  test('should delete a saved game', async () => {
    // First create a user
    const username = 'testuser5';
    const password = 'testpassword';
    const user = await createUser(username, password);
    
    // Save a game
    const gameState = { board: [], turn: 'white' };
    const savedGame = await saveGame(user.id, gameState, 'Game to delete');
    
    // Delete the game
    const result = await deleteGame(savedGame.id, user.id);
    expect(result).toBe(true);
    
    // Verify it's deleted
    const games = await getSavedGames(user.id);
    expect(games.length).toBe(0);
  });
});