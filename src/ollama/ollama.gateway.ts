import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import axios from 'axios';
import { Server, Socket } from 'socket.io';
import { OllamaService } from './ollama.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ollama',
})
export class OllamaGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ollama: OllamaService) {}

  @SubscribeMessage('generate')
  async handleGenerate(
    @ConnectedSocket() client: Socket,
    @MessageBody() prompt: string,
  ) {
    const { newPrompt, source_url, title } =
      await this.ollama.indexMAterials(prompt);

    const ollamaUrl = 'http://localhost:11434/api/generate';
    const response = await axios.post(
      ollamaUrl,
      {
        model: 'gemma3:4b',
        prompt: newPrompt,
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
      client.emit('source', { title, url: source_url });
    });
  }
}
