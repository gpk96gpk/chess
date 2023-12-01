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

const Piece = ({ piece, position, gameState, playerNumber, handleDragStart }: {piece: PieceType | string, position: Position, gameState: GameState, playerNumber: number}) => {


    const onDragStart = (event: React.DragEvent) => {
        // Here we're calling handleDragStart with the correct arguments
        const newPiece = { ...piece, position: [piece.position[0], piece.position[1]] as Position };
        handleDragStart(event, newPiece, piece.position);
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