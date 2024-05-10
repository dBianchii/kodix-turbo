import dayjs from "dayjs";

import type { DrizzleWhere, SQL } from "@kdx/db";
import type { TGetNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { and, asc, count, desc, eq, gte, inArray, lte, or } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { filterColumn } from "../../lib/filter-column";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
  input: TGetNotificationsInputSchema;
}

export const getNotificationsHandler = async ({
  ctx,
  input,
}: GetAllOptions) => {
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
    "sentAt",
    "desc",
  ]) as [
    keyof typeof schema.notifications.$inferSelect | undefined,
    "asc" | "desc" | undefined,
  ];

  // Convert the date strings to Date objects
  const fromDay = input.from
    ? dayjs(input.from).startOf("day").toDate()
    : undefined;
  const toDay = input.to ? dayjs(input.to).endOf("day").toDate() : undefined;

  const allTeamIdsForUserQuery = ctx.db
    .select({ id: schema.usersToTeams.teamId })
    .from(schema.usersToTeams)
    .where(eq(schema.usersToTeams.userId, ctx.session.user.id));

  const expressions: (SQL<unknown> | undefined)[] = [
    eq(schema.notifications.sentToUserId, ctx.session.user.id), // Only show notifications for the logged in user
    eq(schema.notifications.teamId, input.teamId), // Only show notifications for selected team
    inArray(schema.notifications.teamId, allTeamIdsForUserQuery), // Ensure user is part of the team

    // Filter notifications by message
    input.subject
      ? filterColumn({
          column: schema.notifications.subject,
          value: input.subject,
        })
      : undefined,
    // Filter notifications by channel
    input.channel
      ? filterColumn({
          column: schema.notifications.channel,
          value: input.channel,
        })
      : undefined,
    // Filter notifications by time range
    fromDay && toDay
      ? and(
          gte(schema.notifications.sentAt, fromDay),
          lte(schema.notifications.sentAt, toDay),
        )
      : undefined,
  ];

  const where: DrizzleWhere<typeof schema.notifications.$inferSelect> =
    !input.operator || input.operator === "and"
      ? and(...expressions)
      : or(...expressions);

  const result = await ctx.db.transaction(async (tx) => {
    const data = await tx
      .select()
      .from(schema.notifications)
      .limit(input.perPage)
      .offset(offset)
      .where(where)
      .orderBy(
        column && column in schema.notifications
          ? order === "asc"
            ? asc(schema.notifications[column])
            : desc(schema.notifications[column])
          : desc(schema.notifications.id),
      );

    const total = await tx
      .select({
        count: count(),
      })
      .from(schema.notifications)
      .where(where)
      .execute()
      .then((res) => res[0]?.count ?? 0);

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  });

  return result;
};
