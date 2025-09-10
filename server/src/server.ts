// set up cors socket and express

//initialize cors socket  and express

//initialize players and rooms

//set up socket io connection

//set up event listeners get other players socket id 
//store in otherPlayersSocketId const
//emit to otherPlayersSocketId the following using io.to
//create room
//join room
//leave room
//error handling
//gameState
//gameOver
//reset

//set up database routes
//POST the input username from form to server and check if the username exists in the database
//if username exists, check if the password matches and if it does, send back a token
//if username does not exist send error message
//POST for creating a new user and password
//POST for saving a game to a user
//GET for the list of saved games for a user
//GET selected saved game for a user
//DELETE for deleting a saved game for a user
declare global {
    namespace Express {
      interface Request {
        user: { userId: string };
      }
    }
  }

//   import * as dotenv from 'dotenv';
//   dotenv.config();
  
//   console.log('===== DB CONNECTION DETAILS =====');
//   console.log('PGHOST:', process.env.PGHOST);
//   console.log('PGUSER:', process.env.PGUSER);
//   console.log('PGPASSWORD:', process.env.PGPASSWORD);
//   console.log('PGDATABASE:', process.env.PGDATABASE);
//   console.log('PGPORT:', process.env.PGPORT);
//   console.log('================================');
import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createServer } from "http";
import { Server, Socket } from 'socket.io';
import { GameStateType, PieceColor, PlayerNumber, SocketTypes } from '../types/serverTypes';
import { Request, Response, NextFunction } from 'express';

const db = require('./db')



interface PlayerInfo {
    roomCode: string;
    playerNumber: number;
}


const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions))

const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, process.env.JWT_SECRET!, (err, user: string | JwtPayload | undefined) => {
        if (err) {
          return res.sendStatus(403);
        }
      
        if (typeof user === 'object' && user !== null && 'userId' in user) {
          req.user = { userId: user.userId };
          next();
        } else {
          res.sendStatus(401);
        }
      });
    } else {
      res.sendStatus(401);
    }
}
//SERVER ROUTES
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//Sign in for users
app.post("/api/v1/chess/users/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (user.rows.length > 0) {
            const passwordMatch = await bcrypt.compare(password, user.rows[0].password);

            if (passwordMatch) {
                const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET!);

                res.status(200).json({
                    status: "success",
                    data: {
                        username: user.rows[0].username,
                        token
                    }
                });
            } else {
                res.status(401).json({
                    status: "error",
                    message: "Invalid password"
                });
            }
        } else {
            res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Create a new user and password
app.post("/api/v1/chess/users/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (user.rows.length > 0) {
            res.status(400).json({
                status: "error",
                message: "Username already exists"
            });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db.query(
                "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
                [username, hashedPassword]
            );

            const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET!);

            res.status(201).json({
                status: "success",
                data: {
                    username: newUser.rows[0].username,
                    token
                }
            });
        }
    } catch (err) {


        console.error(err);
        res.status(500).json({
            status: "error xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            message: "An error occurred while processing your request" + err,
            error: err,
        });
    }
});

