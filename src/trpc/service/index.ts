//INFO: Service implementations for trpc.

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";

export const authCallbackService = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id || !user?.email) throw new TRPCError({ code: "UNAUTHORIZED" });

  //check if user is in the db.
  return { success: true };
};
