import { Move } from "../types/clientTypes";

function isFivefoldRepetition(history: Move[]) {
    const positions = history.map((move: Move) => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];

    return uniquePositions.some(position => positions.filter(p => p === position).length >= 5);
}

export default isFivefoldRepetition;