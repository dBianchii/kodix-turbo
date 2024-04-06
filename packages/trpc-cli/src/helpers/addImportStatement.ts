import fs from "fs/promises";

import { logger } from "../utils/logger";

export async function addImportStatement(
  filePath: string,
  { importPath, importName }: { importPath: string; importName: string },
) {
  try {
    let fileContent = await fs.readFile(filePath, "utf-8");

    const importStatement = `import { ${importName} } from "${importPath}";\n`;

    const importRegex = new RegExp(
      `import\\s+{([^}]*)} from\\s+"${importPath}"`,
    );
    const match = fileContent.match(importRegex);
    if (!match) {
      fileContent = importStatement + fileContent;
    } else {
      let importContent = match[1]!.trim();
      if (!importContent.includes(importName)) {
        //remove trailing comma if it exists
        if (importContent.endsWith(","))
          importContent = importContent.slice(0, -1);

        const modifiedImportContent = `${importContent}, ${importName}`;
        fileContent = fileContent.replace(
          importRegex,
          `import { ${modifiedImportContent} } from "${importPath}"`,
        );
      }
    }

    await fs.writeFile(filePath, fileContent, "utf-8");
    logger.success("File updated successfully");
  } catch (error) {
    logger.error("Error updating file");
    process.exit(1);
  }
}
