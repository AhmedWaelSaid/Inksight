
import { Pinecone } from '@pinecone-database/pinecone' // اسم الكلاس الجديد هو Pinecone

export const getPineconeClient = async () => {
  // يتم تهيئة العميل مباشرة في الباني (Constructor)
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    
    // ملاحظة: لم يعد مطلوبًا تمرير 'environment' أو 'index name' هنا
  })

  // لم تعد بحاجة لانتظار (await) أو دالة init() منفصلة
  return client
}


// // lib/pinecone.ts
// import { Pinecone } from "@pinecone-database/pinecone";

// const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;

// if (!PINECONE_API_KEY) {
//   throw new Error("Missing PINECONE_API_KEY environment variable");
// }

// export const pinecone = new Pinecone({
//   apiKey: PINECONE_API_KEY,
// });

// export const indexName = "ink-sight";

// export async function initPinecone() {
//   const existing = await pinecone.listIndexes();

//   await pinecone.createIndexForModel({
//     name: indexName,
//     cloud: "aws",
//     region: "us-east-1",
//     embed: {
//       model: "llama-text-embed-v2",
//     },
//   });
// }
