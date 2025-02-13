export interface Player {
    id: string;
    name: string;
    socketId: string;
    isReady: boolean;
  }
  
  export interface GameRoom {
    id: string;
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    gameConfig: any;
  }