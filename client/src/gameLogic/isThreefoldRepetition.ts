import { Move } from "../types/clientTypes";

function isThreefoldRepetition(history: Move[]) {
    const positions = history.map(move => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];

    return uniquePositions.some(position => positions.filter(p => p === position).length >= 3);
}

export default isThreefoldRepetition;