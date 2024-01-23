import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone"
import { getPineconeClient } from "@/app/lib/pinecode";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

{
  /*
    INFO: This is a middleware from uploadthing.com
    user => middleware => onUploadComplete webhook (callback)
*/
}
const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) throw new Error("UNAUTHORIZED");
  
  //check user's subscription plan
  const subscriptionPlan = await getUserSubscriptionPlan();
  
  return { subscriptionPlan,  userId: user.id};
}

const onUploadComplete = async ({
  metadata, file
}:{
  metadata: Awaited<ReturnType<typeof middleware>>, file:{
    key:string,
    name:string,
    url:string
  }
}) => { 
  {

    const isFileExist = await db.file.findFirst({
      where:{
        key:file.key
      }
    })

    if (isFileExist) return;

    //adding file to database
    const createdFile = await db.file.create({
      data: {
        key: file.key,
        name: file.name,
        userId: metadata.userId,
        url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
        uploadStatus: "PROCESSING",
      },
    });
    //INFO: When its uploaded, we are going to index our file
    //INFO: We will use a vector database for it.
    try {
      const response = await fetch(
        `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
      );
      const blob = await response.blob(); //to index, we need text to be blob
      const loader = new PDFLoader(blob); //loaded pdf into memory.

      const pageLevelDocs = await loader.load();

      const pagesAmt = pageLevelDocs.length; //number of pages.

      //INFO: how to prevent plan overuse.
      const {subscriptionPlan} = metadata;
      const {isSubscribed} = subscriptionPlan;
      const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
      const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

      if((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)){
        await db.file.update({
          data:{
            uploadStatus:"FAILED"
          }, 
          where:{
            id:createdFile.id
          }
        })
      }

      //vectorize and index entire document
      const pinecone = await getPineconeClient();
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      // const embeddings = new HuggingFaceTransformersEmbeddings({
      //   modelName: "Xenova/all-MiniLM-L6-v2",
      // });
      
      (async () => {
        console.log(`OPENAI_API_KEY:${process.env.OPENAI_API_KEY}\nPINECONE_ENVIRONMENT:${process.env.PINECONE_ENVIRONMENT}\nPINECONE_API_KEY:${process.env.PINECONE_API_KEY}`)
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          maxConcurrency: 5,
          namespace: createdFile.id,
        });
      }
      )();


      //INFO: We update uploadStatus to SUCCESS when its turned to vector.
      await db.file.update({
        data: {
          uploadStatus: "SUCCESS",
        },
        where: {
          id: createdFile.id,
        },
      });
    } catch (error) {
      console.log(`
        FAILED TO VECTORIZE\n
        REASON: ${error}
      `)
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }
  }
}


export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
