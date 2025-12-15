import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchDatabaseUrlFromVercel,
  getEnvironmentFromArguments,
  pushDatabaseSchema,
} from "@kodix/shared/cli-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ROOT = resolve(__dirname, "../../../../apps/cash/app");

async function main() {
  const environment = getEnvironmentFromArguments();
  const databaseUrl = await fetchDatabaseUrlFromVercel({
    appRoot: APP_ROOT,
    environment,
  });

  await pushDatabaseSchema("cash", databaseUrl);
}

main()
  .then(() => 0)
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((code) => process.exit(code));
