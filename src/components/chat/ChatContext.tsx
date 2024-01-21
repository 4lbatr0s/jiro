'use client'

import React, { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from '@tanstack/react-query'
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

//context object
export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});


interface ContextProviderProps {
  fileId: string;
  children: ReactNode;
}

//export chat context provider
export const ChatContextProvider = ({ fileId, children }: ContextProviderProps) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const utils = trpc.useUtils() //INFO: Optimistic UPDATE
  const backupMessage = useRef('');

  const { toast } = useToast(); 


    const { mutate: sendMessage } = useMutation({
      mutationFn: async ({ message }: { message: string }) => {
        const response = await fetch("/api/message", {
          method: "POST",
          body: JSON.stringify({
            fileId,
            message,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        return response.body;
      },
      //INFO: OPTIMISTIC UPDATE
      onMutate: async ({message}) => {
        backupMessage.current = message
        setMessage('')
        //step 1
        await utils.getFileMessages.cancel()
        //step 2 
        const previousMessages = utils.getFileMessages.getInfiniteData()

        //step3 
        utils.getFileMessages.setInfiniteData({
          fileId, limit:INFINITE_QUERY_LIMIT
        },
        (old)=> {
          if(!old){
            return {
              pages:[], 
              pageParams:[]
            }
          }

          let newPages = [...old.pages]

          let latestPage = newPages[0]!

          latestPage.messages = [
            {
              createdAt:new Date().toISOString(),
              id:crypto.randomUUID(),
              text:message,
              isUserMessage:true
            },
            ...latestPage.messages
          ]
          newPages[0] = latestPage;

          return {
            ...old,
            pages:newPages
          }
        }
        )

        setIsLoading(true)
        return {
          previousMessages:previousMessages?.pages.flatMap((page) => page.messages) ?? []
        }
      },

      onError:(_, __, context) => {
        setMessage(backupMessage.current)
          utils.getFileMessages.setData(
            {fileId},
            {messages:context?.previousMessages ?? []}
          )
        },
      onSettled: async () => {
        setIsLoading(false)
        await utils.getFileMessages.invalidate(); //refetch the messages
      }
    });

  //Its going to get message from text area and set it to the message state.
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
