import { generatePasswordHash } from "@cash/auth";
import { userRepository } from "@cash/db/repositories";
import * as p from "@clack/prompts";
import { nanoid } from "@kodix/shared/utils";
import chalk from "chalk";
import { z } from "zod";

const MIN_PASSWORD_LENGTH = 6;

async function createUserInteractive() {
  console.log();
  p.intro(chalk.bgBlue(" 🔐 Cash App - Create New User "));

  let userCreated = false;

  while (!userCreated) {
    try {
      const userDetails = await p.group(
        // biome-ignore assist/source/useSortedKeys: Keep correct order of events for CLI
        {
          email: () =>
            p.text({
              message: "What's the user's email?",
              placeholder: "admin@example.com",
              validate: (value) => {
                if (!value) return "Email is required";

                const emailValidation = z.email().safeParse(value);
                if (!emailValidation.success) {
                  return "Please enter a valid email address";
                }
              },
            }),

          checkExisting: async ({ results }) => {
            if (results.email) {
              const existingUser = await userRepository.findUserByEmail(
                results.email
              );
              if (existingUser) {
                throw new Error("User with this email already exists");
              }
            }
          },

          password: () =>
            p.password({
              message: "Enter a password",
              validate: (value) => {
                if (!value) return "Password is required";
                if (value.length < MIN_PASSWORD_LENGTH) {
                  return "Password must be at least 6 characters long";
                }
              },
            }),

          confirmPassword: ({ results }) =>
            p.password({
              message: "Confirm the password",
              validate: (value) => {
                if (!value) return "Please confirm the password";
                if (value !== results.password) {
                  return "Passwords do not match";
                }
              },
            }),

          name: () =>
            p.text({
              message: "What's the user's full name?",
              placeholder: "John Doe",
              validate: (value) => {
                if (!value) return "Name is required";
              },
            }),

          confirm: ({ results }) =>
            p.confirm({
              initialValue: true,
              message: `Create user with email ${chalk.cyan(results.email)}?`,
            }),
        },
        {
          onCancel: () => {
            p.cancel("Operation cancelled");
            process.exit(0);
          },
        }
      );

      if (!userDetails.confirm) {
        p.cancel("User creation cancelled");
        process.exit(0);
      }

      const spinner = p.spinner();
      spinner.start("Creating user...");

      const passwordHash = await generatePasswordHash(userDetails.password);
      const userId = nanoid();

      await userRepository.createUser({
        email: userDetails.email,
        id: userId,
        name: userDetails.name,
        passwordHash,
      });

      spinner.stop("User created successfully!");

      p.note(
        `${chalk.cyan("ID:")} ${userId}\n${chalk.cyan("Email:")} ${userDetails.email}\n${chalk.cyan("Name:")} ${userDetails.name}`,
        "User Details"
      );

      p.outro(chalk.green("✅ User has been created and can now log in!"));
      userCreated = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        p.log.error(
          "❌ User with this email already exists. Please try with a different email."
        );
        console.log(); // Add some spacing
      } else {
        p.cancel(
          `❌ Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        process.exit(1);
      }
    }
  }
}

createUserInteractive()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
