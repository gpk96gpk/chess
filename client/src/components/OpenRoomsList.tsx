import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

interface Room {
    roomCode: string;
    players: number;
    maxPlayers: number;
}

const OpenRoomsList = () => {
    const socket = useContext(SocketContext);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [errorClass, setErrorClass] = useState<string>('');
    const navigate = useNavigate();
    
    useEffect(() => {
        if (socket) {
            // Request available rooms when component mounts
            socket.emit('requestAvailableRooms');
            
            // Listen for room updates
            socket.on('availableRooms', (rooms: Room[]) => {
                console.debug('Received available rooms:', rooms);
                setAvailableRooms(rooms);
            });
            
            // Handle room errors
            socket.on('roomError', (errorMsg) => {
                setErrorClass('error');
                console.error('roomError', errorMsg);
            });
        }
        
        return () => {
            if (socket) {
                socket.off('availableRooms');
                socket.off('roomError');
            }
        };
    }, [socket]);
    
    // Revert the error class after a delay
    useEffect(() => {
        if (errorClass === 'error') {
            const timer = setTimeout(() => setErrorClass(''), 700);
            return () => clearTimeout(timer);
        }
    }, [errorClass]);
    
    // Using the same approach as ConnectionManager
    const joinRoom = async (roomCode: string) => {
        if (socket) {
            // Using the ConnectionManager approach which works
            const errorMessage = await new Promise<string | null>((resolve) => {
                socket.emit('joinRoom', roomCode);
                
                const handleRoomError = (errorMsg: string) => {
                    console.error('roomError', errorMsg);
                    resolve(errorMsg);
                    // Important: Remove the listener after receiving the error
                    socket.off('roomError', handleRoomError);
                };
                
                socket.on('roomError', handleRoomError);
                
                // Important: Tell server to load saved game (same as ConnectionManager)
                socket.emit('loadSaveGame', roomCode);
                
                // If no error is received after 2 seconds, proceed
                setTimeout(() => resolve(null), 2000);
            });
            
            if (!errorMessage || (errorMessage !== 'Room ID cannot be null' && 
                errorMessage !== 'The room is empty.')) {
                console.debug('Joining room:', roomCode);
                navigate(`/game/${roomCode}`);
            } else {
                setErrorClass('error');
                console.error('Error joining room:', errorMessage);
            }
        }
    };
    
    return (
        <div className="OpenRoomsList">
            {availableRooms.length === 0 ? (
                <p>NO AVAILABLE GAMES</p>
            ) : (
                <table className="rooms-table">
                    <thead>
                        <tr>
                            <th>ROOM CODE</th>
                            <th>PLAYERS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availableRooms.map((room) => (
                            <tr key={room.roomCode}>
                                <td>{room.roomCode}</td>
                                <td>{room.players}/{room.maxPlayers}</td>
                                <td>
                                    {room.players < room.maxPlayers ? (
                                        <button 
                                            onClick={() => joinRoom(room.roomCode)}
                                            className={`join-room-button ${errorClass}`}
                                        >
                                            Join Room
                                        </button>
                                    ) : (
                                        <span>Full</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OpenRoomsList;