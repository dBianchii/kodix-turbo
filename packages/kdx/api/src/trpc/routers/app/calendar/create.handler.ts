import { RRule } from "rrule";

import type { TCreateInputSchema } from "@kdx/validators/trpc/app/calendar";
import { db } from "@kdx/db/client";
import { calendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  await calendarRepository.createEventMaster(db, {
    createdBy: ctx.auth.user.id,
    dateStart: input.from,
    dateUntil: input.until,
    description: input.description,
    rule: new RRule({
      byweekday: input.weekdays,
      count: input.count,
      dtstart: input.from,
      freq: input.frequency,
      interval: input.interval,
      until: input.until,
    }).toString(),
    teamId: ctx.auth.user.activeTeamId,
    title: input.title,
    type: input.type,
  });
};
