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


import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import db from 'db';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createServer } from "http";
import { Server, Socket } from 'socket.io';
import { SocketTypes } from '../types/serverTypes.ts';

const app = express();
const httpServer = createServer(app);
const io = new Server<SocketTypes>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  }
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
  
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
}

app.use(authenticateJWT);
app.use(cors())
app.use(express.json())

let players = {};
let rooms: string[] | {} = [];

//SOCKET LISTENERS AND EMITTERS
io.on('connection', (socket: Socket) => {
    //Create a room
    socket.on('createRoom', (roomCode: string | number) => {
        rooms[roomCode] = [socket.id];
        const playerNumber = 1;
        players[socket.id] = { roomCode, playerNumber };
        socket.emit('playerNumber', playerNumber);
    });
    //Join a room
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        rooms[roomCode].push(socket.id);
        const playerNumber = 2;
        players[socket.id] = { roomCode, playerNumber };
        socket.emit('playerNumber', playerNumber);
    });
    //Leave a room
    socket.on('leaveRoom', (roomCode) => {
        const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
        io.to(otherPlayerSocketId).emit('leaveRoom');
        // const { roomCode } = players[socket.id];
        socket.leave(roomCode);
        const index = rooms[roomCode].indexOf(socket.id);
        rooms[roomCode].splice(index, 1);
        delete players[socket.id];
    });
    //Error handling
    socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });
    //Game state
    socket.on('gameState', (gameState, roomCode) => {
        const otherPlayerSocketId = [...rooms[roomCode]].filter(id => id !== socket.id);
        io.to(otherPlayerSocketId).emit('gameState', gameState);
    });
    //Game over
    socket.on('gameOver', (isGameOver, roomCode) => {
        io.to(roomCode).emit('gameOver', isGameOver);
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

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

//SERVER ROUTES
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
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
});

//Save a game to a user
app.post("/api/v1/chess/games/save", authenticateJWT, async (req, res) => {
    try {
        const { gameState } = req.body;
        const { user } = req;

        const savedGame = await db.query(
            "INSERT INTO savedGames (user_id, game_state) VALUES ($1, $2) RETURNING *",
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
            "UPDATE savedGames SET data = $1 WHERE user_id = $2 AND id = $3 RETURNING *",
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
            "SELECT * FROM savedGames WHERE user_id = $1",
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
            "SELECT * FROM savedGames WHERE user_id = $1 AND id = $2",
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
            "DELETE FROM savedGames WHERE user_id = $1 AND id = $2 RETURNING *",
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