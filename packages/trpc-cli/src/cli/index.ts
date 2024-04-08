/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fs from "fs/promises";
import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import z from "zod";

import { logger } from "../utils/logger";

export const ROUTERS_FOLDER_PATH = path.resolve(
  process.cwd(),
  "../api/src/routers",
);
export const VALIDATORS_FOLDER_PATH = path.resolve(
  process.cwd(),
  "../validators/src/trpc",
);
export const PROCEDURESFILEPATH = path.resolve(
  process.cwd(),
  "../api/src/procedures.ts",
);

export const runCli = async () => {
  return await p.group(
    {
      routerPath: async () => {
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
                  label: subDir
                    .replace(ROUTERS_FOLDER_PATH, "")
                    .replace("/", ""),
                  value: `${subDir}/${fileToLookFor}`,
                });
              }

              // Recursively search subdirectories
              await findRouterFolders(subDir);
            }
          }
        }
        await findRouterFolders(ROUTERS_FOLDER_PATH);

        if (!routers[0])
          return logger.error(
            `No _router.ts files found inside ${chalk.yellow(ROUTERS_FOLDER_PATH)}. Make sure you provided the correct path to your routers folder.`,
          );

        return p.select({
          message: "Which router should your new endpoint be added to?",
          options: routers,
          initialValue: routers[0].value,
        });
      },
      name: () => {
        return p.text({
          message: "What will be the name of your new endpoint?",
          placeholder: "makeTheWorldBetter",
          defaultValue: "makeTheWorldBetter",
          validate: (input) => {
            if (input.length > 0) {
              const result = z
                .string()
                .min(1)
                .regex(/^[a-zA-Z0-9]+$/, {
                  message:
                    "Please provide a name without spaces or special characters",
                })
                .regex(/^[^0-9]/, {
                  message:
                    "Please provide a name that does not start with a number",
                })
                .regex(/^[a-z]/, {
                  message:
                    "Please provide a name that does not start with an uppercase letter",
                })
                .safeParse(input);

              if (!result.success) return result.error.errors[0]!.message;
            }
          },
        });
      },
      procedure: async () => {
        try {
          await fs.access(PROCEDURESFILEPATH);
        } catch (error) {
          logger.error(
            `No procedures file found at ${chalk.yellow(
              PROCEDURESFILEPATH,
            )}. Make sure you provided the correct path to your procedures file.`,
          );
          process.exit(1);
        }

        const proceduresFile = await fs.readFile(PROCEDURESFILEPATH, "utf-8");
        const proceduresExport = proceduresFile.match(/export const (\w+)/g); //? Assume that all procedures are exported as const
        if (!proceduresExport?.length) {
          logger.error(
            `We found your file at ${chalk.yellow(PROCEDURESFILEPATH)}, but no procedures were found in it. Please add a procedure to the this file before continuing`,
          );
          process.exit(1);
        }

        return p.select({
          message: "Will it be a public or protected procedure?",
          initialValue: "protected",
          options: proceduresExport.map((procedure) => {
            const name = procedure.split(" ")[2]!;
            return {
              value: name,
              label: name,
            };
          }),
        });
      },
      validator: () => {
        return p.text({
          message: "Please define your zod schema (leave empty for no input)",
          placeholder: "z.object({ name: z.string() })",
          validate: (input) => {
            if (input) {
              try {
                const schema = eval(input) as unknown;
                if (!(schema instanceof z.ZodSchema))
                  return "Please provide a valid Zod schema";
              } catch (error) {
                return "Please provide a valid Zod schema";
              }
            }
          },
        });
      },
      queryOrMutation: () => {
        return p.select({
          message: "Will it be a query or a mutation?",
          initialValue: "query",
          options: [
            {
              value: "query",
              label: "query",
              hint: "For fetching data",
            },
            {
              value: "mutation",
              label: "mutation",
              hint: "For mutating data",
            },
          ],
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
