import type { TDeleteCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { eq } from "@kdx/db";
import { careTasks } from "@kdx/db/schema";

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

  await ctx.db.delete(careTasks).where(eq(careTasks.id, input.id));
};
