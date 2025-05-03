import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoom, Player } from './types/game.type';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private players: Map<string, Player> = new Map();
  private gameRooms: Map<string, GameRoom> = new Map();

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; name: string },
  ) {
    const player: Player = {
      id: data.userId,
      name: data.name,
      isReady: false,
      socketId: client.id,
    };

    console.log(data);

    this.players.set(client.id, player);

    client.emit('registered', {
      playerId: player.id,
      playerName: player.name,
    });

    this.server.emit('playerList', Array.from(this.players.values()));
  }

  @SubscribeMessage('challengePlayer')
  handleChallenge(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetPlayerId: string },
  ) {
    const challenger = this.players.get(client.id);
    const targetPlayer = Array.from(this.players.values()).find(
      (p) => p.id === data.targetPlayerId,
    );

    if (!challenger || !targetPlayer) {
      client.emit('challengeError', { message: 'Player not found' });
      return;
    }

    // Create a game room
    const roomId = uuidv4();
    const gameRoom: GameRoom = {
      id: roomId,
      players: [challenger, targetPlayer],
      status: 'waiting',
      gameConfig: {
        mode: 'bubble',
        duration: 60,
      },
    };

    this.gameRooms.set(roomId, gameRoom);

    // Notify both players
    this.server.to(targetPlayer.socketId).emit('challengeReceived', {
      roomId,
      challenger: {
        id: challenger.id,
        name: challenger.name,
      },
    });

    client.emit('challengeSent', {
      roomId,
      target: {
        id: targetPlayer.id,
        name: targetPlayer.name,
      },
    });
  }

  @SubscribeMessage('acceptChallenge')
  handleAcceptChallenge(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const gameRoom = this.gameRooms.get(data.roomId);
    if (!gameRoom) {
      client.emit('gameError', { message: 'Game room not found' });
      return;
    }

    gameRoom.status = 'playing';

    // Join both players to the room
    gameRoom.players.forEach((player) => {
      this.server.to(player.socketId).emit('gameStarted', {
        roomId: gameRoom.id,
        gameConfig: gameRoom.gameConfig,
        players: gameRoom.players.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      });
    });
  }

  @SubscribeMessage('gameUpdate')
  handleGameUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; score: number },
  ) {
    const gameRoom = this.gameRooms.get(data.roomId);
    if (!gameRoom) return;

    // Broadcast score update to other player
    const otherPlayer = gameRoom.players.find((p) => p.socketId !== client.id);
    if (otherPlayer) {
      this.server.to(otherPlayer.socketId).emit('opponentUpdate', {
        score: data.score,
      });
    }
  }

  @SubscribeMessage('gameEnd')
  handleGameEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; finalScore: number },
  ) {
    const gameRoom = this.gameRooms.get(data.roomId);
    if (!gameRoom) return;

    gameRoom.status = 'finished';

    // Notify both players of game end
    gameRoom.players.forEach((player) => {
      this.server.to(player.socketId).emit('gameEnded', {
        winner: player.socketId === client.id ? 'you' : 'opponent',
        finalScore: data.finalScore,
      });
    });

    // Clean up the room
    this.gameRooms.delete(data.roomId);
  }

  handleDisconnect(client: Socket) {
    const player = this.players.get(client.id);
    if (player) {
      this.players.delete(client.id);
      this.server.emit('playerList', Array.from(this.players.values()));

      // Handle any active game rooms
      for (const [roomId, room] of this.gameRooms.entries()) {
        if (room.players.some((p) => p.socketId === client.id)) {
          room.players.forEach((p) => {
            if (p.socketId !== client.id) {
              this.server.to(p.socketId).emit('opponentDisconnected');
            }
          });
          this.gameRooms.delete(roomId);
        }
      }
    }
  }
}
