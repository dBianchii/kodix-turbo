import { TRPCError } from "@trpc/server";
import { createSafeActionClient } from "next-safe-action";
import { ZodError } from "zod";

import { auth } from "@kdx/auth";

export const action = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError: (error) => {
    let message = error.message;

    //? If the error came from within tRPC and not from the outer action, we can check if it's a ZodError and use the first issue's message.
    //? Note that if it's a generic trpc error and not a ZodError, we'll just use the original error message. (should work)
    if (error instanceof TRPCError)
      if (error.cause instanceof ZodError)
        message = error.cause.issues[0]?.message ?? message;

    return message;
  },
});

export const protectedAction = action.use(async ({ next }) => {
  const authResponse = await auth();
  if (!authResponse.session) throw new Error("Not authenticated");
  return next({ ctx: { auth: authResponse } });
});
