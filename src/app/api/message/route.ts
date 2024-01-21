import { SendMessageValidator } from "@/app/lib/validators/SendMessageValidator";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "@/app/lib/pinecode";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { openai } from "@/app/lib/openai";
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const POST = async (req: NextRequest) => {
  //endpoint for asking a question to a pdf file
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  //INFO: HOW TO USE A VALIDATOR WITH ZOD IN TRPC!
  //INFO: if this fails, trpc automatically sends an error!
  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  //save message to db.
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  //1.vectorize the message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
  //get the vectorized pdf.
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id, //INFO: Search in the current text.
  });

  //INFO: bring 4 most relevant responses
  const results = await vectorStore.similaritySearch(message, 4);

  //bring the previous messages in a certain format, 
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });
  //format the previous messages of the user
  const formattedPrevMessages = prevMessages.map((message) => ({
    role: message.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: message.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    console.log("message:", message)
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  }
  );

  //use vercel ai sdk to get completions.
  const stream = OpenAIStream(response, {
    async  onCompletion(completion) {
      await db.message.create({
        data:{
          text:completion,
          isUserMessage:false,
          fileId,
          userId
        }
      })
    }
  });
  console.log("streams:", stream)
  return new StreamingTextResponse(stream);
}
