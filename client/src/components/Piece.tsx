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


//TODO: add restriction to moving diagonally so it only allowed when pieces of the opposite color are there
//add restriction for taking your own pieces
//Check the fix to the board initialization in the app.tsx file review the changes made to the board initialization and why they were made
//fix variables and props for the major pieces to match the same as the pawns
//fix the variables for the special moves to match the same as the pawns
//fix the game state being stuck at draw this has to do with fixing the checkmate function
//fix the board buttons so they display and use the updated logic
//fix the socket server errors
//debug and check that gamestate and turnstate are being updated correctly from the socket server
//fix the error with the square being draggable so that the square is not draggable is immutable but the piece is mutable

//add the piece type to the move object to go with position
//use the type as well as position to determine if the take is valid i think the valid move and take are different functions so no need to over complicate it
//
//fix error where the piece is not being moved to the new position on the first turn after the room is created
