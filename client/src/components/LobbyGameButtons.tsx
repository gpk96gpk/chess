import { Dispatch, SetStateAction } from "react";
import ConnectionManager from "./ConnectionManager";
import LobbySavedGames from "./LobbySavedGames";
import { GameStateType } from "../types/clientTypes";
import OpenRoomsList from "./OpenRoomsList";
import AISettings from "../ai/AISettings";

interface LobbyGameButtonsProps {
    setGameState: Dispatch<SetStateAction<GameStateType>>;
    username: string | null;
    playingAgainstAI: boolean;
    setPlayingAgainstAI: (value: boolean) => void;
    aiDifficulty: 'easy' | 'medium' | 'hard';
    setAIDifficulty: (value: 'easy' | 'medium' | 'hard') => void;
    // Add these new props
    turnState: 0 | 1 | 2 | 3;
    setTurnState: Dispatch<SetStateAction<0 | 1 | 2 | 3>>;
}

const LobbyGameButtons = ({ 
    setGameState, 
    username,
    playingAgainstAI,
    setPlayingAgainstAI,
    aiDifficulty,
    setAIDifficulty,
    turnState,
    setTurnState
}: LobbyGameButtonsProps) => {
    return (
        <>
            <ConnectionManager />
            <OpenRoomsList />
            <AISettings
                playingAgainstAI={playingAgainstAI}
                setPlayingAgainstAI={setPlayingAgainstAI}
                aiDifficulty={aiDifficulty}
                setAIDifficulty={setAIDifficulty}
                turnState={turnState}
                setTurnState={setTurnState}
            />
            <LobbySavedGames setGameState={setGameState} username={username}/>
        </>
    )
};

export default LobbyGameButtons;