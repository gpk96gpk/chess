import { Move, Piece } from "../types/clientTypes";

function isFivefoldRepetition(history: Move[]) {
    const positions = history.map((move: { board: Piece[][]; turn: 'white' | 'black'; }) => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];
    for (const position of uniquePositions) {
        const occurrences = positions.filter((p: string) => p === position).length;
        if (occurrences >= 5) {
            return true;
        }
    }
    return false;
}

export default isFivefoldRepetition;