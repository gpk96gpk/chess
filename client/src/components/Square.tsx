//TODO:
// Square component takes in the props for position children and handleDrop

import { HighlightedTile, Piece as PieceType, Position, Props } from "../types/clientTypes";

type SquareProps = {
    style: React.CSSProperties;
    position: Position | Position[];
    highlightedTiles: Position[];
    handleDragStart: (
        event: React.DragEvent<HTMLDivElement>, 
        piece: PieceType, 
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
const Square: React.FC<SquareProps> = ({ style, position, highlightedTiles, handleDragStart, handleDragOver, handleDrop, children }) => {
    const isHighlighted = Array.isArray(highlightedTiles) && Array.isArray(position) && highlightedTiles.some(([x, y]) => x === position[0] && y === position[1]);
    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        const pieceData = event.currentTarget.getAttribute('data-piece');
        if (pieceData === null) {
            return;
        } else {
            let piece;
            try {
                piece = JSON.parse(pieceData);
            } catch (error) {
                console.error('Invalid JSON string:', pieceData);
                return;
            }
            handleDragStart(event, piece, position as Position, () => {}, {} as Props);
        }
    }
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => handleDragOver(event, position as Position);
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, {} as Props);

    return (
        <div 
            className='square'
            style={{...style, ...(isHighlighted ? { backgroundColor: 'blue' } : {})}}
            draggable={false}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {children || null}
        </div>
    );
};

export default Square;