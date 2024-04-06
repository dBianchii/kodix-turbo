import { runCli } from "./cli";
import { createFiles } from "./helpers/createFiles";
import { logger } from "./utils/logger";

const main = async () => {
  logger.info("Hello! Let's create your new trpc endpoint");
  const userInput = await runCli();
  await createFiles(userInput);
};

main().catch((err) => {
  logger.error("Aborting endpoint creation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:",
    );
    console.log(err);
  }
  process.exit(1);
});
