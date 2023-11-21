//store the server types

interface ServerToClientEvents {
    gameOver: (isGameOver: boolean) => void;
    playerNumber: (playerNumber: number) => void;
    reset: () => void;
    turn: (xTurn: boolean) => void;
    gameState: (gameState: any) => void;
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