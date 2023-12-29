import { initTRPC } from '@trpc/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.create();
export const middleware = t.middleware;

//INFO: How to use middleware in TRPC.
export const isAuth = middleware(async (opts) => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
  
    if (!user || !user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  
    {
      /*INFO: ctx is context, helps us to send any type of value to the procedure */
    }
    return opts.next({
      ctx: {
        userId: user.id,
        user,
        name: "john",
      },
    });
  });
  

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router; // a collection of procedures.
export const publicProcedure = t.procedure; //INFO: Allows us to create an api, its like a public api we can use.
export const privateProcedure = t.procedure.use(isAuth) //INFO: go to middleware before this api endpoint is called.