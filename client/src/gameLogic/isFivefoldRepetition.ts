import { Move, Piece as PieceType } from "../types/clientTypes";

function isFivefoldRepetition(history: Move[]) {
    const positions = history.map((move: { board: PieceType[][]; turn: 'white' | 'black'; }) => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];

    return uniquePositions.some(position => positions.filter(p => p === position).length >= 5);
}
export default isFivefoldRepetition;