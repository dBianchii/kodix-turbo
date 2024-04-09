import { readFile, writeFile } from "fs/promises";
import prettier from "prettier";

import options from "@kdx/prettier-config";

export const runPrettier = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    const fileContents = await readFile(filePath, "utf-8"); // Read the file contents
    const formattedContents = await prettier.format(fileContents, {
      ...options,
      tailwindConfig: undefined, //? It doesn't let us run the format with the tailwind config
      parser: "typescript",
    });

    await writeFile(filePath, formattedContents);
  }
};
