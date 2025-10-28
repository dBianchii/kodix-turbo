import fs from "node:fs/promises";

export async function addImportStatement(
  filePath: string,
  { importPath, importName }: { importPath: string; importName: string },
) {
  let fileContent = await fs.readFile(filePath, "utf-8");

  const importStatement = `import { ${importName} } from "${importPath}";\n`;

  const importRegex = new RegExp(`import\\s+{([^}]*)} from\\s+"${importPath}"`);
  const match = fileContent.match(importRegex);
  if (match) {
    let importContent = match[1]?.trim();
    if (!importContent) return;

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
  } else {
    fileContent = importStatement + fileContent;
  }

  await fs.writeFile(filePath, fileContent, "utf-8");
}
