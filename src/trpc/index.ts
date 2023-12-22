import { publicProcedure, router } from './trpc';
 
export const appRouter = router({
  //INFO: test is basically an api endpoint.
  test:publicProcedure.query(()=> {
    return new Response(JSON.stringify("test"));
  })
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;