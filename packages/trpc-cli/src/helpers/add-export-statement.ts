import fs from "node:fs/promises";

export async function addExportStatement({
  filePath,
  exportStatement,
}: {
  filePath: string;
  exportStatement: string;
}) {
  let fileContent = await fs.readFile(filePath, "utf-8");

  // Append the export statement to the end of the file content
  fileContent += `\n${exportStatement}`;

  await fs.writeFile(filePath, fileContent, "utf-8");
}
