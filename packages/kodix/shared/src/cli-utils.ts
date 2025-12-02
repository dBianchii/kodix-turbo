import { exec as nodeExec, spawn } from "node:child_process";
import readline from "node:readline";

type AppName = "kdx" | "cash";

const confirm = (question: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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

  await execCommandInteractive(`pnpm -F @${app}/db exec drizzle-kit push`, {
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
