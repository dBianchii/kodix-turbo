import chalk from "chalk";
import ora from "ora";

import type { runCli } from "../cli";
import { trpcCliConfig } from "../../config";
import { VALIDATORS_FOLDER_PATH } from "../cli";
import { logger } from "../utils/logger";
import { createHandler } from "./createHandler";
import { createRouter } from "./createRouter";
import { createValidator } from "./createValidator";
import { runPrettier } from "./runPrettier";

export const createFiles = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  const spinner = ora(`Creating your endpoint...\n`).start();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const routerRelativePath = userInput.routerPath
    .split("routers/")[1]!
    .replace(`/${trpcCliConfig.routerFileName}`, "");

  const handlerPath = `${userInput.routerPath.replace(trpcCliConfig.routerFileName, "")}${userInput.name}.handler.ts`;
  const validatorPath = `${VALIDATORS_FOLDER_PATH}/${routerRelativePath}/index.ts`;
  const promises = [
    createRouter(userInput, routerRelativePath),
    createHandler(userInput, routerRelativePath, handlerPath),
  ];
  if (userInput.validator)
    promises.push(createValidator(userInput, validatorPath));

  await Promise.all(promises);

  spinner.succeed(`Endpoint created!\n`);

  const prettierSpinner = ora("Running Prettier...\n").start();
  await runPrettier([userInput.routerPath, handlerPath, validatorPath]);
  prettierSpinner.succeed("Prettier ran successfully!\n");

  logger.success("Links to your new/modified files:");
  logger.success(
    `Router: ${chalk.blue(`${routerRelativePath}/${trpcCliConfig.routerFileName}`)}`,
  );
  logger.success(
    `Handler: ${chalk.blue(`${routerRelativePath}/${userInput.name}.handler.ts`)}`,
  );
  if (userInput.validator)
    logger.success(
      `Validator: ${chalk.blue(`trpc/${routerRelativePath}/index.ts`)}`,
    );

  process.exit(0);
};
