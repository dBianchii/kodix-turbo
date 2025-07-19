import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";

import { db } from "../client";
import { aiStudioRepository } from "../repositories";
import { teams, users } from "../schema";

interface SupportedProviderConfig {
  name: string; // Database name (e.g., "OpenAI")
  base_url: string; // API URL
  sync_name: string; // Lowercase name used in synced-models.json (e.g., "openai")
}

interface SupportedProvidersData {
  providers: SupportedProviderConfig[];
}

// Helper function to generate example tokens based on provider name
function generateExampleToken(providerName: string): string {
  const providerLower = providerName.toLowerCase();

  switch (providerLower) {
    case "openai":
      return "sk-example-openai-token-replace-with-real";
    case "anthropic":
      return "sk-ant-example-anthropic-token-replace-with-real";
    case "google":
      return "AIzaSy-example-google-token-replace-with-real";
    case "xai":
      return "xai-example-token-replace-with-real";
    default:
      return `${providerLower}-example-token-replace-with-real`;
  }
}

export async function seedAiStudio() {
  try {
    console.log("🌱 Starting AI Studio seed...");

    // =============================
    // AI Providers are now managed via JSON configuration
    // =============================
    console.log("⚠️  NOTICE: AI Providers are now managed via JSON configuration");
    console.log("   Providers are loaded from supported-providers.json");
    console.log("   No database seeding needed for providers");

    // =============================
    // 2. Create AI models
    // =============================
    // AI models seed has been removed.
    // From now on, models will be populated exclusively
    // through the Model Sync process in the admin interface.
    console.log("Skipping AI Models seed...");

    console.log("\n📊 Seed Summary:");
    console.log("   • AI Studio seed simplified - providers managed via JSON");

    console.log("\n✅ AI Studio seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during AI Studio seed:", error);
    throw error;
  }
}

