import type { TSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface SaveCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveCareTaskInputSchema;
}

/**Starts a new shift and ends the previous one */
export const saveCareTaskHandler = async ({
  ctx,
  input,
}: SaveCareTaskOptions) => {
  await ctx.db
    .update(schema.careTasks)
    .set({
      doneByUserId: input.doneByUserId,
      doneAt: input.doneAt,
      details: input.details,
    })
    .where(eq(schema.careTasks.id, input.id));
};
