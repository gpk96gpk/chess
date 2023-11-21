function isFivefoldRepetition(history) {
    const positions = history.map(move => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];
    for (let position of uniquePositions) {
        const occurrences = positions.filter(p => p === position).length;
        if (occurrences >= 5) {
            return true;
        }
    }
    return false;
}

export default isFivefoldRepetition;