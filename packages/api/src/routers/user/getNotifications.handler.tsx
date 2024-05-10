import dayjs from "dayjs";

import type { DrizzleWhere, SQL } from "@kdx/db";
import type { TGetNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { and, asc, count, desc, eq, gte, inArray, lte, or } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { filterColumn } from "../../lib/filter-column";

interface GetNotificationsOptions {
  ctx: TProtectedProcedureContext;
  input: TGetNotificationsInputSchema;
}

export const getNotificationsHandler = async ({
  ctx,
  input,
}: GetNotificationsOptions) => {
  // await sendNotifications({
  //   teamId: ctx.session.user.activeTeamId,
  //   userId: ctx.session.user.id,
  //   channels: [
  //     {
  //       subject: Math.random().toString(),
  //       to: "gdbianchii@gmail.com",
  //       type: "EMAIL",
  //       react: <>{Math.random().toString()}</>,
  //     },
  //   ],
  // });

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

  const filterExpressions: (SQL<unknown> | undefined)[] = [
    // Filter notifications by subject
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
          isSelectable: true,
        })
      : undefined,
    // Filter notifications by time range
    fromDay && toDay
      ? and(
          gte(schema.notifications.sentAt, fromDay),
          lte(schema.notifications.sentAt, toDay),
        )
      : undefined,
    // Filter notifications by teamId
    input.teamId
      ? filterColumn({
          column: schema.notifications.teamId,
          value: input.teamId,
          isSelectable: true,
        })
      : undefined,
  ];

  const where: DrizzleWhere<typeof schema.notifications.$inferSelect> = and(
    eq(schema.notifications.sentToUserId, ctx.session.user.id), //? Only show notifications for the logged in user
    inArray(schema.notifications.teamId, allTeamIdsForUserQuery), //? Ensure user is part of the team

    !input.operator || input.operator === "and"
      ? and(...filterExpressions)
      : or(...filterExpressions),
  );

  const result = await ctx.db.transaction(async (tx) => {
    const data = await tx
      .select({
        id: schema.notifications.id,
        channel: schema.notifications.channel,
        subject: schema.notifications.subject,
        message: schema.notifications.message,
        sentAt: schema.notifications.sentAt,
        teamName: schema.teams.name,
        teamId: schema.teams.id,
      })
      .from(schema.notifications)
      .limit(input.perPage)
      .offset(offset)
      .where(where)
      .innerJoin(schema.teams, eq(schema.teams.id, schema.notifications.teamId)) //So that we can get team info too
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
