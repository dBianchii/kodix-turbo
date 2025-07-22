import type { CreateFilesParams } from "./helpers/create-files";
import { runCli } from "./cli";
import { createFiles } from "./helpers/create-files";
import { logger } from "./utils/logger";

const main = async () => {
  logger.info("Hello! Let's create your new trpc endpoint");
  const userInput = await runCli();

  const params: CreateFilesParams = {
    chosenRouterPath: userInput.chosenRouterPath,
    endpointName: userInput.endpointName,
    validator: userInput.validator,
    queryOrMutation: userInput.queryOrMutation,
    procedure: userInput.procedure,
  };
  if (userInput.chosenRouterPath === "newRouter") {
    if (params.validator)
      throw new Error("Validators are not supported for new routers yet");

    params.chosenRouterPath = `${userInput.appendNewRouter as string}/${userInput.newRouterName as string}`;
    params.newRouterName = userInput.newRouterName as string;
  }

  await createFiles(params);
  process.exit(0);
};

main().catch((err) => {
  logger.error("Aborting endpoint creation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    );
    logger.error(err);
  }
  process.exit(1);
});
