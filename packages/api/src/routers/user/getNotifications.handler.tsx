import type { SQL } from "@kdx/db";
import type { TGetNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { and, asc, count, desc, eq, gte, inArray, lte, or } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";
import { filterColumn } from "../../lib/filter-column";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
  input: TGetNotificationsInputSchema;
}

//TODO: move this type elsewhere?
type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

export const getNotificationsHandler = async ({
  ctx,
  input,
}: GetAllOptions) => {
  // await sendNotifications({
  //   userId: ctx.session.user.id,
  //   teamId: input.teamId,
  //   channels: [
  //     {
  //       type: "email",
  //       react: <div>Notification</div>,
  //       subject: "Notification",
  //       to: "gdbianchii@gmail.com",
  //     },
  //   ],
  // });

  // const cached = await getUpstashCache("notifications", {
  //   userId: ctx.session.user.id,
  // });
  // if (cached) return cached;
  const offset = (input.page - 1) * input.perPage;

  const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
    "sentAt",
    "desc",
  ]) as [
    keyof typeof schema.notifications.$inferSelect | undefined,
    "asc" | "desc" | undefined,
  ];

  const allTeamIdsForUserQuery = ctx.db
    .select({ id: schema.usersToTeams.teamId })
    .from(schema.usersToTeams)
    .where(eq(schema.usersToTeams.userId, ctx.session.user.id));

  console.log(input);
  const where: DrizzleWhere<typeof schema.notifications.$inferSelect> =
    !input.operator || input.operator === "and"
      ? and(
          eq(schema.notifications.sentToUserId, ctx.session.user.id),
          eq(schema.notifications.teamId, input.teamId),
          inArray(schema.notifications.teamId, allTeamIdsForUserQuery),

          // Filter tasks by message
          input.message
            ? filterColumn({
                column: schema.notifications.message,
                value: input.message,
              })
            : undefined,
          input.channel
            ? filterColumn({
                column: schema.notifications.channel,
                value: input.channel,
              })
            : undefined,
          // Filter tasks by status
          input.from && input.to
            ? and(
                gte(schema.notifications.sentAt, input.from),
                lte(schema.notifications.sentAt, input.to),
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
          // Filter by createdAt
          input.from && input.to
            ? and(
                gte(schema.notifications.sentAt, input.from),
                lte(schema.notifications.sentAt, input.to),
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
