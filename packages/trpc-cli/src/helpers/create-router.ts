import { existsSync } from "node:fs";
import fs from "node:fs/promises";

import { trpcCliConfig } from "../../config";
import { logger } from "../utils/logger";
import { toPascalCase } from "../utils/to-pascal-case";
import { addImportStatement } from "./add-import-statement";

export const createRouter = async ({
  routerFolderFilePath,
  chosenRouterPath,
  routerFilePath,
  endpointName,
  validator,
  procedure,
  queryOrMutation,
  newRouterName,
}: {
  routerFolderFilePath: string;
  chosenRouterPath: string;
  routerFilePath: string;
  endpointName: string;
  validator: string;
  procedure: string;
  queryOrMutation: string;
  newRouterName?: string;
}) => {
  const handlerName = `${endpointName}Handler`;
  const ZEndpointNameInputSchema = `Z${toPascalCase(endpointName)}InputSchema`;

  let newEntry = `  ${endpointName}: ${procedure}`;
  if (validator) newEntry += `.input(${ZEndpointNameInputSchema})`;
  newEntry += `.${queryOrMutation}(${handlerName}),\n`;

  //check if file exists:
  if (!existsSync(routerFilePath)) {
    //User is trying to add a new router. Create a new file
    const contents = `import type { TRPCRouterRecord } from "@trpc/server";
export const ${newRouterName}Router = {
  ${newEntry}
} satisfies TRPCRouterRecord;`;

    const folderPath = routerFilePath.split("/").slice(0, -1).join("/");
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(routerFilePath, contents);
    await addNeededImportSatements();

    //attach the newly added file to exactly one level above the current router at _router.ts
    const routerFileToUpdate =
      routerFolderFilePath.split("/").slice(0, -1).join("/") +
      `/${trpcCliConfig.routerFileName}`;

    await addNewEntryToTrpcRouterRecord(
      routerFileToUpdate,
      `  ${chosenRouterPath.split("/").at(-1)}: ${newRouterName}Router,`,
      true
    );

    await addImportStatement(routerFileToUpdate, {
      importName: `${newRouterName}Router`,
      importPath: `./${newRouterName}/${trpcCliConfig.routerFileName.replace(
        ".ts",
        ""
      )}`,
    });

    return;
  }

  await addNeededImportSatements();
  await addNewEntryToTrpcRouterRecord(routerFilePath, newEntry);

  async function addNewEntryToTrpcRouterRecord(
    // biome-ignore lint/nursery/noShadow: <biome migration>
    routerFilePath: string,
    // biome-ignore lint/nursery/noShadow: <biome migration>
    newEntry: string,
    begginningOfRecord = false
  ) {
    try {
      let fileContent = await fs.readFile(routerFilePath, "utf-8");

      const routerName = routerFilePath.split("/").at(-2);

      const routerRegex = new RegExp(
        `export\\s+const\\s+${routerName}Router\\s*=\\s*{([^}]*)}`,
        "s"
      );
      const match = fileContent.match(routerRegex);
      if (!match) {
        logger.error(`${routerName}Router object not found in file`);
        process.exit(1);
      }
      const routerContent = match[1];
      if (!routerContent) throw new Error("Router content not found");

      const modifiedRouterContent = begginningOfRecord
        ? newEntry + routerContent
        : routerContent + newEntry;

      // Replace the old router object content with the modified one
      fileContent = fileContent.replace(routerContent, modifiedRouterContent);
      await fs.writeFile(routerFilePath, fileContent);
    } catch {
      logger.error("Error updating file");
      process.exit(1);
    }
  }

  async function addNeededImportSatements() {
    if (validator)
      await addImportStatement(routerFilePath, {
        importName: ZEndpointNameInputSchema,
        importPath: `@kdx/validators/trpc/${chosenRouterPath}`,
      });

    await addImportStatement(routerFilePath, {
      importName: handlerName,
      importPath: `./${endpointName}.handler`,
    });

    await addImportStatement(routerFilePath, {
      importName: procedure,
      importPath: `${chosenRouterPath
        .split("/")
        .map(() => "..")
        .join("/")}/../procedures`,
    });
  }
};
