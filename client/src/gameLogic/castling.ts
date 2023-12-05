import { GameState, Piece as PieceType, Position, Move } from "../types/clientTypes";

function castling(piece: { type: string; color: 'white' | 'black'; hasMoved: boolean}, position: Position, gameState: GameState, playerNumber: number): Move | null {
    if (piece.type !== 'king' || piece.hasMoved) {
        return null;
    }

    const rookPositions = playerNumber === 1 ? [[0, 0], [0, 7]] : [[7, 0], [7, 7]];
    let castlingMove: Move | null = null;

    for (const [y, x] of rookPositions) {
        const rook = gameState.board[y][x] as PieceType;
        if (rook && rook.type === 'rook' && !rook.hasMoved) {
            const direction = x < position[1] ? -1 : 1;
            let canCastle = true;
            for (let i = position[1] + direction; i !== x - direction; i += direction) {
                console.log('canCastleCheck!!!', gameState.board[position[0]][i].type);
                console.log('xCheck!!!', x, i)
                console.log('positionCheck!!!', position, i)
                console.log('gameStateCheck!!!', gameState.board)
                if ( gameState.board[position[0]][i].type !== 'empty') {
                    console.log('canCastleCheckFalse!!!', gameState.board[position[0]][i].type)
                    canCastle = false;
                    break;
                }
            }
            console.log('canCastleCheckTrue!!!', canCastle)
            if (canCastle) {
                castlingMove = {
                    piece,
                    from: position,
                    to: [position[0] , position[1] + 2 * direction],
                    board: gameState.board,
                    turn: piece.color,
                    turnNumber: gameState.history.length
                };
                break;
            }
        }
    }
    console.log('castlingMove!!!', castlingMove)
    return castlingMove.to;
}

export default castling;