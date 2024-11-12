import { RRule } from "rrule";

import type { TCreateInputSchema } from "@kdx/validators/trpc/app/calendar";
import { getCalendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const calendarRepository = getCalendarRepository(teamDb);
  await calendarRepository.createEventMaster({
    title: input.title,
    description: input.description,
    rule: new RRule({
      dtstart: input.from,
      until: input.until,
      freq: input.frequency,
      interval: input.interval,
      count: input.count,
      byweekday: input.weekdays,
    }).toString(),
    createdBy: ctx.auth.user.id,
    teamId: ctx.auth.user.activeTeamId,
    dateStart: input.from,
    dateUntil: input.until,
    type: input.type,
  });
};
