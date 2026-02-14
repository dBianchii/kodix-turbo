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
    actions: [
      (answers) => {
        if (
          "name" in answers &&
          typeof answers.name === "string" &&
          answers.name.startsWith("@kodix/")
        ) {
          answers.name = answers.name.replace("@kodix/", "");
        }
        return "Config sanitized";
      },
      {
        path: "packages/kodix/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
        type: "add",
      },
      {
        path: "packages/kodix/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
        type: "add",
      },
      {
        path: "packages/kodix/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
        type: "add",
      },
      {
        path: "packages/kodix/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            const deps = answers.deps.split(" ").filter(Boolean);

            // Fetch all versions in parallel
            const versionPromises = deps.map((dep) =>
              fetch(`https://registry.npmjs.org/-/package/${dep}/dist-tags`)
                .then((res) => res.json())
                .then((json) => ({ dep, version: json.latest })),
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
        type: "modify",
      },
      (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          execSync("bun i", { stdio: "inherit" });
          execSync(`bun biome check --write packages/kodix/${answers.name}/**`);
          return "Package scaffolded";
        }
        return "Package not scaffolded";
      },
    ],
    description: "Generate a new package for the Kodix Turbo Monorepo",
    prompts: [
      {
        message:
          "What is the name of the package? (You can skip the `@kodix/` prefix)",
        name: "name",
        type: "input",
      },
      {
        message:
          "Enter a space separated list of dependencies you would like to install",
        name: "deps",
        type: "input",
      },
    ],
  });
}
