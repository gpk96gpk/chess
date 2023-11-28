//TODO:
// Piece component takes in props for piece type position and color

//function handleDragStart where it will store the initial piece
//and the initial tile it was dragged from
//use event.dataTransfer.setData to store the piece and position for server

// render div thats draggable and has an onDragStart event
//render the piece image based off of the color and piece type props passed in
import { getPieceIcon } from '../assets/icons'; // import your icon function
import { Piece, Position } from '../types/clientTypes';


const Piece = ({ piece, position }: {piece:Piece | null, position: Position}) => {
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        if (piece !== null) {
            event.dataTransfer.setData('piece', JSON.stringify({ piece, position }));
        }
    };

    return (
        <div draggable onDragStart={handleDragStart} className='piece'>
            {piece !== null && <img src={getPieceIcon(piece.type, piece.color)} alt={`${piece.color} ${piece.type}`} />}
        </div>
    );
};

export default Piece;