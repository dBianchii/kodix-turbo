import { RRule } from "rrule";

import type { TCreateInputSchema } from "@kdx/validators/trpc/app/calendar";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  await ctx.db.insert(schema.eventMasters).values({
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
    teamId: ctx.session.user.activeTeamId,
    dateStart: input.from,
    dateUntil: input.until,
  });
};
