//? Define the configuration for the trpc-cli

export const trpcCliConfig = {
  paths: {
    routersFolderPath: "../api/src/routers",
    proceduresFilePath: "../api/src/procedures.ts",
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
