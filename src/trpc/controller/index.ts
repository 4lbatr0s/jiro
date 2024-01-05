import { db } from "@/db";
import {
  authCallbackService,
  deleteFileService,
  getUserFilesService,
  getFileService,
  getFileUploadStatusService
} from "../service";
import { privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const authCallbackProcedure = publicProcedure.query(async () => {
  return await authCallbackService();
});

//INFO: How to use private procedure.
export const getUserFilesProcedure = privateProcedure.query(async ({ ctx }) => {
  const { userId, user } = ctx;
  return await getUserFilesService(userId);
});

//INFO: How to use private procedure with input.
export const deleteFileProcedure = privateProcedure
  .input(
    /*
        INFO: object needs to have an id property, and it should be string!
     */
    z.object({ id: z.string() })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    return await deleteFileService(input, userId);
  });


//INFO: THIS PROCEDURE WILL BE USED TO DO POLLINGS!
export const getFileProcedure = privateProcedure
  .input(
    z.object({ key: z.string() })
  )  //again, ctx comes from middleware.
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    return await getFileService(input, userId);
  });


export const getFielUploadStatusProcedure = privateProcedure
  .input(
    z.object({ fileId: z.string() })
  ).query(async ({ ctx, input }) => {
    const {fileId} = input;
    return await getFileUploadStatusService(fileId, ctx.userId );
  });
