import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { getS3Url } from "@/lib/s3";
 
const f = createUploadthing();
 
const auth = (req: Request) => ({ id: "fakeId" }); 
export const ourFileRouter = {

pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
 
    .middleware(async () => {
        const { getUser } = getKindeServerSession()
        const user = await getUser()
      
        if (!user || !user.id) throw new Error('Unauthorized')
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const createdFile = await db.file.create({
            data: {
              key: file.key,
              name: file.name,
              userId: metadata.userId,
              url: getS3Url(file.key),
              uploadStatus: 'PROCESSING',
            },
          })

          try {
            const response = await fetch(getS3Url(file.key),)

            const blob = await response.blob()

            const loader = new PDFLoader(blob)

            const pageLevelDocs = await loader.load()

            const pagesAmt = pageLevelDocs.length

        // vectorize and index entire document
            const pineconeIndex = pinecone.Index('codecai')

            const embeddings = new OpenAIEmbeddings({
              openAIApiKey: process.env.OPENAI_API_KEY,
            })

            await PineconeStore.fromDocuments(
              pageLevelDocs,
              embeddings,
              {
                pineconeIndex,
                namespace: createdFile.id,
              }
            )
        
            await db.file.update({
              data: {
                uploadStatus: 'SUCCESS',
              },
              where: {
                id: createdFile.id,
              },
            })

            
          } catch (error) {
            await db.file.update({
              data: {
                uploadStatus: 'FAILED',
              },
              where: {
                id: createdFile.id,
              },
            })
          }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter


