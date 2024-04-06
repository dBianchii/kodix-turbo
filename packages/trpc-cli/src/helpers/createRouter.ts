import fs from "fs/promises";

import type { runCli } from "../cli";
import { logger } from "../utils/logger";
import { toPascalCase } from "../utils/toPascalCase";
import { addImportStatement } from "./addImportStatement";

export const createRouter = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
  routerRelativePath: string,
) => {
  const ZEndpointNameInputSchema = `Z${toPascalCase(userInput.name)}InputSchema`;
  if (userInput.validator)
    await addImportStatement(userInput.routerPath, {
      importPath: `@kdx/validators/trpc/${routerRelativePath}`,
      importName: ZEndpointNameInputSchema,
    });

  await addImportStatement(userInput.routerPath, {
    importPath: `./${userInput.name}.handler`,
    importName: `${userInput.name}Handler`,
  });

  await addImportStatement(userInput.routerPath, {
    importPath: "~/procedures",
    importName: userInput.procedure,
  });

  await addEndpointToRouter(userInput);

  async function addEndpointToRouter(
    userInput: Awaited<ReturnType<typeof runCli>>,
  ) {
    const { routerPath, procedure, validator, name, queryOrMutation } =
      userInput;

    const handlerName = `${name}Handler`;

    try {
      let fileContent = await fs.readFile(routerPath, "utf-8");

      const routerName = routerPath.split("/").at(-2);

      const routerRegex = new RegExp(
        `export\\s+const\\s+${routerName}Router\\s*=\\s*{([^}]*)}`,
        "s",
      );
      const match = fileContent.match(routerRegex);
      if (!match) {
        logger.error(`${routerName}Router object not found in file`);
        process.exit(1);
      }
      const routerContent = match[1];

      // Add new entry to the object content
      let newEntry = `  ${name}: ${procedure}`;
      if (validator) newEntry += `.input(${ZEndpointNameInputSchema})`;
      newEntry += `.${queryOrMutation}(${handlerName}),\n`;

      const modifiedRouterContent = routerContent + newEntry;

      // Replace the old router object content with the modified one
      fileContent = fileContent.replace(match[1]!, modifiedRouterContent);
    } catch (error) {
      logger.error("Error updating file");
      process.exit(1);
    }
  }
};
