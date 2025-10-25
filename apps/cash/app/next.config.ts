import type { NextConfig } from "next";
import { env } from "node:process";

export default {
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

  // biome-ignore lint/suspicious/useAwait: Just next.js stuff
  async rewrites() {
    return [
      {
        destination: "https://us-assets.i.posthog.com/static/:path*",
        source: "/ingest/static/:path*",
      },
      {
        destination: "https://us.i.posthog.com/:path*",
        source: "/ingest/:path*",
      },
    ];
  },
  serverExternalPackages: ["@node-rs/argon2"],
  /** This is required to support PostHog trailing slash API requests */
  skipTrailingSlashRedirect: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@cash/api",
    "@cash/auth",
    "@cash/db",
    "@kodix/ui",
    "@kodix/dayjs",
    "@kodix/shared",
  ],

  typedRoutes: true,
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;
