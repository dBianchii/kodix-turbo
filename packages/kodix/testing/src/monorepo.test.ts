import { existsSync, globSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, test } from "vitest";

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  workspaces?:
    | string[]
    | {
        packages?: string[];
        catalog?: Record<string, unknown>;
        catalogs?: Record<string, Record<string, unknown>>;
      };
}

const repositoryRoot = path.join(__dirname, "../../../../");

const readJson = <T>(filePath: string): T =>
  JSON.parse(readFileSync(filePath, "utf-8")) as T;

const getRootPackageJson = (): PackageJson =>
  readJson<PackageJson>(path.join(repositoryRoot, "package.json"));

const getFilesToCheck = () => {
  const packageNameMap: Record<string, string> = {};
  const filesToCheck: { packageJson: string; tsconfig: string }[] = [];

  const rootPkg = getRootPackageJson();
  const workspaces = Array.isArray(rootPkg.workspaces)
    ? rootPkg.workspaces
    : (rootPkg.workspaces?.packages ?? []);

  for (const workspacePath of workspaces) {
    const folders = globSync(workspacePath, {
      cwd: repositoryRoot,
    }).filter((folder) => !folder.includes("node_modules"));

    for (const folder of folders) {
      const folderPath = path.join(repositoryRoot, folder);
      const packageJsonPath = path.join(folderPath, "package.json");
      const tsconfigPath = path.join(folderPath, "tsconfig.json");
      if (!(existsSync(packageJsonPath) && existsSync(tsconfigPath))) {
        continue;
      }

      const packageName = readJson<PackageJson>(packageJsonPath).name;
      if (!packageName || packageName.length === 0) {
        throw new Error(`Package at ${packageJsonPath} has no name`);
      }
      packageNameMap[packageName] = packageJsonPath;
      filesToCheck.push({
        packageJson: packageJsonPath,
        tsconfig: tsconfigPath,
      });
    }
  }

  return { filesToCheck, packageNameMap };
};

test("Monorepo .nvmrc version should match the version in the root package.json's engines.node", async () => {
  const nvmrcVersion = readFileSync(
    path.join(repositoryRoot, ".nvmrc"),
    "utf-8",
  ).trim();

  const rootPackageJson = (await import("../../../../package.json")).default;

  expect(nvmrcVersion).toBe(rootPackageJson.engines.node);
});

it("There are no unused dependencies", () => {
  const { filesToCheck } = getFilesToCheck();

  // Track all dependencies found in package.json files
  const usedPackages = new Set<string>();

  const allPackagePaths = filesToCheck
    // Add the root package.json
    .concat({
      packageJson: path.resolve(repositoryRoot, "package.json"),
      tsconfig: "",
    });

  for (const packagePaths of allPackagePaths) {
    const packageJson = readJson<PackageJson>(packagePaths.packageJson);

    const allDependencies = Object.entries(packageJson.dependencies ?? {})
      .concat(Object.entries(packageJson.devDependencies ?? {}))
      .concat(Object.entries(packageJson.peerDependencies ?? {}));

    for (const [depName, version] of allDependencies) {
      // Skip workspace dependencies
      if (!version.startsWith("workspace:")) {
        usedPackages.add(depName);
      }
    }
  }

  // Parse the root package.json for catalogs
  const rootPkg = getRootPackageJson();
  const workspacesConfig =
    typeof rootPkg.workspaces === "object" && !Array.isArray(rootPkg.workspaces)
      ? rootPkg.workspaces
      : { catalog: {}, catalogs: {} };
  const { catalog: defaultCatalog = {}, catalogs = {} } = workspacesConfig;

  // Collect all packages defined in catalogs
  const allCatalogPackages = new Set<string>();

  // Add default catalog packages
  for (const packageName of Object.keys(defaultCatalog)) {
    allCatalogPackages.add(packageName);
  }

  // Add named catalog packages
  for (const catalogPackages of Object.values(catalogs)) {
    for (const packageName of Object.keys(catalogPackages)) {
      allCatalogPackages.add(packageName);
    }
  }

  // Find catalog packages that aren't used anywhere
  const unusedCatalogPackages = Array.from(allCatalogPackages).filter(
    (packageName) => !usedPackages.has(packageName),
  );

  //Expect sets to be equal
  expect(allCatalogPackages).toEqual(usedPackages);

  // Expect no unused packages
  expect(unusedCatalogPackages).toEqual([]);
});

const externalPackagesToExcludeRegexes = [
  /^@types\//,
  /^@t3-oss\//,
  /^vite$/,
  /^react$/,
  /^react-dom$/,
  /^next$/,
  /^typescript$/,
  /^postcss$/,
  /^tailwindcss$/,
  /^autoprefixer$/,
  /^prettier$/,
  /^eslint$/,
  /^vitest$/,
  /^drizzle-kit$/,
  /^graphql$/,
  /^@graphql-codegen\//,
  /^expo$/,
  /^@expo\//,
  /^react-native$/,
  /^postgres$/,
  /^mysql2$/,
  /^@vitejs\//,
  /^@babel\//,
  /^babel-/,
  /^tsx$/,
  /^dotenv-cli$/,
  /^react-email$/,
  /^@react-email\//,
  /^@tailwindcss\//,
  /^@tamagui\//,
  /^expo-/,
  /^react-native-/,
  /^metro$/,
  /^server-only$/,
  /^jiti$/,
  /^@trpc\//,
  /^@node-rs\//,
];

