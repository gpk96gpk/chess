//TODO:
// Piece component takes in props for piece type position and color

//function handleDragStart where it will store the initial piece
//and the initial tile it was dragged from
//use event.dataTransfer.setData to store the piece and position for server

// render div thats draggable and has an onDragStart event
//render the piece image based off of the color and piece type props passed in
import { getPieceIcon } from '../assets/icons'; // import your icon function
import validMoves from '../gameLogic/validMoves';
import { GameState, Move, Piece as PieceType, Position } from '../types/clientTypes';

const Piece = ({ piece, gameState, playerNumber }: {piece: PieceType | string, position: Position, gameState: GameState, playerNumber: number}) => {
    const handleDragStart = (event: React.DragEvent, piece: PieceType, position: Position) => {
        event.dataTransfer.setData('piece', JSON.stringify(piece));
        event.dataTransfer.setData('position', JSON.stringify(position));
    };

    const onDragStart = (event: React.DragEvent) => {
        // Here we're calling handleDragStart with the correct arguments
        handleDragStart(event, piece, piece.position);
        console.log('Startposition', piece.position); 
    };


    if (typeof piece === 'string') {
        return null;
    }

    if (typeof piece === 'object' && piece !== null && piece.type !== 'empty') {
        return (
            <div draggable={true} onDragStart={onDragStart} className='piece'>
                <img src={getPieceIcon(piece.type, piece.color)} alt={`${piece.color} ${piece.type}`} />
            </div>
        );
    }

    return null;
};

export default Piece;