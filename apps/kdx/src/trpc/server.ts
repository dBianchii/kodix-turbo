import { cache } from "react";
import { headers } from "next/headers";

import { createCaller, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    auth: await auth(),
    headers: heads,
  });
});

export const trpc = createCaller(createContext);
