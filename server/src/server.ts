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
//user authentication

//set up database routes
//POST the input username from form to server and check if the username exists in the database
//if username exists, check if the password matches and if it does, send back a token
//if username does not exist send error message
//POST for creating a new user and password
//POST for saving a game to a user
//GET for the list of saved games for a user
//GET selected saved game for a user
//DELETE for deleting a saved game for a user


import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import db from 'db';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
const app = express();

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

app.post("/api/v1/users/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (user.rows.length > 0 && user.rows[0].password === password) {
            const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET);

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
                message: "Invalid username or password"
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