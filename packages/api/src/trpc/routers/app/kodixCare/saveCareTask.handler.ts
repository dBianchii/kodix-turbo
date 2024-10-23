import { TRPCError } from "@trpc/server";

import type { TSaveCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { eq } from "@kdx/db";
import { careTasks } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";

interface SaveCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveCareTaskInputSchema;
}

export const saveCareTaskHandler = async ({
  ctx,
  input,
}: SaveCareTaskOptions) => {
  const currentShift = await getCurrentShiftHandler({ ctx });
  const t = await getTranslations({ locale: ctx.locale });
  if (!currentShift)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No current shift found",
    });

  if (currentShift.Caregiver.id !== ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot edit a task from another caregivers shift"),
    });

  if (!currentShift.shiftEndedAt) {
    const task = await ctx.db.query.careTasks.findFirst({
      where: (careTasks, { eq }) => eq(careTasks.id, input.id),
    });
    if (!task)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: t("api.Care task not found"),
      });

    if (dayjs(task.date).isBefore(dayjs(currentShift.checkIn)))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: t("api.You cannot edit a task for a past shift"),
      });
  }

  if (dayjs(input.doneAt).isBefore(currentShift.checkIn))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot mark a task as done before the shift started"),
    });

  if (currentShift.checkOut)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot edit a task in a closed shift"),
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