const devDepUnusedExceptions: Record<string, Record<string, string>> = {};

const sourceFileGlobs = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
  "**/*.mjs",
  "**/*.cjs",
  "**/*.css",
];

const sourceFileExcludeDirs = [
  "node_modules",
  "dist",
  ".next",
  ".expo",
  "coverage",
];

const configFiles = [
  "tsconfig.json",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "vite.config.ts",
  "vitest.config.ts",
  "tailwind.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
  "postcss.config.mjs",
  "postcss.config.cjs",
  "drizzle.config.ts",
  "babel.config.js",
  "metro.config.js",
  "app.config.ts",
  "expo-env.d.ts",
];

const extractImports = (content: string): Set<string> => {
  const imports = new Set<string>();
  const patterns = [
    // import ... from 'pkg' / import ... from "pkg"
    /(?:import|export)\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g,
    // import 'pkg' / import "pkg"
    /import\s+['"]([^'"]+)['"]/g,
    // require('pkg') / require("pkg")
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // import('pkg')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // @import '...' (CSS)
    /@import\s+['"]([^'"]+)['"]/g,
    // vi.importActual('pkg')
    /vi\.importActual\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (
      let match = pattern.exec(content);
      match !== null;
      match = pattern.exec(content)
    ) {
      const importPath = match[1];
      if (!importPath) continue;
      // Skip relative imports and ~ imports
      if (importPath.startsWith(".") || importPath.startsWith("~")) continue;

      // Normalize to package name
      let packageName: string;
      if (importPath.startsWith("@")) {
        // @scope/pkg/sub -> @scope/pkg
        const parts = importPath.split("/");
        if (!parts[1]) continue;
        packageName = `${parts[0]}/${parts[1]}`;
      } else {
        // lodash/get -> lodash
        const firstSegment = importPath.split("/")[0];
        if (!firstSegment) continue;
        packageName = firstSegment;
      }
      imports.add(packageName);
    }
  }

  return imports;
};

const packagesToExclude = [
  "db-dev", // Docker-only packages
];

const findSourceFiles = (packageDir: string): string[] => {
  const sourceFiles = globSync(sourceFileGlobs, {
    cwd: packageDir,
    exclude: (p) =>
      sourceFileExcludeDirs.some((d) => p === d) || p.endsWith(".d.ts"),
  }).map((f) => path.join(packageDir, f));

  // Add config files
  for (const configFile of configFiles) {
    const configPath = path.join(packageDir, configFile);
    if (existsSync(configPath)) {
      sourceFiles.push(configPath);
    }
  }

  // Add package.json (catches deps referenced in scripts)
  const packageJsonPath = path.join(packageDir, "package.json");
  if (existsSync(packageJsonPath)) {
    sourceFiles.push(packageJsonPath);
  }

  return sourceFiles;
};

describe("Check for unused dependencies", () => {
  const { filesToCheck } = getFilesToCheck();

  const testCases = filesToCheck
    .filter(
      ({ packageJson: p }) => !packagesToExclude.some((exc) => p.includes(exc)),
    )
    .map(({ packageJson: packageJsonPath }) => {
      const packageJson: PackageJson = readJson<PackageJson>(packageJsonPath);
      return {
        packageDir: path.dirname(packageJsonPath),
        packageJsonPath,
        packageName: packageJson.name,
      };
    });

  it.for(testCases)("$packageName should not have unused dependencies", ({
    packageJsonPath,
    packageDir,
    packageName,
  }) => {
    const packageJson: PackageJson = readJson<PackageJson>(packageJsonPath);

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Filter out workspace deps and excluded patterns
    const depsToCheck = Object.entries(allDeps).filter(([name, version]) => {
      if (version.startsWith("workspace:")) return false;
      if (externalPackagesToExcludeRegexes.some((r) => r.test(name)))
        return false;
      return true;
    });

    if (depsToCheck.length === 0) return;

    // Find and scan all source files
    const sourceFiles = findSourceFiles(packageDir);
    const allImports = new Set<string>();
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      for (const imp of extractImports(content)) {
        allImports.add(imp);
      }
    }

    // Filter out allowed unused devDep exceptions
    const exceptions = devDepUnusedExceptions[packageName] ?? {};
    const unusedDeps = depsToCheck
      .map(([name]) => name)
      .filter((dep) => !allImports.has(dep))
      .filter((dep) => {
        const isDevDep = dep in (packageJson.devDependencies ?? {});
        const hasException =
          typeof exceptions[dep] === "string" &&
          exceptions[dep].trim().length > 0;
        return !(isDevDep && hasException);
      });

    expect(unusedDeps).toEqual([]);
  });
});
