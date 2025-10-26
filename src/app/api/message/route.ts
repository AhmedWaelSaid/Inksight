import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/sendmessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { getPineconeClient } from "@/lib/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { geminiAi } from "@/lib/geminiAi";

export const POST = async (req: NextRequest)=> {

const  body = await req.json()

const {getUser} =  getKindeServerSession()

const user = await getUser()
const userId = user?.id

if(!userId) {
    return new Response('Unauthorized' , {status:401})
}

const {fileId ,message} = SendMessageValidator.parse(body)
const file = await db.file.findFirst({
    where: {
        id:fileId,
        userId
    }
})

if (!file) return new Response('File Not Found' , {status:404})

    await db.message.create({
        data:{
           text: message ,
           isUsermessage: true ,
           fileId,
           userId 
        }
    })

        
    const pinecone = await getPineconeClient() 

       
    const pineconeIndex = pinecone.index('ink-sight-gemini') 
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!,
      model: "models/text-embedding-004"
    })
    
   const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings , {
        pineconeIndex,
        namespace:file.id
    }
   )
   const result = await vectorStore.similaritySearch(message,4)

   const prevMessages = await db.message.findMany({
    where:{
        fileId
    },
    take:6 ,
    orderBy: {
        createdAt:'asc'
    }
   })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUsermessage ? ('user' as const) : ('assistant' as const),
    content: msg.text,
  }))

  const systemPrompt = `Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.

PREVIOUS CONVERSATION:
${formattedPrevMessages.map((message) => {
  if (message.role === 'user') return `User: ${message.content}\n`
  return `Assistant: ${message.content}\n`
}).join('')}

CONTEXT:
${result.map((r) => r.pageContent).join('\n\n')}

USER INPUT: ${message}`

  const stream = await geminiAi.stream(systemPrompt)

  const encoder = new TextEncoder()
  let fullResponse = ''

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.content.toString()
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }

        // Save the complete response to database
        await db.message.create({
          data: {
            text: fullResponse,
            isUsermessage: false,
            fileId,
            userId,
          },
        })

        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}