import { reset } from "drizzle-seed";
import ora from "ora";

import {
  aiStudioAppId,
  calendarAppId,
  chatAppId,
  KDX_PRODUCTION_URL,
  kdxPartnerId,
  kodixCareAppId,
  todoAppId,
  typedObjectKeys,
} from "@kdx/shared";

import { buildConflictUpdateColumns } from "../src";
import { db } from "../src/client";
import * as schema from "../src/schema";
import { apps, devPartners, teams, users } from "../src/schema";
import { seedAiStudio, seedAiStudioWithTeam } from "../src/seed/ai-studio";
import { seedChatDemo, seedChatWithTeam } from "../src/seed/chat";

const _devPartners: (typeof devPartners.$inferInsert)[] = [
  {
    id: kdxPartnerId,
    name: "Kodix",
    partnerUrl: KDX_PRODUCTION_URL,
  },
];

export const _apps: (typeof apps.$inferInsert)[] = [
  {
    id: todoAppId, //As const so it can be used as a type
    devPartnerId: kdxPartnerId,
  },
  {
    id: calendarAppId,
    devPartnerId: kdxPartnerId,
  },
  {
    id: kodixCareAppId,
    devPartnerId: kdxPartnerId,
  },
  {
    id: chatAppId,
    devPartnerId: kdxPartnerId,
  },
  {
    id: aiStudioAppId,
    devPartnerId: kdxPartnerId,
  },
];

const runSeed = () =>
  db.transaction(async (tx) => {
    if (!_devPartners[0]) throw new Error("No devPartners!");
    if (!_apps[0]) throw new Error("No apps!");

    await tx
      .insert(devPartners)
      .values(_devPartners)
      .onDuplicateKeyUpdate({
        set: buildConflictUpdateColumns(
          devPartners,
          typedObjectKeys(_devPartners[0]),
        ),
      });
    await tx
      .insert(apps)
      .values(_apps)
      .onDuplicateKeyUpdate({
        set: buildConflictUpdateColumns(apps, typedObjectKeys(_apps[0])),
      });
  });

async function seedAiModulesForExistingTeams() {
  try {
    console.log("🔍 Verificando teams existentes para seeds de IA...");

    // Buscar teams existentes
    const existingTeams = await db.query.teams.findMany({
      with: {
        Owner: {
          columns: { id: true, name: true },
        },
      },
    });

    if (existingTeams.length === 0) {
      console.log(
        "ℹ️  Nenhum team encontrado. Crie teams através da aplicação primeiro.",
      );
      return;
    }

    console.log(`📦 Encontrados ${existingTeams.length} teams para processar`);

    let processedTeams = 0;
    let processedChats = 0;

    for (const team of existingTeams) {
      try {
        console.log(`\n🏢 Processando team: ${team.name} (${team.id})`);

        // Seed AI Studio para este team
        const aiStudioResult = await seedAiStudioWithTeam(
          team.id,
          team.ownerId,
        );
        if (aiStudioResult) {
          processedTeams++;
          console.log(`✅ AI Studio configurado para ${team.name}`);

          // Seed Chat para este team
          try {
            const chatResult = await seedChatWithTeam(team.id, team.ownerId);
            if (chatResult) {
              processedChats++;
              console.log(`✅ Chat configurado para ${team.name}`);
            }
          } catch (chatError) {
            console.log(
              `⚠️  Erro ao configurar chat para ${team.name}:`,
              chatError,
            );
          }
        }
      } catch (teamError) {
        console.log(`⚠️  Erro ao processar team ${team.name}:`, teamError);
      }
    }

    console.log(`\n📊 Resumo do processamento:`);
    console.log(
      `   - ${processedTeams}/${existingTeams.length} teams com AI Studio`,
    );
    console.log(
      `   - ${processedChats}/${existingTeams.length} teams com Chat`,
    );
  } catch (error) {
    console.error("❌ Erro durante seed automático para teams:", error);
  }
}

async function main() {
  const dbResetSpinner = ora(`🧨 Resetting database...`).start();
  try {
    await reset(db, schema);
  } catch (error: unknown) {
    dbResetSpinner.fail(
      `Failed to reset database: ${(error as Error).message}`,
    );
    throw error;
  }
  dbResetSpinner.succeed("💥 Database reset!");

  const seedingSpinner = ora("🌱 Seeding basic data...").start();

  try {
    await runSeed();
  } catch (error: unknown) {
    seedingSpinner.fail(`Failed to seed: ${(error as Error).message}`);
    throw error;
  }

  seedingSpinner.succeed(`🌲 Apps and partners seeded!`);

  // Seed AI Studio data (global models)
  const aiStudioSpinner = ora("🤖 Seeding AI Studio models...").start();
  try {
    const aiResult = await seedAiStudio();
    aiStudioSpinner.succeed(
      `🤖 AI Studio seeded! ${aiResult.models.length || 0} models available`,
    );
  } catch (error: unknown) {
    aiStudioSpinner.fail(
      `Failed to seed AI Studio: ${(error as Error).message}`,
    );
    console.error("AI Studio seed error:", error);
    // Não falha o processo completo, apenas continua
  }

  // Tentar seed automático para teams existentes
  const autoSeedSpinner = ora("🔄 Checking for existing teams...").start();
  try {
    await seedAiModulesForExistingTeams();
    autoSeedSpinner.succeed("🔄 Auto-seed check completed!");
  } catch (error: unknown) {
    autoSeedSpinner.fail(`Auto-seed error: ${(error as Error).message}`);
  }

  // Demo info for Chat
  const chatSpinner = ora("💬 Displaying chat seed info...").start();
  try {
    await seedChatDemo();
    chatSpinner.succeed("💬 Chat seed info displayed!");
  } catch (error: unknown) {
    chatSpinner.fail(`Chat seed error: ${(error as Error).message}`);
  }

  console.log("\n✅ Seed process completed!");
  console.log("\n📝 Next steps:");
  console.log("   1. If no teams exist yet:");
  console.log("      - Create teams and users through the application");
  console.log("      - Run this seed again for automatic AI setup");
  console.log("");
  console.log("   2. For manual setup:");
  console.log("      - Use: await seedAiStudioWithTeam(teamId, userId)");
  console.log("      - Use: await seedChatWithTeam(teamId, userId)");
  console.log("");
  console.log("   3. For production:");
  console.log("      - Replace example tokens with real API keys");
  console.log("      - Update AI model configurations");
  console.log("      - Customize agent instructions for your use case");
  console.log("");
  console.log("🔗 Available resources after setup:");
  console.log("   📁 Chat folders with organized conversations");
  console.log("   🤖 AI agents specialized for different tasks");
  console.log("   💾 AI libraries with document storage");
  console.log("   🔑 API tokens for AI model integration");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

export const appIdToPathname = {
  [kodixCareAppId]: "kodixCare",
  [calendarAppId]: "calendar",
  [todoAppId]: "todo",
  [chatAppId]: "chat",
  [aiStudioAppId]: "aiStudio",
} as const;

export const appPathnameToAppId = {
  kodixCare: kodixCareAppId,
  calendar: calendarAppId,
  todo: todoAppId,
  chat: chatAppId,
  aiStudio: aiStudioAppId,
} as const;
