import { RRule } from "rrule";

import type { TCreateInputSchema } from "@kdx/validators/trpc/app/calendar";
import { eventMasters } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  await ctx.db.insert(eventMasters).values({
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
