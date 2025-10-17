import fs from "node:fs/promises";
import { execCommand, pushDatabaseSchema } from "@kodix/shared/cli-utils";

const DATABASE_URL_GRABBER_REGEX = /DATABASE_URL=["']?([^"'\n]+)["']?/;

async function main() {
  await execCommand(
    "vercel env pull .env.production --environment=production --cwd=../../../apps/cash/app"
  );
  const productionEnv = await fs.readFile(
    "../../../apps/cash/app/.env.production",
    "utf8"
  );

  const productionDatabaseUrl = productionEnv
    .match(DATABASE_URL_GRABBER_REGEX)?.[1]
    ?.trim()
    .replace(/^["']|["']$/g, "");

  if (!productionDatabaseUrl) {
    throw new Error("DATABASE_URL not found in .env.production");
  }

  await pushDatabaseSchema("cash", productionDatabaseUrl);
}

main()
  .then(() => 0)
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .finally(async () => {
    await execCommand("rm -f ../../../apps/cash/app/.env.production");
  })
  .then((code) => process.exit(code));
