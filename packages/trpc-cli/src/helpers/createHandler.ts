import fs from "node:fs";

import { toPascalCase } from "../utils/toPascalCase";

export const createHandler = async ({
  handlerPath,
  chosenRouterPath,
  endpointName,
  validator,
  procedure,
}: {
  handlerPath: string;
  chosenRouterPath: string;
  endpointName: string;
  validator: string;
  procedure: string;
}) => {
  const UpperCasedEndpointName = toPascalCase(endpointName);
  const TUpperCasedProcedureNameContext = `T${toPascalCase(procedure)}Context`;

  const TEndpointInputSchema = `T${UpperCasedEndpointName}InputSchema`;

  const contents = `${validator ? `import type { ${TEndpointInputSchema} } from "@kdx/validators/trpc/${chosenRouterPath}";` : ""}
import type { ${TUpperCasedProcedureNameContext} } from "${`${chosenRouterPath
    .split("/")
    .map(() => "..")
    .join("/")}/../procedures`}";

interface ${UpperCasedEndpointName}Options {
  ctx: ${TUpperCasedProcedureNameContext};
  ${validator ? `input: ${TEndpointInputSchema};` : ""}
}

export const ${endpointName}Handler = async ({ ctx${validator ? ", input" : ""} }: ${UpperCasedEndpointName}Options) => {
  //... your handler logic here <3
};`;

  await fs.promises.writeFile(handlerPath, contents);
};
