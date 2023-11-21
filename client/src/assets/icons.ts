const icons = {
    white: {
      pawn: './pawnBlack.svg',
      rook: './rookBlack.svg',
      knight: './knightBlack.svg',
      bishop: './bishopBlack.svg',
      queen: './queenBlack.svg',
      king: './kingBlack.svg',
    },
    black: {
      pawn: './pawnWhite.svg',
      rook: './rookWhite.svg',
      knight: './knightWhite.svg',
      bishop: './bishopWhite.svg',
      queen: './queenWhite.svg',
      king: './kingWhite.svg',
    },
  };
  
  export function getPieceIcon(type, color) {
    return icons[color][type];
  }