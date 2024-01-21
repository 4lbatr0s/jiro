"use client";

import React, { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { decode } from "punycode";

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
export const ChatContextProvider = ({
  fileId,
  children,
}: ContextProviderProps) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useUtils(); //INFO: Optimistic UPDATE
  const backupMessage = useRef("");

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
    //INFO: ONMUTATE IS OPTIMISTIC UPDATE FOR USER MESSAGES
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");
      //step 1
      await utils.getFileMessages.cancel();
      //step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();

      //step3
      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINITE_QUERY_LIMIT,
        },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          let newPages = [...old.pages];

          let latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];
          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);
      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    //INFO: with onsuccess, we get ai answer's text realtime on chat.
    //INFO: OPTIMISTIC UPDATE FOR AI RESPONSES
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "Something went wrong while sending the message",
          description: "Reload the page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      //accumulated response
      let accResponse = "";

      //read the content of the stream
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        //get the string content of the reading
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        //append chunk to actual message
        utils.getFileMessages.setInfiniteData(
          {
            fileId,
            limit: INFINITE_QUERY_LIMIT,
          },
          (old) => {
            if (!old) return { pages: [], pageParams: [] };

            //to prevent to insert same message to the chat multiple times!
            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );

            let updatedPages = old.pages.map((page)=> {
              if(page===old.pages[0]) {
                let updatedMessages

                if(!isAiResponseCreated){
                  updatedMessages = [{
                    createdAt: new Date().toISOString(),
                    id:"ai-response",
                    text:accResponse,
                    isUserMessage:false
                  },
                  ...page.messages
                ]
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if(message.id ==="ai-response"){
                      return {
                        ...message, 
                        text:accResponse,
                      }
                    }
                    return message
                  })
                }
                return {
                  ...page,
                  messages:updatedMessages
                }
              }
              return page
            })
            return {...old, pages:updatedPages}
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.getFileMessages.invalidate(); //refetch the messages
    },
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
