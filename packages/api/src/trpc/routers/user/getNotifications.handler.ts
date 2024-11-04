import type { DrizzleWhere, SQL } from "@kdx/db";
import type { TGetNotificationsInputSchema } from "@kdx/validators/trpc/user";
import dayjs from "@kdx/dayjs";
import { and, asc, count, desc, eq, gte, inArray, lte, or } from "@kdx/db";
import { notifications, teams, usersToTeams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { filterColumn } from "../../../utils/filter-column";

interface GetNotificationsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetNotificationsInputSchema;
}

export const getNotificationsHandler = async ({
  ctx,
  input,
}: GetNotificationsOptions) => {
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
    "sentAt",
    "desc",
  ]) as [
    keyof typeof notifications.$inferSelect | undefined,
    "asc" | "desc" | undefined,
  ];

  // Convert the date strings to Date objects
  const fromDay = input.from
    ? dayjs(input.from).startOf("day").toDate()
    : undefined;
  const toDay = input.to ? dayjs(input.to).endOf("day").toDate() : undefined;

  const allTeamIdsForUserQuery = ctx.db
    .select({ id: usersToTeams.teamId })
    .from(usersToTeams)
    .where(eq(usersToTeams.userId, ctx.auth.user.id));

  const filterExpressions: (SQL<unknown> | undefined)[] = [
    // Filter notifications by subject
    input.subject
      ? filterColumn({
          column: notifications.subject,
          value: input.subject,
        })
      : undefined,
    // Filter notifications by channel
    input.channel
      ? filterColumn({
          column: notifications.channel,
          value: input.channel,
          isSelectable: true,
        })
      : undefined,
    // Filter notifications by time range
    fromDay && toDay
      ? and(
          gte(notifications.sentAt, fromDay),
          lte(notifications.sentAt, toDay),
        )
      : undefined,
    // Filter notifications by teamId
    input.teamId
      ? filterColumn({
          column: notifications.teamId,
          value: input.teamId,
          isSelectable: true,
        })
      : undefined,
  ];

  const where: DrizzleWhere<typeof notifications.$inferSelect> = and(
    eq(notifications.sentToUserId, ctx.auth.user.id), //? Only show notifications for the logged in user
    inArray(notifications.teamId, allTeamIdsForUserQuery), //? Ensure user is part of the team

    !input.operator || input.operator === "and"
      ? and(...filterExpressions)
      : or(...filterExpressions),
  );

  const result = await ctx.db.transaction(async (tx) => {
    const data = await tx
      .select({
        id: notifications.id,
        channel: notifications.channel,
        subject: notifications.subject,
        message: notifications.message,
        sentAt: notifications.sentAt,
        teamName: teams.name,
        teamId: teams.id,
      })
      .from(notifications)
      .limit(input.perPage)
      .offset(offset)
      .where(where)
      .innerJoin(teams, eq(teams.id, notifications.teamId)) //So that we can get team info too
      .orderBy(
        column && column in notifications
          ? order === "asc"
            ? asc(notifications[column])
            : desc(notifications[column])
          : desc(notifications.id),
      );

    const total = await tx
      .select({
        count: count(),
      })
      .from(notifications)
      .where(where)
      .execute()
      .then((res) => res[0]?.count ?? 0);

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  });

  return result;
};
