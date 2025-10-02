import type { PlopTypes } from "@turbo/gen";
import { execSync } from "node:child_process";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("init", {
    description: "Generate a new package for the Kodix Turbo Monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the package? (You can skip the `@kdx/` prefix)",
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      (answers) => {
        if (
          "name" in answers &&
          typeof answers.name === "string" &&
          answers.name.startsWith("@kdx/")
        ) {
          answers.name = answers.name.replace("@kdx/", "");
        }
        return "Config sanitized";
      },
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
      },
      {
        type: "modify",
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            const deps = answers.deps.split(" ").filter(Boolean);

            // Fetch all versions in parallel
            const versionPromises = deps.map((dep) =>
              fetch(`https://registry.npmjs.org/-/package/${dep}/dist-tags`)
                .then((res) => res.json())
                .then((json) => ({ dep, version: json.latest }))
            );

            const results = await Promise.all(versionPromises);

            if (!pkg.dependencies) pkg.dependencies = {};
            for (const { dep, version } of results) {
              pkg.dependencies[dep] = `^${version}`;
            }

            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm i", { stdio: "inherit" });
          execSync(`pnpm biome check --write packages/${answers.name}/**`);
          return "Package scaffolded";
        }
        return "Package not scaffolded";
      },
    ],
  });
}
