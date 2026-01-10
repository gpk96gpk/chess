const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

describe('Chess Server Socket.IO Tests', () => {
  let io, serverSocket, clientSocket, clientSocket2;
  let httpServer;
  let port;
  
  beforeAll((done) => {
    // Setup test server
    httpServer = createServer();
    port = 3999; // Use a different port for tests
    io = new Server(httpServer);
    
    // Import socket handlers (adjust path as needed)
    require('../server')(io);
    
    httpServer.listen(port, () => {
      // Setup is complete
      done();
    });
  });
  
  afterAll(() => {
    // Cleanup
    io.close();
    httpServer.close();
  });
  
  beforeEach((done) => {
    // Create fresh client connections for each test
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket2 = Client(`http://localhost:${port}`);
    
    clientSocket.on('connect', () => {
      clientSocket2.on('connect', () => {
        done();
      });
    });
  });
  
  afterEach(() => {
    // Disconnect clients after each test
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    if (clientSocket2.connected) {
      clientSocket2.disconnect();
    }
  });
  
  test('should create a room and assign player number 1', (done) => {
    const roomCode = uuidv4().substring(0, 4);
    
    clientSocket.on('playerNumber', (playerNumber) => {
      expect(playerNumber).toBe(1);
      done();
    });
    
    clientSocket.emit('createRoom', roomCode);
  });
  
  test('should allow a second player to join and assign player number 2', (done) => {
    const roomCode = uuidv4().substring(0, 4);
    
    clientSocket.emit('createRoom', roomCode);
    
    // Wait for the room to be created
    setTimeout(() => {
      clientSocket2.emit('joinRoom', roomCode);
      
      clientSocket2.on('playerNumber', (playerNumber) => {
        expect(playerNumber).toBe(2);
        done();
      });
    }, 100);
  });
  
  test('should broadcast game state to other player', (done) => {
    const roomCode = uuidv4().substring(0, 4);
    const mockGameState = {
      board: Array(8).fill(Array(8).fill(null)),
      turn: 'white'
    };
    
    // First player creates a room
    clientSocket.emit('createRoom', roomCode);
    
    setTimeout(() => {
      // Second player joins
      clientSocket2.emit('joinRoom', roomCode);
      
      // Listen for game state on second client
      clientSocket2.on('gameState', (gameState) => {
        // First player sends game state
        if (gameState) {
          expect(gameState).toBeDefined();
          done();
        }
      });
      
      // First player sends game state update
      setTimeout(() => {
        clientSocket.emit('gameState', mockGameState, roomCode);
      }, 100);
    }, 100);
  });
  
  test('should handle player disconnection', (done) => {
    const roomCode = uuidv4().substring(0, 4);
    
    // First player creates a room
    clientSocket.emit('createRoom', roomCode);
    
    setTimeout(() => {
      // Second player joins
      clientSocket2.emit('joinRoom', roomCode);
      
      // Second player listens for disconnect event
      clientSocket2.on('turn', (turnState) => {
        expect(turnState).toBe(0); // 0 indicates disconnect
        done();
      });
      
      // First player disconnects
      clientSocket.disconnect();
    }, 100);
  });
});