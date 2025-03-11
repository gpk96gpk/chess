export type PieceNames = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'empty';

export type Color = 'black' | 'white' | 'none';

export type PieceColor = 'white' | 'black';

export type PieceNameWithoutNone = Exclude<PieceNames, 'empty'>;

export type ThreateningSquares = number[][][] | number[][];

export type Position = [number, number] | [];

export type PlayerNumber = 1 | 2

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
    username: string | null;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    handleReset: () => void;
    showPromotionDialog: boolean;
    setShowPromotionDialog: (arg0: boolean) => void;
    promotionPosition: Position | null;
    setPromotionPosition: (arg0: Position | null) => void;
    pieceToPromote: PieceType | null;
    setPieceToPromote: (arg0: PieceType | null) => void;
    // highlightedTiles: Position[];
    // setHighlightedTiles: (arg0: Position[]) => void;
};

export type TestPieceMoveAdapter = PieceMoveType & {
    color: PieceColor | 'none';
  };

export type MovePosition = [number, number];

export type ValidMoveReturn = {
    moves: Position[]; 
    threateningSquares: { black: number[][] | number[][][]; white: number[][] | number[][][]; }; 
    isKingInCheck: false; 
    checkDirection: number | undefined; 
    isKingInCheckMate: boolean; 
    isOpponentKingInCheck: boolean | undefined; 
    enPassantMove: Position; 
    canCastle: boolean;
    canPromote: boolean;
    promotionPosition: Position | undefined; 
  }

export type PieceType = {
    id?: number;           // make sure id is always set
    type?: PieceNameWithoutNone | PieceNames;
    color: PieceColor | 'none';
    position: Position;    // always set as a valid [number, number]
    hasMoved: boolean;
    index?: number;
    hasMovedTwo?: boolean;
    isHighlighted?: boolean;
  };

export type PieceMoveType = PieceType & {
    gameState: GameStateType;
    playerNumber?: number;
    piece: PieceType;
};

export type PiecePositions = {
    id: number;
    type: PieceNames;
    position: Position;
    color?: Color;
    index?: number;
    hasMoved?: boolean;
    hasMovedTwo?: boolean;
}


export interface GameStateType {
    board: PieceType[][];
    initialBoard?: GameStateType;
    history: Move[];
    turn: 'white' | 'black' | null;
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
    username1: string | null;
    username2: string | null;
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

export interface BoardButtonsProps {
    gameState: GameStateType;
    setGameState: React.Dispatch<React.SetStateAction<GameStateType>>;
    setWinner: (winner: string | null) => void;
    setTurnState: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>;
    roomCode: string | undefined; 
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
    canPromote: boolean;
    promotionPosition: Position | null;
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
    handleDragEnter: (
        event: React.DragEvent<HTMLDivElement>, 
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

export type TestBoard = 'none' | 'knightCheckmate' | 'pawnTest' | 'basicMove';