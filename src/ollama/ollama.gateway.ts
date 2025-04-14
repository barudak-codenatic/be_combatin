import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import axios from 'axios';
import { Server, Socket } from 'socket.io';
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaService } from './ollama.service';


@WebSocketGateway({
  cors : {
    origin : '*'
  },
  namespace : '/ollama'
})
export class OllamaGateway {
  @WebSocketServer()
  server : Server;

  constructor(private readonly ollama : OllamaService) {}

  @SubscribeMessage('generate')
  async handleGenerate(
    @ConnectedSocket() client : Socket,
    @MessageBody() prompt : string
  ) {
    const newPrompt = await this.ollama.indexMAterials(prompt)
    console.log(newPrompt)

    // const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });
    // const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    //   collectionName: "materials",
    //   url: "http://localhost:8000",
    // });

    // const relevantDocs = await vectorStore.similaritySearch(prompt, 3); 
    // const references = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    // const fullPrompt = `Berikut adalah beberapa referensi materi:\n${references}\n\nSekarang jawab berdasarkan referensi di atas:\n${prompt}`;
    // console.log(fullPrompt)
    

    const ollamaUrl = 'http://localhost:11434/api/generate'
    const response = await axios.post(
      ollamaUrl,
      {
        model : 'deepseek-r1:1.5b',
        prompt : newPrompt,
        stream : true
      },
      { responseType : 'stream'}
    )
    response.data.on('data', (chunck)=>{
      const data = chunck.toString();
      try {
        const parsedData = JSON.parse(data)
        client.emit('response', parsedData.response)
      } catch (error) {
        console.error('Error parsing chunk:', error);
      }
    })
    response.data.on('end', () => {
      client.emit('response', '[DONE]'); 
    });
  }
}
