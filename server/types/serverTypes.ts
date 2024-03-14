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

export type PlayerNumber = 1 | 2

export type Color = 'black' | 'white' | 'none';
  
export type PieceColor = 'white' | 'black';

export type PieceNames = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'empty';

export type PieceType = {
    type: PieceNames;
    color?: PieceColor | 'none';
    position?: Position | [];
    hasMoved: boolean;
    index?: number;
    hasMovedTwo?: boolean;
    isHighlighted?: boolean;
};

export type PiecePositions = {
    id: number;
    type: PieceNames;
    position: Position | [];
    color?: Color;
    index?: number;
    hasMoved?: boolean;
    hasMovedTwo?: boolean;
}

export type Position = [number, number];

export interface GameStateType {
    board: PieceType[][];
    initialBoard?: GameStateType;
    history: Move[];
    turn: 'white' | 'black';
    kingPositions: { black: Position; white: Position };
    playerNumber?: 1 | 2;
    threateningPiecesPositions: {
        black: number[][][] | number[][];
        white: number[][][] | number[][];
    };
    piecePositions: {
        black: PiecePositions[];
        white: PiecePositions[];
    };
    checkStatus: {
        black: boolean;
        white: boolean;
        direction: number;
    };
    checkmateStatus: {
        black: boolean;
        white: boolean;
    };

}
export type Move = {
    piece: PieceType;
    from: Position;
    to: Position;
    board: PieceType[][];
    turn: Color | PieceColor;
    turnNumber: number;
};

export type SocketTypes = ClientToServerEvents & ServerToClientEvents & InterServerEvents & SocketData;