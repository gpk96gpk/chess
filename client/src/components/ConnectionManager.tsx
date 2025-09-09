import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from "../context/SocketContext";
import { useContext } from 'react';
import { GameStateType, PieceNames,Position,PieceType } from '../types/clientTypes';


const ConnectionManager = () => {
    const socket = useContext(SocketContext);
    const [roomId, setRoomId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorClass, setErrorClass] = useState<string>('');
    const navigate = useNavigate();

    let index = 0;
    let whitePawnIndex = 24;
    let whiteMajorIndex = 16;
    
    const createPiece = (type: PieceNames, color: 'black' | 'white' | 'none', position: Position, index: number): PieceType => ({ type, color, position, hasMoved: false, index });
    
    const majorPieces: PieceNames[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    const initialBoard: GameStateType = {
        board: [
            majorPieces.map((type: PieceNames, i: number) => createPiece(type, 'black', [0, i], index++)),
            Array(8).fill(null).map((_, i) => createPiece('pawn', 'black', [1, i], index++)),
            ...Array(4).fill(null).map(() =>
                Array(8).fill(null).map(() => ({ type: 'empty', color: 'none', hasMoved: false, position: [], index } as PieceType))
            ),
            Array(8).fill(null).map((_, i) => createPiece('pawn', 'white', [6, i], whitePawnIndex++)),
            majorPieces.map((type, i) => createPiece(type, 'white', [7, i], whiteMajorIndex++)),
        ],
        history: [],
        turn: 'black',
        kingPositions: { black: [0, 4], white: [7, 4] },
        threateningPiecesPositions: {
            black: [
                // [0, -1] horizontal 0
                [[0, 3], [0, 2], [0, 1], [0, 0]],
                // [0, 1] horizontal 1
                [[0, 5], [0, 6], [0, 7]],
                // [-1, 0] vertical 2
                [],
                // [1, 0] vertical 3
                [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
                // [-1, -1] diagonal 4
                [],
                // [-1, 1] diagonal 5
                [],
                // [1, -1] diagonal 6
                [[1, 3], [2, 2], [3, 1], [4, 0]],
                // [1, 1] diagonal 7
                [[1, 5], [2, 6], [3, 7]],
                //knight moves
                // [-2, -1] knight vertical 8
                [],
                // [-2, 1] knight vertical 9
                [],
                // [2, -1] knight vertical 10
                [[2, 3]],
                // [2, 1] knight vertical 11
                [[2, 5]],
                // [-1, -2] knight horizontal 12
                [],
                // [-1, 2] knight horizontal 13
                [],
                // [1, -2] knight horizontal 14
                [[1, 2]],
                // [1, 2] knight horizontal 15
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
        username1: 'Guest Player 1',
        username2: 'Guest Player 2'
    };
    
    

    //const { initialBoard } = resetGameState();
    const createRoom = () => {
        const newRoomId = Math.floor(1000 + Math.random() * 9000);
        setRoomId(newRoomId);
        if (socket) {
            socket.emit('createRoom', newRoomId, initialBoard);
        }
        // Copy the text inside the text field for testing
        // navigator.clipboard.writeText(newRoomId.toString());


        navigate(`/game/${newRoomId}`);
    }

    const joinRoom = async () => {
        if (socket) {
            const errorMessage = await new Promise<string | null>((resolve) => {
                if (roomId === null || roomId === undefined) {
                    resolve('Room ID cannot be null');
                    console.log('Room ID cannot be null', roomId);
                }
                if (roomId !== null) {
                    socket.emit('joinRoom', roomId);
                }
    
                socket.on('roomError', (errorMsg) => {
                    setError(errorMsg);
                    console.log('roomError', errorMsg);
                    resolve(errorMsg);
                });
    
                socket.emit('loadSaveGame', roomId);
    
                // If no error is received after 5 seconds, reject the promise
                setTimeout(() => resolve('Timeout'), 2000);
            }).catch((error) => {
                console.log('errorMessage', error);
                return error;
            });
    
            if (roomId !== null && errorMessage !== 'Room ID cannot be null' && errorMessage !== 'The room is empty.') {
                console.log('errorMessage', errorMessage, roomId);
                navigate(`/game/${roomId}`);
            } else {
                setErrorClass('error'); // Apply the error class
                console.log('errorMessage', errorMessage, roomId);
            }
            return Number(roomId);
        }
    }
    if (error){
        console.error('error', error);
    }
    // Revert the error class after a delay
    useEffect(() => {
        if (errorClass === 'error') {
            const timer = setTimeout(() => setErrorClass(''), 700); // Revert the error class after 5 seconds
            return () => clearTimeout(timer); // Clean up the timer
        }
    }, [errorClass]);

    return (
        <div className='ConnectionManager'>
            <button onClick={createRoom}>Create Room</button>
            <form onSubmit={(e) => { e.preventDefault(); joinRoom(); }}>
                <input
                    type='text'
                    inputMode='numeric'
                    pattern='[0-9]+'
                    value={roomId ?? ''}
                    onChange={e => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                            setRoomId(value ? Number(value) : null);
                        }
                    }}
                    placeholder='Enter Room #'
                    style={{ fontSize: '16px' }}
                />
                <button type='submit' className={`join-room-button ${errorClass}`}>Join Room</button>
            </form>
        </div>
    );
}

export default ConnectionManager;