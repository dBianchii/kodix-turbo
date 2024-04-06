import ora from "ora";

import type { runCli } from "../cli";
import { createHandler } from "./createHandler";
import { createRouter } from "./createRouter";
import { createValidator } from "./createValidator";

export const createFiles = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  const spinner = ora(`Creating your endpoint...`).start();

  const routerRelativePath = userInput.routerPath
    .split("routers/")[1]!
    .replace("/_router.ts", "");

  const promises = [
    createRouter(userInput, routerRelativePath),
    createHandler(userInput, routerRelativePath),
  ];
  if (userInput.validator)
    promises.push(createValidator(userInput, routerRelativePath));

  const successes = await Promise.allSettled(promises);

  spinner.stop();

  process.exit(0);
};
