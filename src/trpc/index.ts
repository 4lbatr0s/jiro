import { authCallbackProcedure, deleteFileProcedure, getUserFilesProcedure, getFileProcedure} from './controller';
import { router } from './trpc';
 
export const appRouter = router({
  //INFO: test is basically an api endpoint.
  authCallback: authCallbackProcedure,
  getUserFiles: getUserFilesProcedure,
  deleteFile: deleteFileProcedure,
  getFile: getFileProcedure,
});
 

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;