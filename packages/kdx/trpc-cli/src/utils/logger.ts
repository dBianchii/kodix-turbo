/** biome-ignore-all lint/suspicious/noConsole: <on purpose> */
import chalk from "chalk";

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red(...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow(...args));
  },
};
