import type { TPublicProcedureContext } from "../../procedures";

interface GetSessionOptions {
  ctx: TPublicProcedureContext;
}

export const getSessionHandler = ({ ctx }: GetSessionOptions) => {
  return ctx.session;
};
