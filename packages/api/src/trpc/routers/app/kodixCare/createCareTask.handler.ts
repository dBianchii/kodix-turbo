import { TRPCError } from "@trpc/server";

import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { careTasks } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  const currentCareShift = await getCurrentShiftHandler({ ctx });
  const t = await getTranslations({ locale: ctx.locale });
  if (!currentCareShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: t("api.No active shift"),
    });
  }

  const currentUserIsCaregiver =
    currentCareShift.Caregiver.id === ctx.session.user.id;
  if (!currentUserIsCaregiver) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You are not the caregiver for this shift"),
    });
  }

  await ctx.db.insert(careTasks).values({
    ...input,
    careShiftId: currentCareShift.id,
    teamId: ctx.session.user.activeTeamId,
    createdBy: ctx.session.user.id,
  });
};
