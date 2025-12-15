import fs from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execCommand, pushDatabaseSchema } from "@kodix/shared/cli-utils";

const DATABASE_URL_GRABBER_REGEX = /DATABASE_URL=["']?([^"'\n]+)["']?/;
const ARG_PARSER_REGEX = /^--([^=]+)=(.*)$/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_ROOT = resolve(__dirname, "../../../../apps/cash/app");

const parseArgs = () => {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(ARG_PARSER_REGEX);
    if (match) {
      // biome-ignore lint/style/noNonNullAssertion: Safe to do so
      args[match[1]!] = match[2]!;
    }
  }
  return args;
};

const getEnvironment = () => {
  const args = parseArgs();
  const env = args.environment;
  if (!env) {
    throw new Error("--environment flag is required (production or preview)");
  }
  if (env !== "production" && env !== "preview") {
    throw new Error(
      `Invalid environment: ${env}. Must be 'production' or 'preview'`,
    );
  }
  return env as "production" | "preview";
};

const deleteEnvFile = (envFilePath: string) =>
  execCommand(`rm -f ${envFilePath}`);

async function main() {
  const environment = getEnvironment();
  const envFileName = `.env.${environment}`;
  const ENV_FILE_PATH = resolve(APP_ROOT, envFileName);

  try {
    await execCommand(
      `vercel env pull ${envFileName} --environment=${environment} --cwd=${APP_ROOT}`,
    );
    const envFile = await fs.readFile(ENV_FILE_PATH, "utf8");

    const databaseUrl = envFile
      .match(DATABASE_URL_GRABBER_REGEX)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "");

    if (!databaseUrl) {
      throw new Error(`DATABASE_URL not found in ${envFileName}`);
    }

    await pushDatabaseSchema("cash", databaseUrl);
  } finally {
    await deleteEnvFile(ENV_FILE_PATH);
  }
}

main()
  .then(() => 0)
  .catch((e) => {
    console.error(e);
    return 1;
  })
  .then((code) => process.exit(code));
