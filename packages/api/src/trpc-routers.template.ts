/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// @ts-expect-error - this is a template file
import { __ROUTER_TYPE__Router as create__ROUTER_TYPE__Router } from "~/__TS_PATH__";
import { appRouter } from "~/routers/root";
import { createCallerFactory } from "~/trpc";

type __ROUTER_TYPE__Router = typeof create__ROUTER_TYPE__Router;

/**
 * These are only relevant on the root "trpc."-object
 **/
type IgnoredTypes =
  | "Provider"
  | "createClient"
  | "useDehydratedState"
  | "useContext"
  | "useUtils";

/**
 * Alex could fix these inside tRPC if we want to use them.
 **/
type TODO_TYPES = "useQueries" | "useSuspenseQueries";

type __ROUTER_TYPE__Types = ReturnType<
  typeof createTRPCReact<__ROUTER_TYPE__Router>
>;

type __ROUTER_TYPE__Api = Omit<__ROUTER_TYPE__Types, IgnoredTypes | TODO_TYPES>;

// biome-ignore lint/suspicious/noExplicitAny: generated
export const __ROUTER_INSTANCE__Api = (appRouter as any)
  .__ROUTER_INSTANCE__ as __ROUTER_TYPE__Api;
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const create__ROUTER_TYPE__RouterCaller = createCallerFactory(
  create__ROUTER_TYPE__Router,
);

export type __ROUTER_TYPE__Inputs = inferRouterInputs<__ROUTER_TYPE__Router>;
export type __ROUTER_TYPE__Outputs = inferRouterOutputs<__ROUTER_TYPE__Router>;

export const use__ROUTER_TYPE__Utils = (): Omit<
  ReturnType<
    // @ts-expect-error - this is a template file
    __ROUTER_TYPE__Types["useUtils"]
  >,
  "client"
> => {
  return (appRouter as any).useUtils().__ROUTER_INSTANCE__;
};
