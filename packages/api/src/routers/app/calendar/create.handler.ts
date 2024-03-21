import { RRule } from "rrule";

import type { TCreateInput } from "@kdx/validators/trpc/app/calendar";
import { schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInput;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  // return await ctx.prisma.eventMaster.create({
  //   data: {
  //     title: input.title,
  //     description: input.description,
  //     rule: new RRule({
  //       dtstart: input.from,
  //       until: input.until,
  //       freq: input.frequency,
  //       interval: input.interval,
  //       count: input.count,
  //       byweekday: input.weekdays,
  //     }).toString(),
  //     teamId: ctx.session.user.activeTeamId,
  //     DateStart: input.from,
  //     DateUntil: input.until,
  //   },
  // });
  return await ctx.db.insert(schema.eventMasters).values({
    id: crypto.randomUUID(),
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
