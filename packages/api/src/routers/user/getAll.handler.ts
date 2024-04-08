import type { TPublicProcedureContext } from "~/procedures";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const user = await ctx.db.query.users.findMany();

  return user;
};
