"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_1 = require("http");
const db = require('./db');
const app = (0, express_1.default)();
const corsOptions = {
    origin: [
        'http://www.chessbygeorge.com.s3-website-us-east-1.amazonaws.com',
        'https://www.chessbygeorge.com',
        'http://localhost:5173',
        'https://api.chessbygeorge.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
const httpServer = (0, http_1.createServer)(app);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Health check endpoints for Elastic Beanstalk
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Database health check
app.get('/health/db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()', []);
        res.status(200).json({
            status: 'healthy',
            database: true
        });
    }
    catch (err) {
        console.error('Database health check error:', err);
        res.status(500).json({
            status: 'error',
            database: false
        });
    }
});
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            if (typeof user === 'object' && user !== null && 'userId' in user) {
                req.user = { userId: user.userId };
                next();
            }
            else {
                res.sendStatus(401);
            }
        });
    }
    else {
        res.sendStatus(401);
    }
};
//SERVER ROUTES
app.get('/', (req, res) => {
    res.send('Hello World!');
});
//Sign in for users
app.post("/api/v1/chess/users/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length > 0) {
            const passwordMatch = await bcrypt_1.default.compare(password, user.rows[0].password);
            if (passwordMatch) {
                const token = jsonwebtoken_1.default.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET);
                res.status(200).json({
                    status: "success",
                    data: {
                        username: user.rows[0].username,
                        token
                    }
                });
            }
            else {
                res.status(401).json({
                    status: "error",
                    message: "Invalid password"
                });
            }
        }
        else {
            res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
    }
    catch (err) {
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
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length > 0) {
            res.status(400).json({
                status: "error",
                message: "Username already exists"
            });
        }
        else {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const newUser = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hashedPassword]);
            const token = jsonwebtoken_1.default.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET);
            res.status(201).json({
                status: "success",
                data: {
                    username: newUser.rows[0].username,
                    token
                }
            });
        }
    }
    catch (err) {
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
        const savedGame = await db.query("INSERT INTO savedGames (userid, gameState) VALUES ($1, $2) RETURNING *", [user.userId, JSON.stringify(gameState)]);
        res.status(201).json({
            status: "success",
            data: {
                game: savedGame.rows[0]
            }
        });
    }
    catch (err) {
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
        const updatedGame = await db.query("UPDATE savedGames SET data = $1 WHERE userid = $2 AND id = $3 RETURNING *", [gameData, user.userId, gameId]);
        if (updatedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: updatedGame.rows[0]
                }
            });
        }
        else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    }
    catch (err) {
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
        const savedGames = await db.query("SELECT * FROM savedGames WHERE userid = $1", [user.userId]);
        res.status(200).json({
            status: "success",
            data: {
                games: savedGames.rows
            }
        });
    }
    catch (err) {
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
        const savedGame = await db.query("SELECT * FROM savedGames WHERE userid = $1 AND id = $2", [user.userId, gameId]);
        if (savedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: savedGame.rows[0]
                }
            });
        }
        else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    }
    catch (err) {
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
        const deletedGame = await db.query("DELETE FROM savedGames WHERE userid = $1 AND id = $2 RETURNING *", [user.userId, gameId]);
        if (deletedGame.rows.length > 0) {
            res.status(200).json({
                status: "success",
                data: {
                    game: deletedGame.rows[0]
                }
            });
        }
        else {
            res.status(404).json({
                status: "error",
                message: "Game not found"
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});
// const io = require('socket.io')(httpServer, {
//     cors: {
//       origin: ['https://api.chessbygeorge.com', 'https://www.chessbygeorge.com', 'http://localhost:5173'],
//       methods: ["GET", "POST", "OPTIONS"],
//       credentials: true
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000
// });
const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*', // More permissive for testing
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
//httpServer.listen(3004);
// In the Route 53 console, locate the hosted zone for chessbygeorge.com.
// Look for an A record or ALIAS record for api.chessbygeorge.com. This record should point to your API Gateway endpoint or the ALB (Application Load Balancer) that's handling your API traffic.
// If you're using API Gateway, the record should be an A record with ALIAS set to Yes, pointing to the API Gateway endpoint.
// If you're using an ALB, the record should be an A record with ALIAS set to Yes, pointing to the ALB DNS name.
// Ensure that the record doesn't have any typos in the subdomain (api) or the main domain (chessbygeorge.com).
// Check that the TTL (Time to Live) is set appropriately. For frequently changing records, a lower TTL (e.g., 300 seconds) is recommended.
// If you're using HTTPS, make sure there's a valid SSL/TLS certificate associated with api.chessbygeorge.com in AWS Certificate Manager.
// app.use(authenticateJWT);
//app.use(express.json())
let players = {};
let rooms = {};
let roomStates = {};
const getAvailableRooms = () => Object.keys(rooms).map(roomCode => ({
    roomCode,
    players: rooms[roomCode].filter(id => id !== '').length,
    maxPlayers: 2
}));
const BROADCAST_DELAY = 5000;
let broadcastTimeout = null;
const scheduleBroadcast = () => {
    if (broadcastTimeout)
        return;
    broadcastTimeout = setTimeout(() => {
        io.emit('availableRooms', getAvailableRooms());
        broadcastTimeout = null;
    }, BROADCAST_DELAY);
};
setInterval(() => {
    Object.keys(rooms).forEach(roomCode => {
        rooms[roomCode] = rooms[roomCode].filter(id => id !== '');
        if (rooms[roomCode].length === 0) {
            console.log(`Cleanup: Deleting empty room ${roomCode}`);
            delete rooms[roomCode];
            delete roomStates[roomCode];
        }
    });
    scheduleBroadcast();
}, 60000);
//SOCKET LISTENERS AND EMITTERS
io.on('connection', (socket) => {
    //Create a room
    socket.on('createRoom', (roomCode, gameState) => {
        rooms[roomCode] = [socket.id];
        const playerNumber = 1;
        players[socket.id] = { roomCode, playerNumber };
        console.log('players', players, roomCode, playerNumber, gameState);
        socket.emit('playerNumber', playerNumber);
        socket.emit('gameState', gameState);
        socket.emit('createRoom', roomCode);
        roomStates[roomCode] = gameState;
        scheduleBroadcast();
    });
    //Join a room
    socket.on('joinRoom', (roomCode) => {
        //const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
        console.log('rooms', rooms, roomCode, rooms[roomCode], socket.id);
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
            //players[socket.id] = { roomCode, playerNumber: 1 };
        }
        if (rooms[roomCode].some(id => id === '')) {
            const indexOfPlayer = rooms[roomCode].indexOf(socket.id);
            players[socket.id] = { roomCode, playerNumber: indexOfPlayer === 0 ? 2 : 1 };
        }
        // Determine player number BEFORE pushing to the room
        let playerNumber;
        if (rooms[roomCode].length === 0) {
            playerNumber = 1;
        }
        else if (rooms[roomCode].length === 1) {
            const existingPlayer = rooms[roomCode][0];
            if (players[existingPlayer]) {
                playerNumber = players[existingPlayer].playerNumber === 1 ? 2 : 1;
            }
            else {
                playerNumber = 1;
            }
        }
        else {
            socket.emit('roomError', 'Room is full.');
            return;
        }
        if (rooms[roomCode].length === 1) {
            const otherPlayerSocketId = rooms[roomCode][0];
            // Check if the otherPlayerSocketId is valid and exists in players
            if (otherPlayerSocketId && otherPlayerSocketId !== '' && players[otherPlayerSocketId]) {
                players[socket.id] = { roomCode, playerNumber: players[otherPlayerSocketId].playerNumber === 1 ? 2 : 1 };
            }
            else {
                // If no valid player exists in the room, assign as player 1
                players[socket.id] = { roomCode, playerNumber: 1 };
            }
        }
        console.log('players', players, roomCode);
        console.log('rooms', rooms, roomCode, rooms[roomCode], socket.id);
        rooms[roomCode].push(socket.id);
        scheduleBroadcast();
        const player = players[socket.id];
        //let playerNumber: number;
        if (player) {
            player.roomCode = roomCode;
            playerNumber = player.playerNumber;
            console.log('playerNumber', playerNumber, player.playerNumber, player.roomCode, player, players[socket.id], socket.id);
            players[socket.id] = { roomCode, playerNumber };
            socket.emit('playerNumber', playerNumber);
        }
        socket.emit('gameState', roomStates[roomCode]);
    });
    //Load save game
    socket.on('loadSaveGame', (roomCode) => {
        //console.log(rooms[roomCode], roomCode, roomStates[roomCode])
        if (rooms[roomCode]) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('loadSaveGame', roomCode, roomStates[roomCode]);
            console.log('emitted load game to host');
        }
        else {
            console.log(`No moves have been made in room with room code ${roomCode}`);
        }
    });
    //Turn 
    socket.on('turn', (playerTurn, roomCode) => {
        if (rooms[roomCode]) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('turn', playerTurn);
            console.log('turn', roomCode, playerTurn);
        }
        else {
            console.log(`No moves have been made in room with room code ${roomCode}`);
        }
    });
    //Leave a room
    socket.on('leaveRoom', (roomCode) => {
        if (rooms[roomCode] && Array.isArray(rooms[roomCode])) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('leaveRoom');
            io.to(otherPlayerSocketId).emit('turn', 0);
            console.log(`Player with socket ID ${otherPlayerSocketId} has left room with room code ${roomCode}`);
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
            }
        }
        delete players[socket.id];
        scheduleBroadcast();
    });
    //Error handling
    socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });
    //Game state
    socket.on('gameState', (gameState, roomCode) => {
        if (rooms[roomCode]) {
            const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
            io.to(otherPlayerSocketId).emit('gameState', gameState);
        }
        else {
            console.log(`No moves have been made in room with room code ${roomCode}`);
        }
        //console.log(roomStates);
    });
    //Game over
    socket.on('gameOver', (isGameOver, winner, roomCode) => {
        const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
        io.to(otherPlayerSocketId).emit('gameOver', { winner, isGameOver });
        console.log('gameOver', roomCode, winner, isGameOver);
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
        console.log('disconnected player', player);
        if (player) {
            const roomCode = player.roomCode;
            socket.broadcast.to(roomCode).emit('turn', 0);
            // Replace the problematic code with this:
            if (rooms[roomCode]) {
                // Actually remove the player from the array instead of setting to empty string
                const playerIndex = rooms[roomCode].indexOf(socket.id);
                if (playerIndex !== -1) {
                    rooms[roomCode].splice(playerIndex, 1); // Remove completely instead of setting to ''
                }
                // Clean up any remaining empty strings (from previous disconnects)
                rooms[roomCode] = rooms[roomCode].filter(id => id !== '');
                // Delete room if truly empty
                if (rooms[roomCode].length === 0) {
                    delete rooms[roomCode];
                    delete roomStates[roomCode];
                    console.log(`Room ${roomCode} deleted because it's empty`);
                }
            }
            // Remove the player from players object
            delete players[socket.id];
            scheduleBroadcast();
        }
    });
    //Request available rooms
    socket.on('requestAvailableRooms', () => {
        socket.emit('availableRooms', getAvailableRooms());
    });
});
// process.env.PORT is used to get the port from the .env file 
// or 3001 if it doesn't exist
// const PORT = process.env.PORT || 3005
// // app.listen is used to start the server on the port from the .env file
// app.listen(PORT, () => {
//     console.log(`Authentication server running on PORT ${PORT}`)
// })
// httpServer.listen(3004, () => {
//     console.log('socket server running at localhost/:3004');
//   });
const PORT = process.env.PORT || 3004;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with both API and sockets`);
});
httpServer.on('error', (err) => {
    //process.exit(1);
    console.error(`Server error: ${err}`);
    // httpServer.close(() => {
    //     console.log('Socket Server stopped due to an error');
    // });
});
