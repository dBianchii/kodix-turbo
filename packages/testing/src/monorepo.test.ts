import fs from "fs";
import path from "path";
import { expect, test } from "vitest";

const repositoryRoot = path.join(__dirname, "../../../");

test("Monorepo .nvmrc version should match the version in the root package.json's engines.node", async () => {
  const nvmrcVersion = fs
    .readFileSync(path.join(repositoryRoot, ".nvmrc"), "utf-8")
    .trim();

  const rootPackageJson = (await import("../../../package.json")).default;

  expect(nvmrcVersion).toBe(rootPackageJson.engines.node);
});
