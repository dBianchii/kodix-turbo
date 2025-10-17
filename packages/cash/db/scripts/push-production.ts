import fs from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execCommand, pushDatabaseSchema } from "@kodix/shared/cli-utils";

const DATABASE_URL_GRABBER_REGEX = /DATABASE_URL=["']?([^"'\n]+)["']?/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ROOT = resolve(__dirname, "../../../../apps/cash/app");
const ENV_FILE_PATH = resolve(APP_ROOT, ".env.production");

const deleteEnvFile = () => execCommand(`rm -f ${ENV_FILE_PATH}`);
async function main() {
  await execCommand(
    `vercel env pull .env.production --environment=production --cwd=${APP_ROOT}`
  );
  const productionEnv = await fs.readFile(ENV_FILE_PATH, "utf8");

  const productionDatabaseUrl = productionEnv
    .match(DATABASE_URL_GRABBER_REGEX)?.[1]
    ?.trim()
    .replace(/^["']|["']$/g, "");

  if (!productionDatabaseUrl) {
    throw new Error("DATABASE_URL not found in .env.production");
  }

  await deleteEnvFile();
  await pushDatabaseSchema("cash", productionDatabaseUrl);
}

main()
  .then(() => 0)
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .finally(async () => {
    await deleteEnvFile();
  })
  .then((code) => process.exit(code));
