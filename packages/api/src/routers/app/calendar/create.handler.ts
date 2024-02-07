import { RRule } from "rrule";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TCreateInput } from "@kdx/validators/trpc/app/calendar";

interface CreateOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TCreateInput;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  return await ctx.prisma.eventMaster.create({
    data: {
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
      DateStart: input.from,
      DateUntil: input.until,
    },
  });
};
