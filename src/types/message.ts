import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

//INFO: HOW TO REACH TRPC RETURN TYPES! 
type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput["getFileMessages"]["messages"]

type OmitText = Omit<Messages[number], "text"> //INFO: Omit: get Messages properties except the "text" property.

type ExtendedText = {
    text: string | JSX.Element
}
  
//INFO: what we did is basically, convert text string to string | JSX.Element.
export type ExtendedMessage = OmitText & ExtendedText