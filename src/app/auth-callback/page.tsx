import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

const AuthCallback = async () => {
  //INFO: the only purpose of this page is to maintain EVENTUAL CONSISTENCY.
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin"); //dashboard.
  const { data, isLoading } = trpc.test.useQuery(); //when the page loads, this is going to be fired.

};

export default AuthCallback;
