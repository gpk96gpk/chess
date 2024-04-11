import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from "../context/SocketContext";
import { useContext } from 'react';


const ConnectionManager = () => {
    const socket = useContext(SocketContext);
    const [roomId, setRoomId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorClass, setErrorClass] = useState<string>('');
    const navigate = useNavigate();


    //const { initialBoard } = resetGameState();
    const createRoom = () => {
        const newRoomId = Math.floor(1000 + Math.random() * 9000);
        setRoomId(newRoomId);
        if (socket) {
            socket.emit('createRoom', newRoomId);
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