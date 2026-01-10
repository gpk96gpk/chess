const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { Pool } = require('pg');
require('dotenv').config();

// Create a database connection
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'chess_test',
  password: process.env.PGPASSWORD || 'password',
  port: parseInt(process.env.PGPORT || '5432')
});

describe('Chess Server Integration Tests', () => {
  let io, clientSocket;
  let httpServer;
  let port;
  
  beforeAll((done) => {
    // Setup test server
    httpServer = createServer();
    port = 4000; // Another port for integration tests
    io = new Server(httpServer);
    
    // Import socket handlers with database connection
    require('../server')(io);
    
    httpServer.listen(port, () => {
      // Create test database tables
      pool.query(`
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
      `).then(() => done());
    });
  });
  
  afterAll(async () => {
    // Clean up
    await pool.query(`
      DROP TABLE IF EXISTS savedGames;
      DROP TABLE IF EXISTS users;
    `);
    await pool.end();
    io.close();
    httpServer.close();
  });
  
  beforeEach((done) => {
    // Create fresh client connection
    clientSocket = Client(`http://localhost:${port}`);
    
    clientSocket.on('connect', () => {
      done();
    });
  });
  
  afterEach(() => {
    // Disconnect client
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });
  
  test('should save a game and load it later', (done) => {
    // Register a test user first
    const username = 'integrationuser';
    const password = 'testpassword';
    
    clientSocket.emit('register', { username, password });
    
    clientSocket.on('registerSuccess', (userId) => {
      expect(userId).toBeDefined();
      
      // Create a game
      const roomCode = '1234';
      clientSocket.emit('createRoom', roomCode);
      
      // Save the game
      clientSocket.emit('saveGame', { 
        userId, 
        gameState: { board: [], turn: 'white' },
        name: 'Integration Test Game'
      });
      
      clientSocket.on('gameSaved', (result) => {
        expect(result.success).toBe(true);
        
        // Load the saved game
        clientSocket.emit('loadSavedGames', userId);
        
        clientSocket.on('savedGames', (games) => {
          expect(games.length).toBeGreaterThan(0);
          expect(games[0].name).toBe('Integration Test Game');
          done();
        });
      });
    });
  });
  
  test('should handle game state updates between players', (done) => {
    // Create two clients
    const client1 = Client(`http://localhost:${port}`);
    const client2 = Client(`http://localhost:${port}`);
    
    // Wait for both to connect
    client1.on('connect', () => {
      client2.on('connect', () => {
        const roomCode = '5678';
        
        // First player creates room
        client1.emit('createRoom', roomCode);
        
        // Listen for room creation
        client1.on('createRoom', (code) => {
          expect(code).toBe(roomCode);
          
          // Second player joins
          client2.emit('joinRoom', roomCode);
          
          // Listen for game state on second client
          client2.on('gameState', (gameState) => {
            if (gameState && gameState.testValue) {
              expect(gameState.testValue).toBe('test123');
              
              // Clean up
              client1.disconnect();
              client2.disconnect();
              done();
            }
          });
          
          // After a short delay, first client sends game state
          setTimeout(() => {
            client1.emit('gameState', { testValue: 'test123' }, roomCode);
          }, 100);
        });
      });
    });
  });
});