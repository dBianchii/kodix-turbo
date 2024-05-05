import dayjs from "dayjs";

import type { DrizzleWhere } from "@kdx/db";
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

  console.log(input);
  const allTeamIdsForUserQuery = ctx.db
    .select({ id: schema.usersToTeams.teamId })
    .from(schema.usersToTeams)
    .where(eq(schema.usersToTeams.userId, ctx.session.user.id));

  const where: DrizzleWhere<typeof schema.notifications.$inferSelect> =
    !input.operator || input.operator === "and"
      ? and(
          eq(schema.notifications.sentToUserId, ctx.session.user.id), // Only show notifications for the logged in user
          eq(schema.notifications.teamId, input.teamId), // Only show notifications for selected team
          inArray(schema.notifications.teamId, allTeamIdsForUserQuery), // Ensure user is part of the team

          // Filter tasks by message
          input.message
            ? filterColumn({
                column: schema.notifications.message,
                value: input.message,
              })
            : undefined,
          // Filter tasks by channel
          input.channel
            ? filterColumn({
                column: schema.notifications.channel,
                value: input.channel,
              })
            : undefined,
          // Filter tasks by time range
          fromDay && toDay
            ? and(
                gte(schema.notifications.sentAt, fromDay),
                lte(schema.notifications.sentAt, toDay),
              )
            : undefined,
        )
      : or(
          // Filter tasks by message
          input.message
            ? filterColumn({
                column: schema.notifications.message,
                value: input.message,
              })
            : undefined,

          // Filter tasks by channel
          input.channel
            ? filterColumn({
                column: schema.notifications.channel,
                value: input.channel,
              })
            : undefined,
          // Filter by sentAt
          fromDay && toDay
            ? and(
                gte(schema.notifications.sentAt, fromDay),
                lte(schema.notifications.sentAt, toDay),
              )
            : undefined,
        );

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
