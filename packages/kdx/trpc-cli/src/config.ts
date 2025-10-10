//? Define the configuration for the trpc-cli

export const trpcCliConfig = {
  paths: {
    proceduresFilePath: "../api/src/trpc/procedures.ts",
    routersFolderPath: "../api/src/trpc/routers",
    validatorsFolderPath: "../validators/src/trpc",
  },
  routerFileName: "_router.ts",
} satisfies {
  paths: {
    routersFolderPath: string;
    proceduresFilePath: string;
    validatorsFolderPath: string;
  };
  routerFileName: string;
};
