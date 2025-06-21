import { fileURLToPath } from "url";
import { createJiti } from "jiti";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
const jiti = createJiti(fileURLToPath(import.meta.url), {
  // Optimize jiti configuration to reduce webpack warnings
  cache: true,
  debug: false,
});

await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ["@node-rs/argon2"],

  // Turbopack configuration (stable since Next.js 15)
  turbopack: {
    // Enable turbopack for development
  },

  // Webpack optimization to reduce jiti warnings
  webpack: (config) => {
    // Optimize build dependency parsing for jiti
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ignore dynamic import warnings for jiti
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /jiti/,
        message: /Parsing.*for build dependencies failed/,
      },
    ];

    return config;
  },

  experimental: {
    serverActions:
      process.env.NODE_ENV === "development"
        ? {
            allowedOrigins: ["localhost:3000"], //? useful for port forwarding
          }
        : undefined,
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@kdx/api",
    "@kdx/auth",
    "@kdx/db",
    "@kdx/ui",
    "@kdx/validators",
    "@kdx/dayjs",
    "@kdx/shared",
    "@kdx/locales",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withNextIntl(config);
