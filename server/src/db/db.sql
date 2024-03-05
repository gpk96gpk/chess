--Create user table
CREATE TABLE users (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL
);

--Create savedGames table
CREATE TABLE savedGames (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    userId BIGINT NOT NULL,
    gameState VARCHAR(255) NOT NULL,
    savedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

--Select all users
SELECT
    *
FROM
    users
WHERE
    username = $ 1;

--Create a new user and password
INSERT INTO users (
    username, 
    password
)
VALUES (
    $ 1, 
    $ 2
) 
RETURNING *

--Save a game to a specific user
INSERT INTO savedGames (
    user_id, 
    game_state
)
VALUES(
    $ 1, 
    $ 2
) 
RETURNING *

--Update a saved game for a user
UPDATE
    savedGames
SET
    data = $ 1
WHERE
    user_id = $ 2
    AND id = $ 3 RETURNING *

--Get all of saved games for a user
SELECT
    *
FROM
    savedGames
WHERE
    user_id = $ 1

--Get selected saved game for a user
SELECT
    *
FROM
    savedGames
WHERE
    user_id = $ 1
    AND id = $ 2

--Delete a saved game for a user
DELETE FROM
    savedGames
WHERE
    user_id = $ 1
    AND id = $ 2 RETURNING *




-- Insert gameState into gameState table and retrieve the id
INSERT INTO gameState (state)
VALUES ($1)
RETURNING id;

-- Use the id from the previous operation to insert a new row into savedGames
INSERT INTO savedGames (userId, gameStateId, savedAt)
VALUES ($2, <id from previous operation>, CURRENT_TIMESTAMP)
RETURNING *;


-- select the gameState from the savedGames table and return the corresponding gameState from the gameState table
SELECT gs.state
FROM savedGames sg
JOIN gameState gs ON sg.gameStateId = gs.id
WHERE sg.id = $1;



SELECT u.username, sg.gameState
FROM users u
JOIN savedGames sg ON u.id = sg.userId
WHERE u.username = $1;