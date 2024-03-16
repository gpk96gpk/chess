"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
function resetGameState() {
    var index = 0;
    var whitePawnIndex = 24;
    var whiteMajorIndex = 16;
    var createPiece = function (type, color, position, index) { return ({ type: type, color: color, position: position, hasMoved: false, index: index }); };
    var majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    var initialBoard = {
        board: __spreadArray(__spreadArray([
            majorPieces.map(function (type, i) { return createPiece(type, 'black', [0, i], index++); }),
            Array(8).fill(null).map(function (_, i) { return createPiece('pawn', 'black', [1, i], index++); })
        ], Array(4).fill(null).map(function () {
            return Array(8).fill(null).map(function () { return ({ type: 'empty', color: 'none', hasMoved: false, position: [], index: index }); });
        }), true), [
            Array(8).fill(null).map(function (_, i) { return createPiece('pawn', 'white', [6, i], whitePawnIndex++); }),
            majorPieces.map(function (type, i) { return createPiece(type, 'white', [7, i], whiteMajorIndex++); }),
        ], false),
        history: [],
        turn: 'black',
        kingPositions: { black: [0, 4], white: [7, 4] },
        threateningPiecesPositions: {
            black: [
                // [0, -1] horizontal
                [[0, 3], [0, 2], [0, 1], [0, 0]],
                // [0, 1] horizontal
                [[0, 5], [0, 6], [0, 7]],
                // [-1, 0] vertical
                [],
                // [1, 0] vertical
                [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
                // [-1, -1] diagonal
                [],
                // [-1, 1] diagonal
                [],
                // [1, -1] diagonal
                [[1, 3], [2, 2], [3, 1], [4, 0]],
                // [1, 1] diagonal
                [[1, 5], [2, 6], [3, 7]],
                //knight moves
                // [-2, -1] knight vertical
                [],
                // [-2, 1] knight vertical
                [],
                // [2, -1] knight vertical
                [[2, 3]],
                // [2, 1] knight vertical
                [[2, 5]],
                // [-1, -2] knight horizontal
                [],
                // [-1, 2] knight horizontal
                [],
                // [1, -2] knight horizontal
                [[1, 2]],
                // [1, 2] knight horizontal
                [[1, 6]]
            ],
            white: [
                // [0, -1] horizontal
                [[7, 3], [7, 2], [7, 1], [7, 0]],
                // [0, 1] horizontal
                [[7, 5], [7, 6], [7, 7]],
                // [-1, 0] vertical
                [[6, 4], [5, 4], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4]],
                // [1, 0] vertical
                [],
                // [-1, -1] diagonal
                [[6, 3], [5, 2], [4, 1], [3, 0]],
                // [-1, 1] diagonal
                [[6, 5], [5, 6], [4, 7]],
                // [1, -1] diagonal
                [],
                // [1, 1] diagonal
                [],
                // [-2, -1] knight vertical
                [[5, 3]],
                // [-2, 1] knight vertical
                [[5, 5]],
                // [2, -1] knight vertical
                [],
                // [2, 1] knight vertical
                [],
                // [-1, -2] knight horizontal
                [[6, 2]],
                // [-1, 2] knight horizontal
                [[6, 6]],
                // [1, -2] knight horizontal
                [],
                // [1, 2] knight horizontal
                []
            ]
        },
        piecePositions: {
            black: [
                { id: 0, type: 'rook', position: [0, 0], color: 'black' },
                { id: 1, type: 'knight', position: [0, 1], color: 'black' },
                { id: 2, type: 'bishop', position: [0, 2], color: 'black' },
                { id: 3, type: 'queen', position: [0, 3], color: 'black' },
                { id: 4, type: 'king', position: [0, 4], color: 'black' },
                { id: 5, type: 'bishop', position: [0, 5], color: 'black' },
                { id: 6, type: 'knight', position: [0, 6], color: 'black' },
                { id: 7, type: 'rook', position: [0, 7], color: 'black' },
                { id: 8, type: 'pawn', position: [1, 0], color: 'black' },
                { id: 9, type: 'pawn', position: [1, 1], color: 'black' },
                { id: 10, type: 'pawn', position: [1, 2], color: 'black' },
                { id: 11, type: 'pawn', position: [1, 3], color: 'black' },
                { id: 12, type: 'pawn', position: [1, 4], color: 'black' },
                { id: 13, type: 'pawn', position: [1, 5], color: 'black' },
                { id: 14, type: 'pawn', position: [1, 6], color: 'black' },
                { id: 15, type: 'pawn', position: [1, 7], color: 'black' },
            ],
            white: [
                { id: 16, type: 'rook', position: [7, 0], color: 'white' },
                { id: 17, type: 'knight', position: [7, 1], color: 'white' },
                { id: 18, type: 'bishop', position: [7, 2], color: 'white' },
                { id: 19, type: 'queen', position: [7, 3], color: 'white' },
                { id: 20, type: 'king', position: [7, 4], color: 'white' },
                { id: 21, type: 'bishop', position: [7, 5], color: 'white' },
                { id: 22, type: 'knight', position: [7, 6], color: 'white' },
                { id: 23, type: 'rook', position: [7, 7], color: 'white' },
                { id: 24, type: 'pawn', position: [6, 0], color: 'white' },
                { id: 25, type: 'pawn', position: [6, 1], color: 'white' },
                { id: 26, type: 'pawn', position: [6, 2], color: 'white' },
                { id: 27, type: 'pawn', position: [6, 3], color: 'white' },
                { id: 28, type: 'pawn', position: [6, 4], color: 'white' },
                { id: 29, type: 'pawn', position: [6, 5], color: 'white' },
                { id: 30, type: 'pawn', position: [6, 6], color: 'white' },
                { id: 31, type: 'pawn', position: [6, 7], color: 'white' },
            ],
        },
        checkStatus: {
            black: false,
            white: false,
            direction: -1,
        },
        checkmateStatus: {
            black: false,
            white: false,
        },
    };
    return initialBoard;
}
exports.default = resetGameState;
