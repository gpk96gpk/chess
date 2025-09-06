import { GameStateType, PieceType, PieceColor, Position } from '../types/clientTypes';

type AttackGrid = boolean[][]; // 8x8 grid

function initGrid(): AttackGrid {
  return Array.from({ length: 8 }, () => Array(8).fill(false));
}

function inBounds(y: number, x: number) {
  return y >= 0 && y < 8 && x >= 0 && x < 8;
}

function mark(grid: AttackGrid, y: number, x: number) {
  if (inBounds(y, x)) grid[y][x] = true;
}

function buildGridForColor(gameState: GameStateType, color: PieceColor): AttackGrid {
  const grid = initGrid();
  const pieces = gameState.piecePositions[color] || [];

  // Helper to process sliders
  const slide = (start: Position, directions: number[][]) => {
    const [sy, sx] = start as [number, number];
    directions.forEach(([dy, dx]) => {
      let y = sy + dy;
      let x = sx + dx;
      while (inBounds(y, x)) {
        const p = gameState.board[y][x];
        if (p.type !== 'empty') {
          if (p.color !== color) mark(grid, y, x); // can capture first enemy piece
          break; // stop ray at first piece
        }
        mark(grid, y, x);
        y += dy;
        x += dx;
      }
    });
  };

  for (const p of pieces) {
    const piece = p as PieceType;
    if (!piece || !piece.position || piece.position.length !== 2) continue;
    const [y, x] = piece.position as [number, number];
    switch (piece.type) {
      case 'pawn': {
        const dirs = color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        dirs.forEach(([dy, dx]) => mark(grid, y + dy, x + dx));
        break;
      }
      case 'knight': {
        const kDirs = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        kDirs.forEach(([dy, dx]) => mark(grid, y + dy, x + dx));
        break;
      }
      case 'king': {
        const kDirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        kDirs.forEach(([dy, dx]) => mark(grid, y + dy, x + dx));
        break;
      }
      case 'bishop': {
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        slide(piece.position, dirs);
        break;
      }
      case 'rook': {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        slide(piece.position, dirs);
        break;
      }
      case 'queen': {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        slide(piece.position, dirs);
        break;
      }
      default:
        break;
    }
  }

  return grid;
}

export default function computeAttackMap(gameState: GameStateType): { white: AttackGrid; black: AttackGrid } {
  return {
    white: buildGridForColor(gameState, 'white'),
    black: buildGridForColor(gameState, 'black'),
  };
}

export type AttackMap = ReturnType<typeof computeAttackMap>;