//Save a game to a user
app.post("/api/v1/chess/games/save", authenticateJWT, async (req, res) => {
    try {
        const { gameState } = req.body;
        const { user } = req;

        const savedGame = await db.query(
            "INSERT INTO savedGames (userid, gameState) VALUES ($1, $2) RETURNING *",
            [user.userId, JSON.stringify(gameState)]
        );

        res.status(201).json({
            status: "success",
            data: {
                game: savedGame.rows[0]
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Update a saved game for a user
app.put("/api/v1/chess/games/:gameId", authenticateJWT, async (req, res) => {
    try {
        const { user } = req;
        const { gameId } = req.params;
        const { gameData } = req.body; // assuming the updated game data is sent in the request body

        const updatedGame = await db.query(
            "UPDATE savedGames SET data = $1 WHERE userid = $2 AND id = $3 RETURNING *",
            [gameData, user.userId, gameId]
        );

        if (updatedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: updatedGame.rows[0]
                }
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Get the list of saved games for a user
app.get("/api/v1/chess/games", authenticateJWT, async (req, res) => {
    try {
        const { user } = req;

        const savedGames = await db.query(
            "SELECT * FROM savedGames WHERE userid = $1",
            [user.userId]
        );

        res.status(200).json({
            status: "success",
            data: {
                games: savedGames.rows
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Get selected saved game for a user
app.get("/api/v1/chess/games/:gameId", authenticateJWT, async (req, res) => {
    try {
        const { user } = req;
        const { gameId } = req.params;

        const savedGame = await db.query(
            "SELECT * FROM savedGames WHERE userid = $1 AND id = $2",
            [user.userId, gameId]
        );

        if (savedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: savedGame.rows[0]
                }
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Delete a saved game for a user
app.delete("/api/v1/chess/games/:gameId", authenticateJWT, async (req, res) => {
    try {
        const { user } = req;
        const { gameId } = req.params;

        const deletedGame = await db.query(
            "DELETE FROM savedGames WHERE userid = $1 AND id = $2 RETURNING *",
            [user.userId, gameId]
        );

        if (deletedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: deletedGame.rows[0]
                }
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});



const io = new Server<SocketTypes>(httpServer, {
    cors: {
      origin: ['https://api.chessbygeorge.com', 'https://www.chessbygeorge.com', 'http://localhost:5173'],
      methods: ["GET", "POST"]
    }
});
//httpServer.listen(3004);



// app.use(authenticateJWT);

//app.use(express.json())

let players: { [socketId: string]: PlayerInfo } = {};
let rooms: { [key: string]: string[] } = {};
let roomStates: { [roomCode: string]: GameStateType } = {};
let roomTurnStates: { [roomCode: string]: 0 | 1 | 2 | 3 } = {};
let lastKnownTurnStates: { [roomCode: string]: 0 | 1 | 2 | 3 } = {};

const getAvailableRooms = () => {
    return Object.keys(rooms).map(roomCode => ({
        roomCode,
        players: rooms[roomCode].filter(id => id !== '').length,
        maxPlayers: 2
    }));
};

const broadcastAvailableRooms = () => {
    io.emit('availableRooms', getAvailableRooms());
};

// Periodically clean up empty rooms and broadcast updates
setInterval(() => {
    Object.keys(rooms).forEach(roomCode => {
        rooms[roomCode] = rooms[roomCode].filter(id => id !== '');

        if (rooms[roomCode].length === 0) {
            delete rooms[roomCode];
            delete roomStates[roomCode];
            delete roomTurnStates[roomCode];
        }
    });

    broadcastAvailableRooms();
}, 5000);



//SOCKET LISTENERS AND EMITTERS
io.on('connection', (socket: Socket) => {
    //Create a room
    socket.on('createRoom', (roomCode:string, gameState?:GameStateType) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        rooms[roomCode].push(socket.id);
        const playerNumber = 1;
        players[socket.id] = { roomCode, playerNumber };
        console.log('players', players, roomCode, playerNumber)
        socket.emit('playerNumber', playerNumber);
        socket.emit('gameState', gameState)
        socket.emit('createRoom', roomCode)
        roomStates[roomCode] = gameState!;
        if (roomTurnStates[roomCode] === undefined) {
            roomTurnStates[roomCode] = gameState && gameState.turn === 'white' ? 2 : 1;
        }
        // Do not allow moves until two players are present
        socket.emit('turn', rooms[roomCode].length < 2 ? 0 : roomTurnStates[roomCode]);

    });
    //Join a room
    socket.on('joinRoom', (roomCode:string) => {
        console.log('rooms', rooms, roomCode, rooms[roomCode], socket.id)
        if (!rooms[roomCode] || (rooms[roomCode] && rooms[roomCode].length === 0) || roomCode === '' || roomCode === null) {
            socket.emit('roomError', 'The room is empty.');
            console.log('The room is empty.');
            return;
        }
        socket.join(roomCode);

        // Clean up empty slots
        if (rooms[roomCode]) {
            rooms[roomCode] = rooms[roomCode].filter(id => id !== '');
        }
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        
        // Determine player number BEFORE pushing to the room
        let playerNumber: number;
        
        if (rooms[roomCode].length === 0) {
            playerNumber = 1;
        } else if (rooms[roomCode].length === 1) {
            const existingPlayer = rooms[roomCode][0];
            if (players[existingPlayer]) {
                playerNumber = players[existingPlayer].playerNumber === 1 ? 2 : 1;
            } else {
                playerNumber = 2; // Default to player 2 if joining an existing room
            }
        } else {
            socket.emit('roomError', 'Room is full.');
            return;
        }
        
        // Set player info BEFORE adding to room
        players[socket.id] = { roomCode, playerNumber };
        
        // Now add to room
        rooms[roomCode].push(socket.id);
        
        console.log('players', players, roomCode)
        console.log('rooms', rooms, roomCode, rooms[roomCode], socket.id)
        
        socket.emit('playerNumber', playerNumber);
        socket.emit('gameState', roomStates[roomCode]);
        
        // FIXED: Restore previous turn state when both players are present
        if (rooms[roomCode].length < 2) {
            // Waiting for second player
            io.to(roomCode).emit('turn', 0);
        } else {
            // Both players present - prioritize restoring the previous turn state
            
            // Try to get the last known turn state first (before disconnect)
            let currentTurn = lastKnownTurnStates[roomCode];
            console.log(`Found saved turn state for room ${roomCode}:`, currentTurn);
            
            if (currentTurn === undefined) {
                // Fall back to current room turn state
                currentTurn = roomTurnStates[roomCode];
                
                if (currentTurn === undefined && roomStates[roomCode]) {
                    // Derive from game state if needed
                    currentTurn = roomStates[roomCode].turn === 'black' ? 1 : 2;
                } else if (currentTurn === undefined) {
                    // Last resort fallback
                    currentTurn = 1;
                }
            } else {
                // We found a saved turn state, so use it and clear from storage
                console.log(`Restoring saved turn state ${currentTurn} for room ${roomCode}`);
                delete lastKnownTurnStates[roomCode];
            }
            
            // Store the final turn state
            roomTurnStates[roomCode] = currentTurn;
            
            // IMPORTANT: Emit to ALL players in the room to ensure consistency
            console.log('Emitting turn state:', currentTurn, 'for room:', roomCode);
            io.to(roomCode).emit('turn', currentTurn);
        }
    });
    //Load save game
    socket.on('loadSaveGame', (roomCode:string) => {
        //console.log(rooms[roomCode], roomCode, roomStates[roomCode])
        if (rooms[roomCode]) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('loadSaveGame', roomCode, roomStates[roomCode]);
            console.log('emitted load game to host')
            // Sync turn state from saved game and broadcast to both players
            const saved = roomStates[roomCode];
            let currentTurn = lastKnownTurnStates[roomCode];
            console.log(`Found saved turn state for room ${roomCode}:`, currentTurn);
            
            if (currentTurn === undefined) {
                // Fall back to current room turn state
                currentTurn = roomTurnStates[roomCode];
                
                if (currentTurn === undefined && roomStates[roomCode]) {
                    // Derive from game state if needed
                    currentTurn = roomStates[roomCode].turn === 'black' ? 1 : 2;
                } else if (currentTurn === undefined) {
                    // Last resort fallback
                    currentTurn = 1;
                }
            } else {
                // We found a saved turn state, so use it and clear from storage
                console.log(`Restoring saved turn state ${currentTurn} for room ${roomCode}`);
                delete lastKnownTurnStates[roomCode];
            }
            if (saved && saved.turn) {
                //roomTurnStates[roomCode] = saved.turn === 'white' ? 2 : 1;
                io.to(roomCode).emit('turn', currentTurn);
                console.log('emitted turn state from saved game', currentTurn)
            }
        } else {
            console.log(`No moves have been made in room with room code ${roomCode}`);
        }
    });
    //Turn
    socket.on('turn', (playerTurn: 0 | 1 | 2, roomCode: string) => {
        const player = players[socket.id];

        const roomPlayers = rooms[roomCode] || [];

        // If fewer than two players are in the room, no one can move
        if (roomPlayers.filter(id => id !== '').length < 2) {
            socket.emit('turn', 0);
            return;
        }

        if (playerTurn !== 0) {
            // Ignore attempts from a player to set the turn to themselves.
            if (!player || player.playerNumber === playerTurn) {
                // Send the correct turn state back to the sender without
                // altering the stored turn.
                socket.emit('turn', roomTurnStates[roomCode] ?? playerTurn);
                return;
            }
            roomTurnStates[roomCode] = playerTurn;
        }
        const otherPlayerSocketId = roomPlayers.filter(id => id !== socket.id);
        io.to(otherPlayerSocketId).emit('turn', playerTurn as any);
        console.log('turn', roomCode, playerTurn)
    });
    //Leave a room
    socket.on('leaveRoom', (roomCode:string) => {
        if (rooms[roomCode] && Array.isArray(rooms[roomCode])) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('leaveRoom');
            io.to(otherPlayerSocketId).emit('turn', 0 as any);
            console.log(`Player with socket ID ${otherPlayerSocketId} has left room with room code ${roomCode}`)
        }
        socket.leave(roomCode);
        if (rooms[roomCode]) {
            const index = rooms[roomCode].indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].splice(index, 1);
            }
            if (rooms[roomCode].length === 0) {
                delete rooms[roomCode];
                delete roomStates[roomCode];
                delete roomTurnStates[roomCode];
            }
        }
        delete players[socket.id];
    });
    //Error handling
    socket.on('error', (error: Error) => {
        console.error('Socket.IO error:', error);
    });
    //Game state
    socket.on('gameState', (gameState: GameStateType, roomCode:string) => {
        if (rooms[roomCode]) {
            // Persist the latest state so newcomers receive up-to-date boards
            roomStates[roomCode] = gameState;

            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('gameState', gameState);
        } else {
            console.log(`No moves have been made in room with room code ${roomCode}`);
        }

        //console.log(roomStates);

    });
    //Game over
    socket.on('gameOver', (isGameOver: boolean, winner: PieceColor, roomCode:string) => {
        const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
        io.to(otherPlayerSocketId).emit('gameOver', {winner, isGameOver});
        console.log('gameOver', roomCode, winner, isGameOver)
      });
    //Reset
    socket.on('reset', () => {
        const roomCode = players[socket.id].roomCode;
        io.to(roomCode).to(socket.id).emit('reset');
        if (rooms[roomCode]) {
          const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
          io.to(otherPlayerSocketId).to(socket.id).emit('reset');
        }
    });
    //Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        const player = players[socket.id];
        console.log('disconnected player', player)
        if (player) {
            const roomCode = player.roomCode;
            
            // STORE THE CURRENT TURN STATE before emitting waiting state
            if (roomTurnStates[roomCode] !== undefined && roomTurnStates[roomCode] > 0) {
                lastKnownTurnStates[roomCode] = roomTurnStates[roomCode];
                console.log(`Saved turn state ${lastKnownTurnStates[roomCode]} for room ${roomCode}`);
            }
            
            // Just emit 0 to indicate waiting state, but don't change roomTurnStates
            socket.broadcast.to(roomCode).emit('turn', 0);
            
            // Rest of existing disconnect code...
            if (rooms[roomCode]) {
                const playerIndex = rooms[roomCode].indexOf(socket.id);
                if (playerIndex !== -1) {
                    rooms[roomCode].splice(playerIndex, 1);
                }
                
                rooms[roomCode] = rooms[roomCode].filter(id => id !== '');
                
                if (rooms[roomCode].length === 0) {
                    delete rooms[roomCode];
                    delete roomStates[roomCode];
                    delete roomTurnStates[roomCode];
                    // NOTE: We intentionally DON'T delete lastKnownTurnStates[roomCode]
                    console.log(`Room ${roomCode} deleted because it's empty`);
                }
            }
            
            // Remove the player from players object
            delete players[socket.id];
        }
    });
    //Request available rooms
    socket.on('requestAvailableRooms', () => {
        socket.emit('availableRooms', getAvailableRooms());
    });
});



// process.env.PORT is used to get the port from the .env file 
// or 3001 if it doesn't exist
const PORT = process.env.PORT || 3005
// app.listen is used to start the server on the port from the .env file
app.listen(PORT, () => {
    console.log(`Authentication server running on PORT ${PORT}`)
})

httpServer.listen(3004, () => {
    console.log('socket server running at localhost/:3004');
  });
// httpServer.listen(3004, '0.0.0.0', () => {
//     console.log('socket server running at http://34.224.30.160/:3004');
// });
  
httpServer.on('error', (err) => {
    process.exit(1);
    console.error(`Server error: ${err}`);
    httpServer.close(() => {
        console.log('Socket Server stopped due to an error');
    });
});