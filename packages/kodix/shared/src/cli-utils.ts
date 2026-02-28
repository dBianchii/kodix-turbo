import { exec as nodeExec, spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import readline from "node:readline";

type AppName = "kdx" | "cash";

export const confirm = (question: string) => {
  let input: NodeJS.ReadableStream = process.stdin;
  let output: NodeJS.WritableStream = process.stdout;

  if (!(process.stdin.isTTY && process.stdout.isTTY)) {
    try {
      input = createReadStream("/dev/tty");
      output = createWriteStream("/dev/tty");
    } catch {
      throw new Error(
        "Cannot prompt for confirmation without a TTY.\nRun from an interactive terminal.",
      );
    }
  }

  const rl = readline.createInterface({ input, output });

  return new Promise((resolve) => {
    rl.question(`${question} (Y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
};

export const pushDatabaseSchema = async (app: AppName, url: string) => {
  const urlObj = new URL(url);

  if (urlObj.hostname !== "localhost") {
    // biome-ignore lint/suspicious/noConsole: user confirmation
    console.warn(
      `⚠️  WARNING: You are about to push database schema changes to a live environment!\n   Database: ${urlObj}\n   This operation cannot be undone.\n`,
    );

    const confirmed = await confirm("Do you want to proceed?");

    if (!confirmed) {
      throw new Error("Database schema push aborted by user");
    }
  }

  await execCommandInteractive(`bun -F @${app}/db exec drizzle-kit push`, {
    env: {
      ...process.env,
      DATABASE_URL: url,
    },
  });
};

/** Runs a command with inherited stdio - use for interactive commands that need TTY */
export const execCommandInteractive = (
  command: string,
  options?: { env?: NodeJS.ProcessEnv },
): Promise<void> =>
  new Promise((resolve, reject) => {
    const childProcess = spawn(command, {
      env: options?.env,
      shell: true,
      stdio: "inherit",
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });

export const execCommand = (
  command: string,
  options?: Parameters<typeof nodeExec>[1] & { silent?: boolean },
): Promise<{ stdout: string }> =>
  new Promise((resolve, reject) => {
    const childProcess = nodeExec(command, options);

    let stdout = "";
    childProcess.stdout?.on("data", (data) => {
      stdout += data;
      if (options?.silent) {
        return;
      }
      process.stdout.write(data);
    });

    childProcess.stderr?.pipe(process.stderr);

    childProcess.on("close", (code, signal) => {
      if (code === 0) {
        resolve({ stdout });
      } else {
        reject(
          new Error(
            `Command failed with exit code ${code} and signal ${signal}`,
          ),
        );
      }
    });
  });

const ARG_PARSER_REGEX = /^--([^=]+)=(.*)$/;
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

const ENVIRONMENTS = ["production", "preview"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const getEnvironmentFromArguments = () => {
  const args = parseArgs();
  const env = args.environment;
  if (!env) {
    throw new Error("--environment flag is required (production or preview)");
  }
  if (!ENVIRONMENTS.includes(env as Environment)) {
    throw new Error(
      `Invalid environment: ${env}. Must be one of: ${ENVIRONMENTS.join(", ")}`,
    );
  }
  return env as Environment;
};

export const tryGetEnvironmentFromArguments = (): Environment | undefined => {
  const args = parseArgs();
  const env = args.environment;
  if (!env) return;
  if (!ENVIRONMENTS.includes(env as Environment)) {
    throw new Error(
      `Invalid environment: ${env}. Must be one of: ${ENVIRONMENTS.join(", ")}`,
    );
  }
  return env as Environment;
};

const DATABASE_URL_GRABBER_REGEX = /DATABASE_URL=["']?([^"'\n]+)["']?/;

export const fetchDatabaseUrlFromVercel = async ({
  appRoot,
  environment,
}: {
  appRoot: string;
  environment: Environment;
}) => {
  const fs = await import("node:fs/promises");
  const { resolve } = await import("node:path");

  const envFileName = `.env.${environment}`;
  const envFilePath = resolve(appRoot, envFileName);

  try {
    await execCommand(
      `vercel env pull ${envFileName} --environment=${environment} --cwd=${appRoot}`,
    );
    const envFile = await fs.readFile(envFilePath, "utf8");

    const databaseUrl = envFile
      .match(DATABASE_URL_GRABBER_REGEX)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "");

    if (!databaseUrl) {
      throw new Error(`DATABASE_URL not found in ${envFileName}`);
    }

    return databaseUrl;
  } finally {
    await execCommand(`rm -f ${envFilePath}`);
  }
};
