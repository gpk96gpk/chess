//TODO: 
//import Piece
import Square from './Square';
import Piece from './Piece';
import { BoardProps, PieceType } from '../types/clientTypes';



// component render
// div for container of board
// render chess board as array or Square components mapped from gameState array
// if the gameState array has a piece in the tile render the piece
const Board: React.FC<BoardProps> = ({ gameState, handleDragStart, handleDragEnter, handleDragOver, handleDrop, playerNumber }) => {
    console.log('761gameState', gameState);
    // console.log(gameState.board)
    return (
        <div className="board">
            {gameState.board.map((row: (PieceType | string)[], i: number) => (
                <div key={i} className="row">
                    {row.map((piece: PieceType | string, j: number) => {
                        const isDark = (i + j) % 2 === 0;
                        const squareStyle = isDark ? { backgroundColor: 'tan' } : { backgroundColor: 'white' };

                        return (
                            <Square key={j} position={[i, j]} style={squareStyle} handleDragStart={handleDragStart} handleDragEnter={handleDragEnter} handleDragOver={handleDragOver} handleDrop={handleDrop}>
                                {piece !== '' ? <Piece position={[i, j]} piece ={piece as PieceType} handleDragStart={handleDragStart} gameState={gameState} playerNumber={playerNumber!} /> : <div className="empty-square" />}
                            </Square>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;












// const Board = ({ gameState, movePiece }) => {
//     return (
//       <div className="board">
//         {gameState.map((row, i) => (
//           <div key={i} className="row">
//             {row.map((piece, j) => (
//               <Square key={j} position={[i, j]} movePiece={movePiece}>
//                 {piece && <Piece piece={piece} position={[i, j]} />}
//               </Square>
//             ))}
//           </div>
//         ))}
//       </div>
//     );
//   };
  
//   const Square = ({ position, children, movePiece }) => {
//     const handleDrop = (event) => {
//       const piece = JSON.parse(event.dataTransfer.getData('piece'));
//       movePiece(piece, position);
//     };
  
//     return (
//       <div onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} className="square">
//         {children}
//       </div>
//     );
//   };
  
//   const Piece = ({ piece, position }) => {
//     const handleDragStart = (event) => {
//       event.dataTransfer.setData('piece', JSON.stringify({ piece, position }));
//     };
  
//     return (
//       <div draggable onDragStart={handleDragStart} className="piece">
//         {/* Render the piece */}
//       </div>
//     );
//   };