export async function seedAiStudioWithTeam(teamId: string, userId?: string) {
  try {
    console.log(`🌱 Starting AI Studio seed for team ${teamId}...`);

    // Load providers from JSON configuration
    console.log("📋 Loading providers from JSON configuration...");
    
    // Load providers from supported-providers.json
    const workspaceRoot = process.cwd();
    const supportedProvidersPath = join(
      workspaceRoot,
      "packages",
      "api",
      "src",
      "internal",
      "services",
      "ai-model-sync-adapter",
      "config",
      "supported-providers.json",
    );

    let supportedProvidersData: { providers: Array<{ providerId: string; name: string; baseUrl: string }> };
    try {
      const supportedProvidersContent = readFileSync(
        supportedProvidersPath,
        "utf-8",
      );
      supportedProvidersData = JSON.parse(supportedProvidersContent);
    } catch (error) {
      console.error("❌ Failed to read supported-providers.json:", error);
      console.log("⚠️  No providers configuration found. Cannot create tokens.");
      return;
    }

    const providersResult = supportedProvidersData.providers;
    console.log(`📋 Found ${providersResult.length} providers from JSON configuration`);

    // Use the first user from the team if not specified
    let createdById = userId;
    if (!createdById) {
      const teamUsers = await db
        .select()
        .from(users)
        .innerJoin(teams, eq(teams.id, teamId))
        .limit(1);

      if (teamUsers.length > 0) {
        createdById = teamUsers[0]!.user.id;
      } else {
        console.log("⚠️  No user found for the team");
        return;
      }
    }

    // =============================
    // 1. Create example tokens
    // =============================
    console.log("Creating AI Provider Tokens...");

    // Generate example tokens dynamically based on available providers
    const tokenExamples = providersResult.map((provider) => ({
      providerName: provider.name,
      token: generateExampleToken(provider.name),
    }));

    let tokensCreated = 0;
    for (const tokenData of tokenExamples) {
      const provider = providersResult.find(
        (p) => p.name === tokenData.providerName,
      );
      if (provider) {
        try {
          // Check if token already exists
          const existingToken =
            await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
              teamId,
              provider.providerId,
            );

          if (!existingToken) {
            await aiStudioRepository.AiTeamProviderTokenRepository.create({
              teamId,
              providerId: provider.providerId,
              token: tokenData.token,
            });
            tokensCreated++;
            console.log(`✅ Token created for provider: ${provider.name}`);
          } else {
            console.log(
              `⚠️  Token already exists for provider: ${provider.name}`,
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.log(
            `⚠️  Error creating token for ${provider.name}: ${errorMessage}`,
          );
        }
      }
    }

    // =============================
    // 3. Create example AI libraries
    // =============================
    console.log("Creating AI Libraries...");

    const libraries = [
      {
        name: "Technical Library",
        files: {
          documents: [
            {
              name: "development-guide.md",
              type: "markdown",
              url: "https://example.com/docs/dev-guide.md",
              description: "Team development guide",
            },
            {
              name: "api-reference.json",
              type: "json",
              url: "https://example.com/docs/api.json",
              description: "API reference",
            },
          ],
        },
      },
      {
        name: "Knowledge Base",
        files: {
          documents: [
            {
              name: "faq.md",
              type: "markdown",
              url: "https://example.com/faq.md",
              description: "Frequently asked questions",
            },
          ],
        },
      },
    ];

    let librariesCreated = 0;
    for (const libraryData of libraries) {
      try {
        // Check if library with this name already exists
        const existingLibraries =
          await aiStudioRepository.AiLibraryRepository.findByTeam({
            teamId,
            busca: libraryData.name,
            limite: 1,
            offset: 0,
          });

        if (existingLibraries.length === 0) {
          await aiStudioRepository.AiLibraryRepository.create({
            ...libraryData,
            teamId: teamId,
          });
          librariesCreated++;
          console.log(`✅ Library created: ${libraryData.name}`);
        } else {
          console.log(`⚠️  Library already exists: ${libraryData.name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(
          `⚠️  Error creating library ${libraryData.name}: ${errorMessage}`,
        );
      }
    }

    // =============================
    // 4. Create example AI agents
    // =============================
    console.log("Creating AI Agents...");

    // Find a created library to associate
    const teamLibraries =
      await aiStudioRepository.AiLibraryRepository.findByTeam({
        teamId,
        limite: 1,
        offset: 0,
      });

    const agents = [
      {
        name: "Development Assistant",
        instructions:
          "You are an assistant specialized in software development. Help with code, debugging, architecture and best practices.",
        libraryId: teamLibraries[0]?.id,
      },
      {
        name: "Documentation Assistant",
        instructions:
          "You are an expert in creating and reviewing technical documentation. Help write clear and well-structured docs.",
        libraryId: teamLibraries[0]?.id,
      },
      {
        name: "General Assistant",
        instructions:
          "You are a general assistant that can help with various day-to-day team tasks.",
        libraryId: undefined, // No library
      },
    ];

    let agentsCreated = 0;
    for (const agentData of agents) {
      try {
        // Check if agent with this name already exists
        const existingAgents =
          await aiStudioRepository.AiAgentRepository.findByTeam({
            teamId,
            busca: agentData.name,
            limite: 1,
            offset: 0,
          });

        if (existingAgents.length === 0) {
          await aiStudioRepository.AiAgentRepository.create({
            ...agentData,
            teamId: teamId,
            createdById: createdById,
          });
          agentsCreated++;
          console.log(`✅ Agent created: ${agentData.name}`);
        } else {
          console.log(`⚠️  Agent already exists: ${agentData.name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(
          `⚠️  Error creating agent ${agentData.name}: ${errorMessage}`,
        );
      }
    }

    console.log(`📊 Summary for team ${teamId}:`);
    console.log(`   ✓ ${tokensCreated} tokens created`);
    console.log(`   ✓ ${librariesCreated} libraries created`);
    console.log(`   ✓ ${agentsCreated} agents created`);

    console.log("✅ AI Studio seed for team completed successfully!");
  } catch (error) {
    console.error(`❌ Error during AI Studio seed for team:`, error);
    throw error;
  }
}

// Execute seed when file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAiStudio()
    .then(() => {
      console.log("✅ Seed completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error during seed:", error);
      process.exit(1);
    });
}
