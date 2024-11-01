import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { and, eq } from "@kdx/db";
import { careTasks, teamAppRoles, teamAppRolesToUsers } from "@kdx/db/schema";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface DeleteCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareTaskInputSchema;
}

export const deleteCareTaskHandler = async ({
  ctx,
  input,
}: DeleteCareTaskOptions) => {
  // Criador da Tarefa: O usuário que criou a tarefa pode excluí-la, desde que a tarefa não faça parte de um turno fechado e concluído, (hoje em dia já é impossível alterar uma tarefa de turno concluído 👍 )
  // Administradores: Podem excluir qualquer tarefa, seja criada por eles ou por outro usuário, desde que a tarefa não faça parte de um turno fechado e concluído.
  const careTask = await ctx.db.query.careTasks.findFirst({
    where: (careTasks, { eq }) => eq(careTasks.id, input.id),
    columns: {
      createdBy: true,
    },
    with: {
      CareShift: {
        columns: {
          shiftEndedAt: true,
        },
      },
    },
  });

  const t = await getTranslations({ locale: ctx.locale });

  if (!careTask) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: t("api.Care task not found"),
    });
  }
  if (careTask.CareShift?.shiftEndedAt) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot delete a task from a closed shift"),
    });
  }

  const roles = await ctx.db
    .select({
      appRoleDefaultId: teamAppRoles.appRoleDefaultId,
    })
    .from(teamAppRoles)
    .where(
      and(
        eq(teamAppRolesToUsers.userId, ctx.auth.user.id),
        eq(teamAppRoles.teamId, ctx.auth.user.activeTeamId),
        eq(teamAppRoles.appId, kodixCareAppId),
      ),
    )
    .innerJoin(
      teamAppRolesToUsers,
      eq(teamAppRolesToUsers.teamAppRoleId, teamAppRoles.id),
    );

  if (
    careTask.createdBy !== ctx.auth.user.id &&
    !roles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
  )
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.Only admins and the creator can delete a task"),
    });

  await ctx.db
    .delete(careTasks)
    .where(
      and(
        eq(careTasks.teamId, ctx.auth.user.activeTeamId),
        eq(careTasks.id, input.id),
      ),
    );
};
