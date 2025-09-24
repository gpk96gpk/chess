import { Socket } from 'socket.io-client';

interface MockSocket {
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
}

type EventHandler = (...args: unknown[]) => void;

class LocalAISocket implements MockSocket {
  private gameStateHandlers: EventHandler[] = [];
  private turnHandlers: EventHandler[] = [];
  private gameOverHandlers: EventHandler[] = [];
  private loadSaveGameHandlers: EventHandler[] = [];
  
  emit(event: string, ...args: unknown[]): void {
    console.log(`AI Local Socket - Emit ${event}:`, args);
    
    switch (event) {
      case 'createRoom': {
        // For AI games, just log - no server interaction needed
        console.log('AI room created locally:', args[0]);
        break;
      }
        
      case 'gameState': {
        // Immediately echo back the game state to simulate server response
        const [gameState] = args;
        setTimeout(() => {
          this.gameStateHandlers.forEach(handler => handler(gameState));
        }, 10);
        break;
      }
        
      case 'turn': {
        // Echo back turn state
        const [turnState] = args;
        setTimeout(() => {
          this.turnHandlers.forEach(handler => handler(turnState));
        }, 10);
        break;
      }
        
      case 'gameOver': {
        // Handle game over locally
        const [isGameOver, winner] = args;
        setTimeout(() => {
          this.gameOverHandlers.forEach(handler => handler({ isGameOver, winner }));
        }, 10);
        break;
      }
        
      default:
        console.log(`AI Local Socket - Unhandled emit: ${event}`);
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    console.log(`AI Local Socket - Registering handler for ${event}`);
    
    switch (event) {
      case 'gameState':
        this.gameStateHandlers.push(callback);
        break;
      case 'turn':
        this.turnHandlers.push(callback);
        break;
      case 'gameOver':
        this.gameOverHandlers.push(callback);
        break;
      case 'loadSaveGame':
        this.loadSaveGameHandlers.push(callback);
        break;
      default:
        console.log(`AI Local Socket - Unhandled event listener: ${event}`);
    }
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    console.log(`AI Local Socket - Removing handler for ${event}`);
    
    if (!callback) return;
    
    switch (event) {
      case 'gameState':
        this.gameStateHandlers = this.gameStateHandlers.filter(h => h !== callback);
        break;
      case 'turn':
        this.turnHandlers = this.turnHandlers.filter(h => h !== callback);
        break;
      case 'gameOver':
        this.gameOverHandlers = this.gameOverHandlers.filter(h => h !== callback);
        break;
      case 'loadSaveGame':
        this.loadSaveGameHandlers = this.loadSaveGameHandlers.filter(h => h !== callback);
        break;
    }
  }
}

// Function to determine if we should use the local AI socket
export const isAIRoom = (roomCode: string | undefined): boolean => {
  return roomCode ? roomCode.startsWith('ai-') : false;
};

// Factory function to get the appropriate socket
export const getSocketForRoom = (roomCode: string | undefined, realSocket: Socket): Socket | MockSocket => {
  if (isAIRoom(roomCode)) {
    console.log('Using local AI socket for room:', roomCode);
    return new LocalAISocket();
  }
  
  console.log('Using real socket for room:', roomCode);
  return realSocket;
};

export { LocalAISocket };
