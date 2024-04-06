import fs from "fs";

import type { runCli } from "../cli";

export const createHandler = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  const routerRelativePath = userInput.routerPath
    .split("routers/")[1]!
    .replace("/_router.ts", "");

  const UpperCasedEndpointName =
    userInput.name.charAt(0).toUpperCase() + userInput.name.slice(1);
  const TUpperCasedProcedureNameContext = `T${userInput.procedure.charAt(0).toUpperCase() + userInput.procedure.slice(1)}Context`;

  const TEndpointInputSchema = `T${UpperCasedEndpointName}InputSchema`;

  //1. Criar o handler em um arquivo chamado `${userInput.name}.handler.ts`
  const contents = `
import type { ${TEndpointInputSchema} } from "@kdx/validators/trpc/${routerRelativePath}";
import type { ${TUpperCasedProcedureNameContext} } from "~/procedures";

interface ${UpperCasedEndpointName}Options {
  ctx: ${TUpperCasedProcedureNameContext};
  ${userInput.validator ? "input: ${TEndpointInputSchema};" : ""}
}

export const installAppHandler = async ({ ctx${userInput.validator ? ", input" : ""} }: ${UpperCasedEndpointName}Options) => {

  //... your handler logic here <3

};`;

  await fs.promises.writeFile(
    `${userInput.routerPath.replace("_router.ts", "")}${userInput.name}.handler.ts`,
    contents,
  );
};
