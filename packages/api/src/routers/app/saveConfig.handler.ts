import type { TPublicProcedureContext } from "../../procedures";

interface SaveConfigOptions {
  ctx: TPublicProcedureContext;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const saveConfigHandler = async (props: SaveConfigOptions) => {
  // const asd = ctx.t("api.Calendar")
  await new Promise((resolve) => setTimeout(resolve, 200));

  // return asd;
};
