//store types for client

export type Piece = {
    type: 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'empty';
    color: 'black' | 'white';
    position: Position;
    hasMoved: boolean;
    isHighlighted: boolean;
} | null;

export type Position = [number, number] | [];

export interface GameState {
    board: Piece[][];
    history: Move[];
    turn: 'white' | 'black';
}

export type HighlightedTile = Position[];

export type Props = {
    gameState: GameState;
    setGameState(newGameState: { board: Piece[][]; turn: "white" | "black"; history: Move[]; }): unknown;
    gameOver: boolean;
    setGameOver(arg0: boolean): unknown;
    playerNumber: number;
    setPlayerNumber: (arg0: number) => unknown;
    turnState: 0 | 1 | 2;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
    winner: string | null;
    setWinner: (winner: string | null) => void;
    highlightedTiles: HighlightedTile[];
    setHighlightedTiles(arg0: never[]): unknown;
    isPlayerInCheck: boolean;
    setIsPlayerInCheck: (arg0: boolean) => unknown;
    handleReset: () => void;
};

export type Move = {
    piece: { type: string; color: string; };
    from: Position;
    to: Position;
    board: Piece[][];
    turn: "white" | "black";
    turnNumber: number;
};

export type Board = (Piece | null)[][];

export interface BoardButtonsProps {
    gameState: GameState; 
  }

export type GameStateType = {
    board: Board;
    history: Move[];
    turn: "white" | "black";
  };