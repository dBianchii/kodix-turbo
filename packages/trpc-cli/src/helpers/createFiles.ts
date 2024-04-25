import chalk from "chalk";
import ora from "ora";

import { trpcCliConfig } from "../../config";
import { ROUTERS_FOLDER_PATH, VALIDATORS_FOLDER_PATH } from "../cli";
import { logger } from "../utils/logger";
import { createHandler } from "./createHandler";
import { createRouter } from "./createRouter";
import { createValidator } from "./createValidator";
import { runPrettier } from "./runPrettier";

export interface CreateFilesParams {
  chosenRouterPath: string;
  endpointName: string;
  validator: string;
  queryOrMutation: string;
  procedure: string;
  newRouterName?: string;
}

export const createFiles = async (params: CreateFilesParams) => {
  const spinner = ora(`Creating your endpoint...\n`).start();

  const routerFolderFilePath = `${ROUTERS_FOLDER_PATH}/${params.chosenRouterPath}`;
  const routerFilePath = `${routerFolderFilePath}/${trpcCliConfig.routerFileName}`;

  const handlerPath = `${ROUTERS_FOLDER_PATH}/${params.chosenRouterPath}/${params.endpointName}.handler.ts`;
  const validatorPath = `${VALIDATORS_FOLDER_PATH}/${params.chosenRouterPath}/index.ts`;

  const promises = [
    createRouter({
      routerFolderFilePath,
      routerFilePath,
      chosenRouterPath: params.chosenRouterPath,
      endpointName: params.endpointName,
      validator: params.validator,
      procedure: params.procedure,
      queryOrMutation: params.queryOrMutation,
      newRouterName: params.newRouterName,
    }),
    createHandler({
      handlerPath,
      chosenRouterPath: params.chosenRouterPath,
      endpointName: params.endpointName,
      validator: params.validator,
      procedure: params.procedure,
    }),
  ];

  if (params.validator)
    promises.push(
      createValidator({
        validatorPath,
        validator: params.validator,
        endpointName: params.endpointName,
      }),
    );

  await Promise.all(promises);

  spinner.succeed(`Endpoint created!\n`);

  const prettierSpinner = ora("Running Prettier...\n").start();

  const oneLevelAboveRouter =
    routerFolderFilePath.split("/").slice(0, -1).join("/") +
    `/${trpcCliConfig.routerFileName}`;
  const pathsToRunPrettier = [routerFilePath, handlerPath];
  if (params.validator) pathsToRunPrettier.push(validatorPath);
  if (params.newRouterName) pathsToRunPrettier.push(oneLevelAboveRouter);
  await runPrettier(pathsToRunPrettier);

  prettierSpinner.succeed("Prettier ran successfully!\n");

  logger.success("Links to your new/modified files:");
  logger.success(
    `Router: ${chalk.blue(`${params.chosenRouterPath}/${trpcCliConfig.routerFileName}`)}`,
  );
  logger.success(
    `Handler: ${chalk.blue(`${params.chosenRouterPath}/${params.endpointName}.handler.ts`)}`,
  );
  if (params.validator)
    logger.success(
      `Validator: ${chalk.blue(`trpc/${params.chosenRouterPath}/index.ts`)}`,
    );
};
