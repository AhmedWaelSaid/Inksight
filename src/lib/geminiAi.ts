import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const geminiAi = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.0-flash-exp",
    temperature: 0,
    streaming: true,
});