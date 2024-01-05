//INFO: Service implementations for trpc.

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";

export const authCallbackService = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id || !user?.email) throw new TRPCError({ code: "UNAUTHORIZED" });

  //check if user is in the db.
  //INFO: HOW TO USE Prisma/Client
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });
  if (!dbUser) {
    //create user
    await db.user.create({
      data: {
        id: user.id,
        email: user.email,
      },
    });
  }
  return { success: true };
};

export const getUserFilesService = async (userId: string) => {
  try {
    return await db.file.findMany({
      where: {
        userId: userId,
      },
    });
  } catch (error) {
    console.error("Error in getUserFilesService:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};

export const deleteFileService = async (
  input: { id: string },
  userId: string
) => {
  try {
    const file = await db.file.findFirst({
      where: {
        id: input.id,
        userId,
      },
    });

    if (!file) throw new TRPCError({ code: "NOT_FOUND" });
    await db.file.delete({
      where: {
        id: input.id,
      },
    });

    return file;
  } catch (error) {}
};

export const getFileService = async (
  input: { key: string },
  userId: string
) => {
  try {
    const file = await db.file.findFirst({
      where: {
        key: input.key,
        userId,
      },
    });
    if (!file) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return file;
  } catch (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};

export const getFileUploadStatusService = async (
  fileId: string,
  userId: string
) => {
  try {
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
    if (!file) {
      return { status: "PENDING" as const }; //INFO: as const: we want status to be exactly the "PENDING"
    }
    return { status: file.uploadStatus };
  } catch (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};
