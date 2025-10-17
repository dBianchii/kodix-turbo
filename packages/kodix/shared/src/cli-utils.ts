import { exec as nodeExec } from "node:child_process";

type AppName = "kdx" | "cash";

export const pushDatabaseSchema = async (app: AppName, url: string) => {
  if (new URL(url).hostname !== "localhost") {
    throw new Error(
      "Uncomment this line to push the database schema in a live environment. Proceed with caution."
    );
  }

  await execCommand(`pnpm -F @${app}/db exec drizzle-kit push`, {
    env: {
      ...process.env,
      DATABASE_URL: url,
    },
  });
};

export const execCommand = (
  command: string,
  options?: Parameters<typeof nodeExec>[1] & { silent?: boolean }
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
            `Command failed with exit code ${code} and signal ${signal}`
          )
        );
      }
    });
  });
