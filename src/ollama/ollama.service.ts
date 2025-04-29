import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChromaClient } from 'chromadb';

@Injectable()
export class OllamaService {
  constructor(private prisma: PrismaService) {}

  async indexMAterials(prompt: string) {
    const client = new ChromaClient({
      path: 'http://localhost:8000',
    });

    const collection = await client.getOrCreateCollection({
      name: 'materials',
    });

    const materials = await this.prisma.material.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    const ids = materials.map((i) => i.id);
    const metadatas = materials.map((i) => ({ source: i.title }));
    const documents = materials.map((i) => i.content);

    await collection.upsert({
      ids,
      metadatas,
      documents,
    });

    const results = await collection.query({
      queryTexts: prompt,
      nResults: 1,
    });

    return this.generatePrompt(results.documents[0][0], prompt);
  }

  async generatePrompt(content: string | null, prompt: string) {
    if (content) {
      return `The following reference materials are written in **Bahasa Indonesia**, and the question is also in **Bahasa Indonesia**. Even though this instruction is in English, you **must answer strictly in Bahasa Indonesia**. Do not use English in your response. Here are the reference materials (written in Bahasa Indonesia): ${content} Now, based on the above references, answer the following question in **Bahasa Indonesia**: ${prompt}. Important: Your response must be **entirely in Bahasa Indonesia**. Do not use English in your response.`;
    }
    return prompt;
  }
}
