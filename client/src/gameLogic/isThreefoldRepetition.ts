function isThreefoldRepetition(history) {
    const positions = history.map(move => JSON.stringify({
        board: move.board,
        turn: move.turn
    }));
    const uniquePositions = [...new Set(positions)];
    for (let position of uniquePositions) {
        const occurrences = positions.filter(p => p === position).length;
        if (occurrences >= 3) {
            return true;
        }
    }
    return false;
}

export default isThreefoldRepetition;