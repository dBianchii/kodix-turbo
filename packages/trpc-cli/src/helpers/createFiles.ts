import chalk from "chalk";
import ora from "ora";

import type { runCli } from "../cli";
import { logger } from "../utils/logger";
import { createHandler } from "./createHandler";
import { createRouter } from "./createRouter";
import { createValidator } from "./createValidator";

export const createFiles = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  const spinner = ora(`Creating your endpoint...\n`).start();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const routerRelativePath = userInput.routerPath
    .split("routers/")[1]!
    .replace("/_router.ts", "");

  const promises = [
    createRouter(userInput, routerRelativePath),
    createHandler(userInput, routerRelativePath),
  ];
  if (userInput.validator)
    promises.push(createValidator(userInput, routerRelativePath));

  await Promise.all(promises);

  spinner.succeed(`Endpoint created!\n`);

  logger.success("Links to your new/modified files:");
  logger.success(`Router: ${chalk.blue(`${routerRelativePath}/_router.ts`)}`);
  logger.success(
    `Handler: ${chalk.blue(`${routerRelativePath}/${userInput.name}.handler.ts`)}`,
  );
  if (userInput.validator)
    logger.success(
      `Validator: ${chalk.blue(`trpc/${routerRelativePath}/index.ts`)}`,
    );

  process.exit(0);
};
