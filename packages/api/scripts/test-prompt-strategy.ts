#!/usr/bin/env tsx

import "dotenv/config";

import { AiStudioService } from "../src/internal/services/ai-studio.service";

async function testStrategy() {
  console.log("🧪 Iniciando teste de estratégia de prompt...");

  // --- PARÂMETROS DE TESTE (Modifique aqui) ---
  const modelToTest = {
    universalModelId: "o1-mini",
    providerName: "OpenAI",
  };

  const mockData = {
    agentName: "Agente de Teste",
    agentInstructions: "Você é um agente de teste amigável e direto.",
    baseInstructions: "Contexto geral da plataforma que deve ser mantido.",
    previousAgentName: "Agente Antigo",
  };
  // -----------------------------------------

  try {
    console.log(
      `\n🔵 Testando modelo: ${modelToTest.universalModelId} (${modelToTest.providerName})`,
    );

    // Chama o método que constrói o prompt
    const generatedPrompt = AiStudioService.buildAgentSwitchPrompt({
      ...mockData,
      ...modelToTest,
    });

    console.log("\n✅ PROMPT GERADO COM SUCESSO:\n");
    console.log("-------------------------------------------");
    console.log(generatedPrompt);
    console.log("-------------------------------------------\n");
    console.log("✨ Teste concluído. Analise o prompt acima.");
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error);
    process.exit(1);
  }
}

testStrategy()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
