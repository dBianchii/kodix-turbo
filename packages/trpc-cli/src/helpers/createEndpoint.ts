import fs from "fs";
import path from "path";
import ora from "ora";

import type { runCli } from "../cli";

export const createEndpoint = async (
  userInput: Awaited<ReturnType<typeof runCli>>,
) => {
  console.log(userInput.whichRouter);
  const spinner = ora(
    `Creating your router definition at: ${userInput.whichRouter}...\n`,
  ).start();
};
