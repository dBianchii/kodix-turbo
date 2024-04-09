import type { runCli } from "../cli";
import { VALIDATORS_FOLDER_PATH } from "../cli";
import { toPascalCase } from "../utils/toPascalCase";
import { addExportStatement } from "./addExportStatement";
import { addImportStatement } from "./addImportStatement";

export const createValidator = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
  routerRelativePath: string,
) => {
  const filePath = `${VALIDATORS_FOLDER_PATH}/${routerRelativePath}/index.ts`;

  const pascaledCaseName = toPascalCase(userInput.name);

  await addImportStatement(filePath, {
    importName: "z",
    importPath: "zod",
  });

  await addExportStatement({
    filePath,
    exportStatement: `export const Z${pascaledCaseName}InputSchema = ${userInput.validator};`,
  });
  await addExportStatement({
    filePath,
    exportStatement: `export type T${pascaledCaseName}InputSchema = z.infer<typeof Z${pascaledCaseName}InputSchema>;`,
  });
};
