import pawnBlack from './pawnBlack.svg';
import rookBlack from './rookBlack.svg';
import knightBlack from './knightBlack.svg';
import bishopBlack from './bishopBlack.svg';
import queenBlack from './queenBlack.svg';
import kingBlack from './kingBlack.svg';

import pawnWhite from './pawnWhite.svg';
import rookWhite from './rookWhite.svg';
import knightWhite from './knightWhite.svg';
import bishopWhite from './bishopWhite.svg';
import queenWhite from './queenWhite.svg';
import kingWhite from './kingWhite.svg';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

const icons: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    pawn: pawnBlack,
    rook: rookBlack,
    knight: knightBlack,
    bishop: bishopBlack,
    queen: queenBlack,
    king: kingBlack,
  },
  black: {
    pawn: pawnWhite,
    rook: rookWhite,
    knight: knightWhite,
    bishop: bishopWhite,
    queen: queenWhite,
    king: kingWhite,
  },
};

export function getPieceIcon(type: PieceType, color: PieceColor) {
  return icons[color][type];
}