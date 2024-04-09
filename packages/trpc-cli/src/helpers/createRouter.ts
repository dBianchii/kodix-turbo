/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fs from "fs/promises";

import { logger } from "../utils/logger";
import { toPascalCase } from "../utils/toPascalCase";
import { addImportStatement } from "./addImportStatement";

export const createRouter = async ({
  routerFolderFilePath,
  chosenRouterPath,
  routerFilePath,
  endpointName,
  validator,
  procedure,
  queryOrMutation,
}: {
  routerFolderFilePath: string;
  chosenRouterPath: string;
  routerFilePath: string;
  endpointName: string;
  validator: string;
  procedure: string;
  queryOrMutation: string;
}) => {
  const ZEndpointNameInputSchema = `Z${toPascalCase(endpointName)}InputSchema`;
  if (validator)
    await addImportStatement(routerFilePath, {
      importPath: `@kdx/validators/trpc/${chosenRouterPath}`,
      importName: ZEndpointNameInputSchema,
    });

  const handlerName = `${endpointName}Handler`;

  await addImportStatement(routerFilePath, {
    importPath: `./${endpointName}.handler`,
    importName: handlerName,
  });

  await addImportStatement(routerFilePath, {
    importPath:
      chosenRouterPath
        .split("/")
        .map(() => "..")
        .join("/") + "/../procedures",
    importName: procedure,
  });

  try {
    let fileContent = await fs.readFile(routerFilePath, "utf-8");

    const routerName = routerFolderFilePath.split("/").at(-1);

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
    let newEntry = `  ${endpointName}: ${procedure}`;
    if (validator) newEntry += `.input(${ZEndpointNameInputSchema})`;

    newEntry += `.${queryOrMutation}(${handlerName}),\n`;

    const modifiedRouterContent = routerContent + newEntry;

    // Replace the old router object content with the modified one
    fileContent = fileContent.replace(match[1]!, modifiedRouterContent);
    await fs.writeFile(routerFilePath, fileContent);
  } catch (error) {
    logger.error("Error updating file");
    process.exit(1);
  }
};
