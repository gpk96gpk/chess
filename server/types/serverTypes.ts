//store the server types

interface ServerToClientEvents {
    gameOver: (isGameOver: {winner: string, isGameOver: boolean}) => void;
    playerNumber: (playerNumber: number) => void;
    reset: () => void;
    turn: (xTurn: boolean) => void;
    gameState: (gameState: any) => void;
    leaveRoom: () => void;
    joinRoom: () => void;
    loadSaveGame: (roomCode: string | number, gameState: any) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

export type SocketTypes = ClientToServerEvents & ServerToClientEvents & InterServerEvents & SocketData;