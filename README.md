# Chess Project

This project is a full-stack application for playing chess online.

## Structure

The project is divided into three main parts:

- `client`: This is the frontend of the application, built with React and TypeScript. It includes the user interface for the chess game.
- `server`: This is the backend of the application, built with Node.js and Express. It handles game logic and communicates with the frontend.
- `nginx`: This contains the configuration for the Nginx server used to serve the application.

## Setup

### Prerequisites

- Node.js
- Docker (optional)

### Installation

1. Clone the repository.
2. Install the dependencies for the client and server:

### Usage

#### Creating a Game

To create a game, navigate to the main page of the application and click on the "Create Game" button. This will create a new game and display a unique room code on the board.

#### Joining a Game

To join a game, you need the room code for the game. This code is displayed on the board of the game creator. 

On the main page of the application, enter the room code into the "Join Room" field and click on the "Join Game" button. This will take you to the game with the entered room code.

Please note that a game must be created before it can be joined. If you enter a room code for a game that does not exist, you will see an error message.

### Saved Games

Players have the ability to save their games for future reference. In order to save a game, at least one player must have an account. Accounts can be created on the home section of the application.

Once a player is signed in, they can save the current game by clicking on the "Save Game" button. The game will then be added to their list of saved games.

To view a list of saved games, sign in and navigate to the "Saved Games" section. Here, you will see a list of all games that you have saved. You can click on a game to view the details of that game.

Please note that you must be signed in to save games and view saved games.