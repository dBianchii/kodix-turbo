import fs from "fs/promises";
import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { logger } from "../utils/logger";

const ROUTERSFOLDER = path.resolve(process.cwd(), "/api/src/routers");

export const runCli = async () => {
  new Command()
    .name("trpc-tools")
    .description("A CLI for for instantiating new trpc endpoints")
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create",
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false,
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false,
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new t3-app",
      false,
    )
    .option(
      "--appRouter [boolean]",
      "Explicitly tell the CLI to use the new Next.js app router",
      (value) => !!value && value !== "false",
    )
    .parse(process.argv);

  return await p.group(
    {
      name: () => {
        return p.text({
          message: "What will be the name of your new endpoint?",
          placeholder: "makeTheWorldBetter",
          validate: (input) => {
            if (input.includes(" ")) {
              return "Please provide a name without spaces";
            }
          },
        });
      },
      procedure: () => {
        return p.select({
          message: "Will it be a public or protected procedure?",
          initialValue: "protected",
          options: [
            { value: "protected", label: "A protected procedure" },
            { value: "public", label: "A public procedure" },
          ],
        });
      },
      validator: () => {
        return p.text({
          message: "Please define your zod schema",
          placeholder: "z.object({ name: z.string() })",
          validate: (input) => {
            // if (!input.includes("z.")) {
            //   return "Please provide a valid zod schema";
            // }
          },
        });
      },
      queryOrMutation: () => {
        return p.select({
          message: "Will it be a query or mutation?",
          initialValue: "query",
          options: [
            {
              value: "query",
              label: "A query for making the world better",
              hint: "For fetching data",
            },
            {
              value: "mutation",
              label: "A mutation",
              hint: "For mutating data",
            },
          ],
        });
      },
      whichRouter: async () => {
        const dir = path.resolve(process.cwd(), "../api/src/routers");
        const routers: { label: string; value: string }[] = [];

        async function findRouterFolders(dir: string) {
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            if (entry.isDirectory()) {
              const subDir = path.join(dir, entry.name);
              const subEntries = await fs.readdir(subDir, {
                withFileTypes: true,
              });

              const fileToLookFor = "_router.ts";
              const containsRouterFile = subEntries.some(
                (subEntry) =>
                  subEntry.isFile() && subEntry.name.endsWith(fileToLookFor),
              );

              if (containsRouterFile) {
                routers.push({
                  label: subDir.split("/").at(-1)!,
                  value: `${subDir}/${fileToLookFor}`,
                });
              }

              // Recursively search subdirectories
              await findRouterFolders(subDir);
            }
          }
        }
        await findRouterFolders(dir);

        return p.select({
          message: "Which router should this procedure be added to?",
          options: routers,
          initialValue: "app",
        });
      },
    },
    {
      onCancel() {
        process.exit(1);
      },
    },
  );
};
