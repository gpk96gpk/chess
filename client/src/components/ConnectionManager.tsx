import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from "../context/SocketContext";
import { useContext } from 'react';
import resetGameState from '../gameLogic/resetGameState';


const ConnectionManager = () => {
    const socket = useContext(SocketContext);
    const [roomId, setRoomId] = useState(Number);
    const navigate = useNavigate();


    //const { initialBoard } = resetGameState();
    const createRoom = () => {
        const newRoomId = Math.floor(1000 + Math.random() * 9000);
        setRoomId(newRoomId);
        if (socket) {
            socket.emit('createRoom', newRoomId);
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