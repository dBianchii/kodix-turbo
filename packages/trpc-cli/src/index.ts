import { runCli } from "./cli";
import { createFiles } from "./helpers/createFiles";
import { logger } from "./utils/logger";

const main = async () => {
  const userInput = await runCli();

  const results = await createFiles(userInput);
};

main().catch((err) => {
  logger.error("Aborting installation...");
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