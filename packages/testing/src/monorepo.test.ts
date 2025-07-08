/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { existsSync, globSync, readFileSync } from "fs";
import path from "path";
import { expect, it, test } from "vitest";
import yaml from "yaml";

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
}

const repositoryRoot = path.join(__dirname, "../../../");

const getPNPMWorkspaceFile = (
  packageRoot: string,
): {
  catalog: Record<string, unknown>;
  catalogs: Record<string, Record<string, unknown>>;
  packages: string[];
} =>
  yaml.parse(
    readFileSync(path.join(packageRoot, "pnpm-workspace.yaml"), "utf-8"),
  );

const getFilesToCheck = () => {
  const packageNameMap: Record<string, string> = {};
  const filesToCheck: { packageJson: string; tsconfig: string }[] = [];

  getPNPMWorkspaceFile(repositoryRoot).packages.forEach((workspacePath) => {
    globSync(workspacePath, {
      cwd: repositoryRoot,
    })
      .filter((folder) => !folder.includes("node_modules"))
      .forEach((folder) => {
        const folderPath = path.join(repositoryRoot, folder);
        const packageJsonPath = path.join(folderPath, "package.json");
        const tsconfigPath = path.join(folderPath, "tsconfig.json");
        if (!existsSync(packageJsonPath) || !existsSync(tsconfigPath)) {
          return;
        }

        const packageName = require(packageJsonPath).name;
        expect(packageName.length).toBeGreaterThan(0);
        packageNameMap[packageName] = packageJsonPath;
        filesToCheck.push({
          packageJson: packageJsonPath,
          tsconfig: tsconfigPath,
        });
      });
  });

  return { filesToCheck, packageNameMap };
};

test("Monorepo .nvmrc version should match the version in the root package.json's engines.node", async () => {
  const nvmrcVersion = readFileSync(
    path.join(repositoryRoot, ".nvmrc"),
    "utf-8",
  ).trim();

  const rootPackageJson = (await import("../../../package.json")).default;

  expect(nvmrcVersion).toBe(rootPackageJson.engines.node);
});

it("There are no unused dependencies", () => {
  const { filesToCheck } = getFilesToCheck();

  // Track all dependencies found in package.json files
  const usedPackages = new Set<string>();

  filesToCheck
    // Add the root package.json
    .concat({
      packageJson: path.resolve(repositoryRoot, "package.json"),
      tsconfig: "",
    })
    .forEach((packagePaths) => {
      const packageJson: PackageJson = require(packagePaths.packageJson);

      Object.entries(packageJson.dependencies ?? {})
        .concat(Object.entries(packageJson.devDependencies ?? {}))
        .concat(Object.entries(packageJson.peerDependencies ?? {}))
        .forEach(([depName, version]) => {
          // Skip workspace dependencies
          if (!version.startsWith("workspace:")) {
            usedPackages.add(depName);
          }
        });
    });

  // Parse the PNPM workspace file
  const { catalog: defaultCatalog, catalogs } =
    getPNPMWorkspaceFile(repositoryRoot);

  // Collect all packages defined in catalogs
  const allCatalogPackages = new Set<string>();

  // Add default catalog packages
  Object.keys(defaultCatalog).forEach((packageName) => {
    allCatalogPackages.add(packageName);
  });

  // Add named catalog packages
  Object.values(catalogs).forEach((catalogPackages) => {
    Object.keys(catalogPackages).forEach((packageName) => {
      allCatalogPackages.add(packageName);
    });
  });

  // Find catalog packages that aren't used anywhere
  const unusedCatalogPackages = Array.from(allCatalogPackages).filter(
    (packageName) => !usedPackages.has(packageName),
  );

  //Expect sets to be equal
  expect(allCatalogPackages).toEqual(usedPackages);

  // Expect no unused packages
  expect(unusedCatalogPackages).toEqual([]);
});
