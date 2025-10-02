import "@kdx/env"; // Validate env at build time

import type { NextConfig } from "next";
import { env } from "node:process";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  /** We already do linting and tscing as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions:
      env.NODE_ENV === "development"
        ? {
            allowedOrigins: ["localhost:3000"], //? useful for port forwarding
          }
        : undefined,
  },
  serverExternalPackages: ["@node-rs/argon2"],

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@kdx/api",
    "@kdx/auth",
    "@kdx/db",
    "@kodix/ui",
    "@kdx/validators",
    "@kodix/dayjs",
    "@kodix/shared",
    "@kdx/locales",
  ],
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig);
