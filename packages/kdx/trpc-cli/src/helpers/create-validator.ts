import { toPascalCase } from "../utils/to-pascal-case";
import { addExportStatement } from "./add-export-statement";
import { addImportStatement } from "./add-import-statement";

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
    exportStatement: `export const Z${pascaledCaseName}InputSchema = ${validator};`,
    filePath: validatorPath,
  });
  await addExportStatement({
    exportStatement: `export type T${pascaledCaseName}InputSchema = z.infer<typeof Z${pascaledCaseName}InputSchema>;`,
    filePath: validatorPath,
  });
};
