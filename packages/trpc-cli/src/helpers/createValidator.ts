import type { runCli } from "../cli";
import { toPascalCase } from "../utils/toPascalCase";
import { addExportStatement } from "./addExportStatement";
import { addImportStatement } from "./addImportStatement";

export const createValidator = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
  validatorPath: string,
) => {
  const pascaledCaseName = toPascalCase(userInput.name);

  await addImportStatement(validatorPath, {
    importName: "z",
    importPath: "zod",
  });

  await addExportStatement({
    filePath: validatorPath,
    exportStatement: `export const Z${pascaledCaseName}InputSchema = ${userInput.validator};`,
  });
  await addExportStatement({
    filePath: validatorPath,
    exportStatement: `export type T${pascaledCaseName}InputSchema = z.infer<typeof Z${pascaledCaseName}InputSchema>;`,
  });
};
