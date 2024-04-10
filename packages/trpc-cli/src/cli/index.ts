/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fs from "fs/promises";
import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import z from "zod";

import { trpcCliConfig } from "../../config";
import { logger } from "../utils/logger";

export const ROUTERS_FOLDER_PATH = path.resolve(
  process.cwd(),
  trpcCliConfig.paths.routersFolderPath,
);
export const PROCEDURESFILEPATH = path.resolve(
  process.cwd(),
  trpcCliConfig.paths.proceduresFilePath,
);
export const VALIDATORS_FOLDER_PATH = path.resolve(
  process.cwd(),
  trpcCliConfig.paths.validatorsFolderPath,
);
const zSafeName = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "Please provide a name without spaces or special characters",
  })
  .regex(/^[^0-9]/, {
    message: "Please provide a name that does not start with a number",
  })
  .regex(/^[a-z]/, {
    message:
      "Please provide a name that does not start with an uppercase letter",
  });
export const runCli = async () => {
  const routers: { label: string; value: string }[] = [];

  async function findRouterFolders(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        const subEntries = await fs.readdir(subDir, {
          withFileTypes: true,
        });

        const containsRouterFile = subEntries.some(
          (subEntry) =>
            subEntry.isFile() &&
            subEntry.name.endsWith(trpcCliConfig.routerFileName),
        );

        if (containsRouterFile) {
          const routerRelativePath = subDir
            .replace(ROUTERS_FOLDER_PATH, "")
            .replace("/", "");

          routers.push({
            label: routerRelativePath,
            value: routerRelativePath,
          });
        }

        // Recursively search subdirectories
        await findRouterFolders(subDir);
      }
    }
  }
  await findRouterFolders(ROUTERS_FOLDER_PATH);
  return await p.group(
    {
      chosenRouterPath: async () => {
        if (!routers[0])
          return logger.error(
            `No ${trpcCliConfig.routerFileName} files found inside ${chalk.yellow(ROUTERS_FOLDER_PATH)}. Make sure you provided the correct path to your routers folder.`,
          );

        return p.select({
          message: "Which router should your new endpoint be added to?",
          options: [
            ...routers,
            {
              label: "(create new)",
              value: "newRouter",
            },
          ],
          initialValue: routers[0].value,
        });
      },

      newRouterName: ({ results }) => {
        if (results.chosenRouterPath === "newRouter")
          return p.text({
            message: "What will be the name of your new router?",
            placeholder: "world",
            defaultValue: "world",
            initialValue: "world",
            validate: (input) => {
              const result = zSafeName.safeParse(input);
              if (!result.success) return result.error.errors[0]!.message;
            },
          });
      },
      appendNewRouter: ({ results }) => {
        if (
          results.chosenRouterPath === "newRouter" &&
          typeof results.newRouterName === "string"
        ) {
          const chalkedName = chalk.green(results.newRouterName).toString();
          return p.select({
            message:
              "And which router path should your new router be added to?",
            options: [
              ...routers.map((router) => ({
                label: `${router.label}/${chalkedName}`,
                value: router.value,
              })),
              {
                label: `${chalkedName} (${chalk.italic("root")})`,
                value: "",
              },
            ],
            initialValue: routers[0]!.value,
          });
        }
      },
      endpointName: () => {
        return p.text({
          message: "What will be the name of your new endpoint?",
          placeholder: "makeItBetter",
          defaultValue: "makeItBetter",
          validate: (input) => {
            if (input.length > 0) {
              const result = zSafeName.safeParse(input);
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
          message: "Which procedure?",
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
