import { Dispatch, SetStateAction } from "react";
import ConnectionManager from "./ConnectionManager";
import LobbySavedGames from "./LobbySavedGames";
import { GameStateType } from "../types/clientTypes";
import OpenRoomsList from "./OpenRoomsList";


interface LobbySavedGamesProps {
    setGameState: Dispatch<SetStateAction<GameStateType>>;
    username: string | null;
}

const LobbyGameButtons = ({ setGameState, username }: LobbySavedGamesProps) => {
    return (
        <>
            <ConnectionManager />
            <OpenRoomsList />
            <LobbySavedGames setGameState={setGameState} username={username}/>
        </>
    )
};

export default LobbyGameButtons;