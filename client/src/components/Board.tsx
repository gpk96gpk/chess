//TODO: 
//import Piece
import Square from './Square';
import Piece from './Piece';
import { BoardProps, PieceType, Position } from '../types/clientTypes';


// component render
// div for container of board
// render chess board as array or Square components mapped from gameState array
// if the gameState array has a piece in the tile render the piece
// Update the BoardProps interface
// Add to the existing interface:


// Then update the component to pass these props to Square
const Board: React.FC<BoardProps> = ({ 
    gameState, 
    handleDragStart, 
    handleDragEnter, 
    handleDragOver, 
    handleDrop, 
    playerNumber,
    isKingInCheck, 
    handlePieceClick, 
    handleSquareClick,
    handleBoardClick, 
    highlightedTiles 
}) => {
    return (
        <div className={`board ${isKingInCheck ? 'king-in-check' : ''}`} onClick={handleBoardClick}>
            {gameState.board.map((row: (PieceType | string)[], i: number) => (
                <div key={i} className="row">
                    {row.map((piece: PieceType | string, j: number) => {
                        const isDark = (i + j) % 2 === 0;
                        const className = isDark ? 'dark-square' : 'light-square';
                        const position: Position = [i, j];
                        
                        // Check if this square should be highlighted
                        const isHighlighted = highlightedTiles.some(
                            tile => tile[0] === i && tile[1] === j
                        );
                        return (
                            <Square 
                                key={j} 
                                position={position} 
                                className={`${className} ${isHighlighted ? 'highlighted-square' : ''}`}
                                handleDragStart={handleDragStart} 
                                handleDragEnter={handleDragEnter} 
                                handleDragOver={handleDragOver} 
                                handleDrop={handleDrop}
                                handleSquareClick={handleSquareClick}
                                handlePieceClick={handlePieceClick}
                                highlightedTiles={highlightedTiles}
                                isHighlighted={isHighlighted}
                            >
                                {piece !== '' ? 
                                    <Piece 
                                        position={position} 
                                        piece={piece as PieceType} 
                                        handleDragStart={handleDragStart} 
                                        handlePieceClick={handlePieceClick}
                                        gameState={gameState} 
                                        playerNumber={playerNumber!} 
                                    /> : 
                                    <div className="empty-square" />
                                }
                            </Square>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;