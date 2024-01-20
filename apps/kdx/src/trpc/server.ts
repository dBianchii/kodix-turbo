import { cache } from "react";
import { headers } from "next/headers";

import { createCaller, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  });
});

export const api = createCaller(createContext);

// export const createCaller = cache(async () =>
// appRouter.createCaller(await createTRPCContext({})),
// ); //Probably don't use this one

// export const helpers = createServerSideHelpers({
//   router: appRouter,
//   ctx: await createTRPCContext({}),
//   transformer, // optional - adds superjson serialization
// });
//Apparently, this one is only for preftch and fetch. It's for dehidrating to the cache I believe.
//Let's not use this for now. To actually call procedures from the server, please use createTRPCProxyClient({}) -- https://trpc.io/docs/server/server-side-calls
