import { GameState, Piece, Position, Move } from "../types/clientTypes";

function castling(piece: { type: string; color: 'white' | 'black'; hasMoved: boolean}, position: Position, gameState: GameState, playerNumber: number): Move | null {
    if (piece.type !== 'king' || piece.hasMoved) {
        return null;
    }

    const rookPositions = playerNumber === 1 ? [[0, 0], [0, 7]] : [[7, 0], [7, 7]];
    let castlingMove: Move | null = null;

    for (const [y, x] of rookPositions) {
        const rook = gameState.board[y][x] as Piece;
        if (rook && rook.type === 'rook' && !rook.hasMoved) {
            const direction = x < position[0] ? -1 : 1;
            let canCastle = true;
            for (let i = position[0] + direction; i !== x; i += direction) {
                if (gameState.board[position[1]][i]) {
                    canCastle = false;
                    break;
                }
            }

            if (canCastle) {
                castlingMove = {
                    piece,
                    from: position,
                    to: [position[0] + 2 * direction, position[1]],
                    board: gameState.board,
                    turn: piece.color,
                    turnNumber: gameState.history.length
                };
                break;
            }
        }
    }

    return castlingMove;
}

export default castling;