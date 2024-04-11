import { getPieceIcon } from '../assets/icons'; // import your icon function
import { GameStateType, PieceColor, PieceType, Position } from '../types/clientTypes';

const Piece = ({ piece, position, handleDragStart }: 
    {piece: PieceType, 
    position: Position, 
    gameState: GameStateType, 
    playerNumber: number, 
    handleDragStart: (
    event: React.DragEvent<HTMLDivElement>, 
    piece: PieceType, 
    position: Position,  
) => void;}) => {

    const onDragStart = (event: React.DragEvent) => {
        console.log('Piece:', piece);
        console.log('Position:', position);
        if (piece && position) {
            const newPiece = { ...piece, position: [position[0], position[1]] as Position };
            handleDragStart(event as React.DragEvent<HTMLDivElement>, newPiece, position);
        } else {
            console.error('Piece or piece position is undefined');
        }
    };
    
    if (typeof piece === 'string') {
        return null;
    }

    if (typeof piece === 'object' && piece !== null && piece.type !== 'empty') {
        return (
            <div draggable={true} onDragStart={onDragStart} className='piece'>
                <img src={getPieceIcon(piece.type, piece.color as PieceColor)} alt={`${piece.color} ${piece.type}`} />
            </div>
        );
    }

    return null;
};

export default Piece;
