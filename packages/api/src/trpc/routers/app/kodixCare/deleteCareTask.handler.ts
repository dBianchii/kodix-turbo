import { TRPCError } from "@trpc/server";

import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { and, eq } from "@kdx/db";
import { careTasks, teamAppRolesToUsers } from "@kdx/db/schema";
import { getTranslations } from "@kdx/locales/next-intl/server";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";

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
  if (careTask.CareShift.shiftEndedAt) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.You cannot delete a task from a closed shift"),
    });
  }

  const roles = await ctx.db.query.teamAppRoles.findMany({
    where: (teamAppRoles, { eq, and }) =>
      and(
        eq(teamAppRolesToUsers.userId, ctx.session.user.id),
        eq(teamAppRoles.teamId, ctx.session.user.activeTeamId),
        eq(teamAppRoles.appId, kodixCareAppId),
      ),
    with: {
      TeamAppRolesToUsers: {
        columns: {
          userId: true,
        },
      },
    },
    columns: {
      appRoleDefaultId: true,
    },
  });

  if (
    careTask.createdBy !== ctx.session.user.id &&
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
        eq(careTasks.teamId, ctx.session.user.activeTeamId),
        eq(careTasks.id, input.id),
      ),
    );
};