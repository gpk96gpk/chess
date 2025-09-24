import { createContext } from "react";
import { Socket } from "socket.io-client";

interface MockSocket {
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
}

export const SocketContext = createContext<Socket | MockSocket | undefined>(undefined);