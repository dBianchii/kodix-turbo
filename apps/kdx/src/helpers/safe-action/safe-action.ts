import { TRPCError } from "@trpc/server";
import { createSafeActionClient } from "next-safe-action";
import { ZodError } from "zod";

//? This is from https://next-safe-action.dev/docs/getting-started
export const action = createSafeActionClient({
  // Can also be an async function.
  handleReturnedServerError(error) {
    let message = error.message;

    //? If the error came from within tRPC and not from the outer action, we can check if it's a ZodError and use the first issue's message.
    //? Note that if it's a generic trpc error and not a ZodError, we'll just use the original error message. (should work)
    if (error instanceof TRPCError)
      if (error.cause instanceof ZodError)
        message = error.cause.issues[0]?.message ?? message;

    return {
      serverError: message ?? "Something went wrong, please try again later.",
    };
  },
  handleServerErrorLog(error) {
    // We can, for example, also send the error to a dedicated logging system.
    // reportToErrorHandlingSystem(e);
    console.error(error);
  },
});
