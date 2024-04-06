import fs from "fs/promises";

import { logger } from "../utils/logger";

export async function addExportStatement({
  filePath,
  exportStatement,
}: {
  filePath: string;
  exportStatement: string;
}) {
  try {
    let fileContent = await fs.readFile(filePath, "utf-8");

    // Append the export statement to the end of the file content
    fileContent += `\n${exportStatement}`;

    await fs.writeFile(filePath, fileContent, "utf-8");
  } catch (error) {
    logger.error("Error updating file");
    process.exit(1);
  }
}
