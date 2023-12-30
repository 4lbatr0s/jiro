import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

{
  /*
    INFO: This is a middleware from uploadthing.com
    user => middleware => onUploadComplete webhook (callback)
*/
}
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {

      const {getUser} = getKindeServerSession();
      const user = await getUser();
      if(!user || !user.id) throw new Error("UNAUTHORIZED")
      return {userId: user.id};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      //adding file to database
      const createdFile = await db.file.create({
        data:{
          key:file.key,
          name:file.name,
          userId:metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus:'PROCESSING'
        }
      })
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;