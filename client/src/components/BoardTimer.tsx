//TODO:
// Take in playerTurn and playerNumber as props
// set initial time from selection in the same overlay to choose color

import { useEffect, useState } from 'react';

interface BoardTimerProps {
  playerTurn: number;
  playerNumber: number;
  initialTime: number;
}


const BoardTimer: React.FC<BoardTimerProps> = ({ playerTurn, playerNumber, initialTime }) => {
  const [seconds, setSeconds] = useState(initialTime);
  const isPlayerTurn = playerTurn === playerNumber;

  useEffect(() => {
    if (isPlayerTurn && seconds > 0) {
      const intervalId = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isPlayerTurn, seconds]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div>
      Time: {hours}:{minutes < 10 ? '0' : ''}{minutes}:{remainingSeconds < 10 ? '0' : ''}{remainingSeconds}
    </div>
  );
};

export default BoardTimer;