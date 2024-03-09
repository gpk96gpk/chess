export type PieceNames = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'empty';

export type Color = 'black' | 'white' | 'none';
  
export type PieceColor = 'white' | 'black';

export type PieceNameWithoutNone = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export type ThreateningSquares = number[][][] | number[][];


export type PlayerNumber = 1 | 2

export type PieceType = {
    type: PieceNames;
    color: Color | PieceColor;
    position: Position | [];
    hasMoved: boolean;
    index: number;
    hasMovedTwo?: boolean;
    isHighlighted?: boolean;
};

export type PiecePositions = {
    id: number;
    type: PieceNames;
    position: Position | [];
    color: Color;
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

export type BoardPiece = {
    piece: PieceType | string, 
    position: Position, 
    gameState: GameStateType, 
    playerNumber: number, 
    handleDragStart: (
        event: React.DragEvent<HTMLDivElement>, 
        piece: PieceType, 
        position: Position,  
        props: Props
    ) => void;
} 

export interface BoardSaveGameButtonProps {
    gameState: GameStateType; 
}

export type Move = {
    piece: PieceType;
    from: Position;
    to: Position;
    board: PieceType[][];
    turn: Color | PieceColor;
    turnNumber: number;
};

export type Props = {
    gameState: GameStateType;
    setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
    gameOver: boolean;
    setGameOver: (arg0: boolean) => void;
    playerNumber: 1 | 2;
    setPlayerNumber: (arg0: 1 | 2) => void;
    turnState: 0 | 1 | 2 | 3;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>;
    winner: string | null;
    setWinner: (winner: string | null) => void;
    isPlayerInCheck: boolean;
    setIsPlayerInCheck: (arg0: boolean) => void;
    handleReset: () => void;
    // highlightedTiles: Position[];
    // setHighlightedTiles: (arg0: Position[]) => void;
};

export interface BoardButtonsProps {
    gameState: GameStateType;
    setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
    setWinner: (winner: string | null) => void;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>; 
}

export type ValidMovesResult = {
    moves: undefined | Position[];
    threateningSquares: {
      black: number[][][] | number[][];
      white: number[][][] | number[][];
    };
    isKingInCheck: boolean | undefined;
    checkDirection: number;
    isKingInCheckMate: boolean;
    isOpponentKingInCheck: boolean;
    enPassantMove: Position | null | undefined;
    canCastle: boolean;
} ;

export type BoardProps = {
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>; 
    setWinner: (winner: string | null) => void;
    gameState: GameStateType;
    handleDragStart: (
        event: React.DragEvent<HTMLDivElement>, 
        piece: PieceType, 
        position: Position
    ) => void;
    handleDragOver: (
        event: React.DragEvent<HTMLDivElement>, 
        position: Position
    ) => void;
    handleDrop: (
        event: React.DragEvent<HTMLDivElement>, 
        props: Props
    ) => void;
    playerNumber?: 1 | 2
};

export type GameOverProps = {
    gameState: GameStateType;
    winner: string | null;
    setWinner: (winner: string | null) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>; 
};

export interface CheckResult {
    gameState: GameStateType;
    isKingInCheck: boolean;
    isKingInCheckmate: boolean;
    loser: string;
    threateningSquares: {
        black: number[][][] | number[][];
        white: number[][][] | number[][];
      };
    opponentPlayerNumber: 1 | 2;
    checkPosition: Position;
    piece: PieceType;
    position: Position;
    playerNumber:  1 | 2;
    lastPosition: Position;
    matchFoundInDirection: number |  undefined;
    currentPlayerColor: Color | PieceColor;
}