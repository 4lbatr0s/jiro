"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { httpBatchLink } from "@trpc/client";

//INFO: This component will make tRPC work in our app.
const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {" "}
      {/*INFO: to use trpc client. */}
      <QueryClientProvider client={queryClient}>
        {" "}
        {/*INFO: To use react query. */}
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
