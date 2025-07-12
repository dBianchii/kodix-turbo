import { toPascalCase } from "../utils/toPascalCase";
import { addExportStatement } from "./addExportStatement";
import { addImportStatement } from "./addImportStatement";

export const createValidator = async ({
  validatorPath,
  validator,
  endpointName,
}: {
  validatorPath: string;
  validator: string;
  endpointName: string;
}) => {
  const pascaledCaseName = toPascalCase(endpointName);

  await addImportStatement(validatorPath, {
    importName: "z",
    importPath: "zod",
  });
  await addExportStatement({
    filePath: validatorPath,
    exportStatement: `export const Z${pascaledCaseName}InputSchema = ${validator};`,
  });
  await addExportStatement({
    filePath: validatorPath,
    exportStatement: `export type T${pascaledCaseName}InputSchema = z.infer<typeof Z${pascaledCaseName}InputSchema>;`,
  });
};
