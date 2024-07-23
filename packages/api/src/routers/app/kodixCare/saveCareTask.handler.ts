import type { TSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

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
      doneByUserId: input.doneAt === null ? null : input.doneByUserId, //? if doneAt is null, doneByUserId should be null
      doneAt: input.doneByUserId === null ? null : input.doneAt,
      details: input.details,
    })
    .where(eq(schema.careTasks.id, input.id));
};
