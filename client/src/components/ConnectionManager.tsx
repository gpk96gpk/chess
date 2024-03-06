import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SocketContext } from "../context/SocketContext";
import { useContext } from 'react';

const ConnectionManager = () => {
    const socket = useContext(SocketContext);
    const [roomId, setRoomId] = useState(Number);
    const navigate = useNavigate();
    const { roomCode } = useParams();

    let index = 0;
    let whitePawnIndex = 24;
    let whiteMajorIndex = 16;
    const createPiece = (type: string, color: string, position: Position, index: number) => ({ type, color, position, hasMoved: false, isHighlighted: false, index });
    const createPawn = (color: string, position: Position, index: number) => ({ type: 'pawn', color, position, hasMoved: false, isHighlighted: false, index });
    const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    const initialBoard: GameStateType = {
        board: [
            majorPieces.map((type, i) => createPiece(type, 'black', [0, i], index++)),
            Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
            ...Array(4).fill(null).map(() =>
                Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, isHighlighted: false }))
            ),
            Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], whitePawnIndex++)),
            majorPieces.map((type, i) => createPiece(type, 'white', [7, i], whiteMajorIndex++)),
        ],
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

    const createRoom = () => {
        const newRoomId = Math.floor(1000 + Math.random() * 9000);
        setRoomId(newRoomId);
        if (socket) {
            socket.emit('createRoom', newRoomId, initialBoard);
        }
        // Copy the text inside the text field for testing
        navigator.clipboard.writeText(newRoomId.toString());


        navigate(`/game/${newRoomId}`);
    }

    const joinRoom = () => {
        if (socket) {
            socket.emit('joinRoom', roomId);
            console.log('roomCode', roomId)
            socket.emit('loadSaveGame', roomId);
        }
        navigate(`/game/${roomId}`);
        return Number(roomId);
    }

    return (
        <>
            <button onClick={createRoom}>Create Room</button>
            <form onSubmit={(e) => { e.preventDefault(); joinRoom(); }}>
                <input
                    type="text"
                    value={roomId}
                    onChange={e => setRoomId(Number(e.target.value))}
                    placeholder="Enter room ID"
                />
                <button type="submit">Join Room</button>
            </form>
        </>
    );
}

export default ConnectionManager;