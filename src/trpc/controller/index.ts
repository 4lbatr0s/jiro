import { authCallbackService } from "../service"
import { publicProcedure } from "../trpc"

export const authCallbackProcedure = publicProcedure.query( async () => {
    return await authCallbackService();
}) 