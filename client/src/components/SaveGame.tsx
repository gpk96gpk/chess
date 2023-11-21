//TODO:
// component with try catch to make POST request to save game
// takes in gameState playerTurn and player1 and player2 usernames as props
//render button to trigger function for POST request

























// const saveGame = async (gameState) => {
//     try {
//       const response = await fetch('/api/saveGame', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(gameState),
//       });
  
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
  
//       const data = await response.json();
//       console.log('Game saved successfully:', data);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };
  
//   return (
//     <button onClick={() => saveGame(gameState)}>Save Game</button>
//   );