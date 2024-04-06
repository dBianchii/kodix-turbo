import ora from "ora";

import type { runCli } from "../cli";
import { createHandler } from "./createHandler";
import { createRouter } from "./createRouter";

export const createEndpoint = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  const spinner = ora(
    `Creating your endpoint at: ${userInput.routerPath}\n`,
  ).start();
  await createHandler(userInput);
  await createRouter(userInput);

  process.exit(0);
};
