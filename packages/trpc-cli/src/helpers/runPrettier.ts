import { readFile, writeFile } from "fs/promises";
import prettier from "prettier";

import options from "@kdx/prettier-config";

export const runPrettier = async (filePaths: string[]) => {
  const promises = filePaths.map(async (filePath) => {
    const fileContents = await readFile(filePath, "utf-8");
    const formattedContents = await prettier.format(fileContents, {
      ...options,
      tailwindConfig: undefined, //? It tries to import the tailwindConfig from another @kdx/tailwind-config, so we need to remove it from options
      parser: "typescript", //? It can't infer the parser from the file extension, so we need to specify it
    });

    await writeFile(filePath, formattedContents);
  });

  await Promise.all(promises);
};
