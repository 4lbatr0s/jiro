import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@/trpc";

//INFO: How to create TRPC Client for react!    
export const trpc = createTRPCReact<AppRouter>({});
