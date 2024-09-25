import { TRPCError } from "@trpc/server";

import type { TSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { eq } from "@kdx/db";
import { careTasks } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";

interface SaveCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveCareTaskInputSchema;
}

/**Starts a new shift and ends the previous one */
export const saveCareTaskHandler = async ({
  ctx,
  input,
}: SaveCareTaskOptions) => {
  const currentShift = await getCurrentShiftHandler({ ctx });

  const t = await getTranslations({ locale: ctx.locale });

  if (!currentShift || currentShift.checkOut)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot edit a task in a closed shift"),
    });

  if (currentShift.Caregiver.id !== ctx.session.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot edit a task from another caregivers shift"),
    });

  await ctx.db
    .update(careTasks)
    .set({
      doneByUserId: input.doneAt === null ? null : input.doneByUserId, //? if doneAt is null, doneByUserId should be null
      doneAt: input.doneByUserId === null ? null : input.doneAt,
      details: input.details,
    })
    .where(eq(careTasks.id, input.id));
};
