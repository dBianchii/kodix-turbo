import { TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import type { TInstallAppInputSchema } from "@kdx/validators/trpc/app";
import { appRepository } from "@kdx/db/repositories";
import { appDependencies, getAppDependencies, todoAppId } from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

/**
 * Instala um app e todas suas dependências automaticamente
 */
export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  if (input.appId === todoAppId) {
    //TODO: stinky
    throw new TRPCError({
      message: "DISABLED",
      code: "BAD_REQUEST",
    });
  }

  const teamId = ctx.auth.user.activeTeamId;
  const userId = ctx.auth.user.id;

  console.log(`📦 [INSTALL] Installing app ${input.appId} for team ${teamId}`);

  // Verificar se o app já está instalado
  const installed = await appRepository.findInstalledApp({
    appId: input.appId,
    teamId,
  });

  if (installed) {
    throw new TRPCError({
      message: ctx.t("api.App already installed"),
      code: "BAD_REQUEST",
    });
  }

  // 🎯 NOVO: Verificar e instalar dependências automaticamente
  const dependencies = getAppDependencies(input.appId);

  if (dependencies.length > 0) {
    console.log(
      `🔗 [DEPENDENCIES] App ${input.appId} requires: ${dependencies.join(", ")}`,
    );

    // Verificar quais dependências não estão instaladas
    const missingDependencies = [];
    for (const depAppId of dependencies) {
      const depInstalled = await appRepository.findInstalledApp({
        appId: depAppId,
        teamId,
      });

      if (!depInstalled) {
        missingDependencies.push(depAppId);
      }
    }

    // Instalar dependências que estão faltando
    if (missingDependencies.length > 0) {
      console.log(
        `⚠️ [DEPENDENCIES] Installing missing dependencies: ${missingDependencies.join(", ")}`,
      );

      for (const depAppId of missingDependencies) {
        console.log(`📦 [AUTO_INSTALL] Installing dependency: ${depAppId}`);

        try {
          await appRepository.installAppForTeam({
            appId: depAppId as KodixAppId,
            teamId,
            userId,
          });

          console.log(
            `✅ [AUTO_INSTALL] Successfully installed dependency: ${depAppId}`,
          );
        } catch (error) {
          console.error(
            `❌ [AUTO_INSTALL] Failed to install dependency ${depAppId}:`,
            error,
          );

          throw new TRPCError({
            message: `Failed to install required dependency: ${depAppId}`,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      }
    } else {
      console.log(`✅ [DEPENDENCIES] All dependencies already installed`);
    }
  }

  // Instalar o app principal
  console.log(`📦 [INSTALL] Installing main app: ${input.appId}`);

  try {
    await appRepository.installAppForTeam({
      appId: input.appId,
      teamId,
      userId,
    });

    console.log(`✅ [INSTALL] Successfully installed app: ${input.appId}`);

    // Logs para auditoria
    if (dependencies.length > 0) {
      console.log(
        `🎯 [INSTALL_SUMMARY] Installed ${input.appId} with dependencies: ${dependencies.join(", ")}`,
      );
    }
  } catch (error) {
    console.error(`❌ [INSTALL] Failed to install app ${input.appId}:`, error);

    throw new TRPCError({
      message: "Failed to install app",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
