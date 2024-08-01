

import type { TPublicProcedureContext } from "../../procedures";

interface SaveConfigOptions {
  ctx: TPublicProcedureContext;
}

export const saveConfigHandler = async ({ ctx }: SaveConfigOptions) => {
  const asd = ctx.t("api.Calendar")
  await new Promise((resolve) => setTimeout(resolve, 200));

  return asd;
};
