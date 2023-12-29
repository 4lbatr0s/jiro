"use client";
import React, { useState } from "react";
import UploadButton from "./UploadButton";
import { trpc } from "@/app/_trpc/client";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";

{
  /**
  REQUIREMENTS:
  -LIST ALL FILES
  -DELETE FILES
  -UPLOAD FILES
  -

  m1 = 4px = 0.25rem
*/
}
const Dashboard = () => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const utils = trpc.useContext(); //INFO: Helps to invalidate queries.

  //INFO: TRPC AUTOMATICALLY KNOWS THE TYPE OF THE DATA! ITS SO IMPORTANT
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  //INFO: How to send POST request to trpc api from client!
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate(); //INFO: How to invalidate!
    },
    onMutate({id}){ //INFO: we can reach the id because we pass the id to the Mutate below in the component
      setCurrentlyDeletingFile(id)
    },
    onSettled(){
      setCurrentlyDeletingFile(null)
    }
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>
        <UploadButton />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div>

                  <div>
                    <Button
                      onClick={() => deleteFile({ id: file.id })}
                      variant={`destructive`}
                      size="sm"
                      className="w-full"
                    >
                      {" "}
                      { currentlyDeletingFile === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                      ) : <Trash className="h-4 w-4" /> }
                      
                    </Button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800"></Ghost>
          <h3 className="font=semibold text-xl">
            Document-free zone: No uploads yet!
          </h3>
          <p>Let&apos;s kick things off! Upload your first PDF now</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
