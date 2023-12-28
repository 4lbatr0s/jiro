import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

const AuthCallback = async () => {
  //INFO: the only purpose of this page is to maintain EVENTUAL CONSISTENCY.
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin"); //dashboard.
  const {data, isLoading} = await trpc.authCallback.useQuery();
  if(data) 
    router.push(origin ? `/${origin}` : `/dashboard`);
  else

  console.log("isLoading:", isLoading);
  console.log("data:", data);
};

export default AuthCallback;
