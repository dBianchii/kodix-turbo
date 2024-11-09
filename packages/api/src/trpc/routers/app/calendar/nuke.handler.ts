/* eslint-disable no-empty-pattern */
import { TRPCError } from "@trpc/server";

import type { TProtectedProcedureContext } from "../../../procedures";

interface NukeOptions {
  ctx: TProtectedProcedureContext;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const nukeHandler = async ({}: NukeOptions) => {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "This is disabled for now",
  });
};
