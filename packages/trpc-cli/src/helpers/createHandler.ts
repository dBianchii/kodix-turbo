import fs from "fs";

import type { runCli } from "../cli";
import { toPascalCase } from "../utils/toPascalCase";

export const createHandler = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
  routerRelativePath: string,
  handlerPath: string,
) => {
  const UpperCasedEndpointName = toPascalCase(userInput.endpointName);
  const TUpperCasedProcedureNameContext = `T${toPascalCase(userInput.procedure)}Context`;

  const TEndpointInputSchema = `T${UpperCasedEndpointName}InputSchema`;

  const contents = `${userInput.validator ? `import type { ${TEndpointInputSchema} } from "@kdx/validators/trpc/${routerRelativePath}";` : ""}
import type { ${TUpperCasedProcedureNameContext} } from "${
    routerRelativePath
      .split("/")
      .map(() => "..")
      .join("/") + "/../procedures"
  }";

interface ${UpperCasedEndpointName}Options {
  ctx: ${TUpperCasedProcedureNameContext};
  ${userInput.validator ? `input: ${TEndpointInputSchema};` : ""}
}

export const ${userInput.endpointName}Handler = async ({ ctx${userInput.validator ? ", input" : ""} }: ${UpperCasedEndpointName}Options) => {
  //... your handler logic here <3
};`;

  await fs.promises.writeFile(handlerPath, contents);
};
