import { exec } from "node:child_process";

export const runBiome = async (filePaths: string[]) => {
  //run biome check --write on each file
  await Promise.all(
    filePaths.map((filePath) => exec(`biome check --write ${filePath}`, {}))
  );
};
