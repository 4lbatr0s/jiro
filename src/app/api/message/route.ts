import { SendMessageValidator } from "@/app/lib/validators/SendMessageValidator";
import { db } from "@/db";
import { getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

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

  if(!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text:message,
      isUserMessage:true,
      userId,
      fileId
    }
  })

  //
};
