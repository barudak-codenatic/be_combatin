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
        moduleId: true,
      },
    });

    const ids = materials.map((i) => i.id);
    const metadatas = materials.map((i) => ({
      source_url: `http://localhost:3000/module/${i.moduleId}/material/${i.id}`,
      title: i.title,
    }));
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

    return this.generatePrompt(
      results.documents[0][0],
      prompt,
      results.metadatas[0][0]?.source_url,
      results.metadatas[0][0]?.title,
    );
  }

  async generatePrompt(
    content: string | null,
    prompt: any,
    url: any,
    title: any,
  ) {
    if (content) {
      const finalPrompt = `Anda adalah asisten AI yang cerdas. Tugas Anda adalah menjawab pertanyaan menggunakan informasi yang disediakan dalam materi referensi di bawah ini.
  
  --- Materi Referensi ---
  ${content}
  --- Akhir Materi Referensi ---
  
  Berdasarkan **hanya** dari materi referensi di atas, jawab pertanyaan berikut. Jika informasi yang relevan untuk menjawab pertanyaan tidak ada dalam materi referensi, mohon sebutkan bahwa informasi tidak ditemukan dalam referensi.
  
  Pertanyaan:
  ${prompt}
  
  Mohon berikan jawaban Anda sepenuhnya dalam **Bahasa Indonesia**. Pastikan seluruh respons Anda menggunakan Bahasa Indonesia dan tidak ada penggunaan bahasa lain.
  `;
      return {
        newPrompt: finalPrompt,
        source_url: url,
        title,
      };
    }
    return { newPrompt: prompt };
  }
}
