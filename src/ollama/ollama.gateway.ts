import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import axios from 'axios';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ollama',
})
export class OllamaGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('generate')
  async handleGenerate(
    @ConnectedSocket() client: Socket,
    @MessageBody() prompt: string,
  ) {
    console.log(prompt);
    const ollamaUrl = 'http://localhost:11434/api/generate';
    const response = await axios.post(
      ollamaUrl,
      {
        model: 'gemma3:4b',
        prompt,
        stream: true,
      },
      { responseType: 'stream' },
    );

    response.data.on('data', (chunck) => {
      const data = chunck.toString();
      try {
        const parsedData = JSON.parse(data);
        client.emit('response', parsedData.response);
      } catch (error) {
        console.error('Error parsing chunk:', error);
      }
    });
    response.data.on('end', () => {
      client.emit('response', '[DONE]');
    });
  }
}
