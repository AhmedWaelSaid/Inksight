import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  PDFUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) {
        throw new Error("Unauthorized");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const CreatedFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.ufsUrl,
          uploadStatus: "PROCESSING",
        },
      });
      try {
        const res = await fetch(file.ufsUrl);
        const blob = await res.blob();
        const Loader = new WebPDFLoader(blob);
        const pageleveldocs = await Loader.load();
        const docsAmt = pageleveldocs.length;
        const pinecone = await getPineconeClient() 

       
        const pineconeIndex = pinecone.index('ink-sight') 
        
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })
        
        await PineconeStore.fromDocuments(
          pageleveldocs,
          embeddings,
          {
            pineconeIndex,
            namespace: CreatedFile.id,
          }
        )

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: CreatedFile.id,
          },
        });
      } catch (error) {
        console.log(error);
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: CreatedFile.id,
          },
        });
      }

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
