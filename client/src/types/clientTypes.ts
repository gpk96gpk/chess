export type PieceType = {
    type: 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'empty';
    color: 'black' | 'white' | 'none';
    position: Position;
    hasMoved: boolean;
    isHighlighted: boolean;
    index: number;
};

export type Position = [number, number];

export interface GameStateType {
    board: PieceType[][];
    history: Move[];
    turn: 'white' | 'black';
    kingPositions: { black: Position; white: Position };
    threateningPiecesPositions: {
        black: Position[];
        white: Position[];
    };
};

export type Move = {
    piece: PieceType;
    from: Position;
    to: Position;
    board: PieceType[][];
    turn: "white" | "black";
    turnNumber: number;
};

export type Props = {
    gameState: GameStateType;
    setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
    gameOver: boolean;
    setGameOver: (arg0: boolean) => void;
    playerNumber: number;
    setPlayerNumber: (arg0: number) => void;
    turnState: 0 | 1 | 2;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
    winner: string | null;
    setWinner: (winner: string | null) => void;
    highlightedTiles: Position[];
    setHighlightedTiles: (arg0: Position[]) => void;
    isPlayerInCheck: boolean;
    setIsPlayerInCheck: (arg0: boolean) => void;
    handleReset: () => void;
};

export interface BoardButtonsProps {
    gameState: GameStateType; 
}