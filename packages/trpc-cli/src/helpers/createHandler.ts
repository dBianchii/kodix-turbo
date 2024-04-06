import fs from "fs";

import type { runCli } from "../cli";
import { toPascalCase } from "../utils/toPascalCase";

export const createHandler = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
  routerRelativePath: string,
) => {
  const UpperCasedEndpointName = toPascalCase(userInput.name);
  const TUpperCasedProcedureNameContext = `T${toPascalCase(userInput.procedure)}Context`;

  const TEndpointInputSchema = `T${UpperCasedEndpointName}InputSchema`;

  //1. Criar o handler em um arquivo chamado `${userInput.name}.handler.ts`
  const contents = `
${userInput.validator ? `import type { ${TEndpointInputSchema} } from "@kdx/validators/trpc/${routerRelativePath}";` : ""}
import type { ${TUpperCasedProcedureNameContext} } from "~/procedures";

interface ${UpperCasedEndpointName}Options {
  ctx: ${TUpperCasedProcedureNameContext};
  ${userInput.validator ? `input: ${TEndpointInputSchema};` : ""}
}

export const ${userInput.name}Handler = async ({ ctx${userInput.validator ? ", input" : ""} }: ${UpperCasedEndpointName}Options) => {

  //... your handler logic here <3

};`;

  await fs.promises.writeFile(
    `${userInput.routerPath.replace("_router.ts", "")}${userInput.name}.handler.ts`,
    contents,
  );
};
