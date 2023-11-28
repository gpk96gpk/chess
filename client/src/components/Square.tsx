//TODO:
// Square component takes in the props for position children and handleDrop

import { HighlightedTile, Piece, Position, Props } from "../types/clientTypes";

type SquareProps = {
    position: Position | Position[];
    highlightedTiles: HighlightedTile[];
    handleDragStart: (
        event: React.DragEvent<HTMLDivElement>, 
        piece: Piece, 
        position: Position, 
        setHighlightedTiles: (tiles: Position[]) => void, 
        props: Props
    ) => void;
    handleDragOver: (
        event: React.DragEvent<HTMLDivElement>, 
        position: Position
    ) => void;
    handleDrop: (
        event: React.DragEvent<HTMLDivElement>, 
        props: Props
    ) => void;
    children: React.ReactNode;
};

// passed in function handleDropWrapper takes in event and sets piece to the event dataTransfer
//passes piece that was take from event and position to handleDrop function

// render div with onDrop and onDragOver events
//onDrop event calls handleDropWrapper function
//onDragOver event prevents default behavior
// render children
const Square: React.FC<SquareProps> = ({ position, highlightedTiles, handleDragStart, handleDragOver, handleDrop, children }) => {
    const isHighlighted = highlightedTiles.some(([x, y]) => x === position[0] && y === position[1]);
    
    const squareStyle = isHighlighted ? { 
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.5) 0%, transparent 70%, transparent 100%)' 
    } : {};

    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        const pieceData = event.currentTarget.getAttribute('data-piece');
        if (pieceData === null) {
            return;
          } else {
            const piece = JSON.parse(pieceData);
            handleDragStart(event, piece, position as Position, () => {}, {} as Props);
          }
    }
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => handleDragOver(event, position as Position);
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, {} as Props);

    return (
        <div 
            className='square'
            style={squareStyle}
            draggable={!!children}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {children}
        </div>
    );
};

export default Square;