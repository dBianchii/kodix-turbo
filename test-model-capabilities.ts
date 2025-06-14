import { aiStudioRepository } from "./packages/db/src/repositories";

async function testModelCapabilities() {
  try {
    console.log("🧪 [TEST] Testando capacidades específicas dos modelos...");

    const teamId = "844j8on29mr3";

    const openaiToken =
      await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
        teamId,
        "svu4iq7hjeyn",
      );

    if (!openaiToken?.token) {
      console.log("❌ Token não encontrado!");
      return;
    }

    // Teste que distingue GPT-4o-mini do GPT-3.5
    const testPrompt = `Resolva esta operação matemática complexa e explique cada passo:
    
Calcule: (2^10 * 3^5) / (4^3 + 5^2) + √(169) - log₂(64)

Explique detalhadamente cada cálculo.`;

    // Testar GPT-4o-mini
    console.log("\n🎯 Testando GPT-4o-mini...");
    const response4o = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: testPrompt }],
          max_tokens: 500,
          temperature: 0.1,
        }),
      },
    );

    if (response4o.ok) {
      const result4o = await response4o.json();
      console.log("✅ GPT-4o-mini:");
      console.log(`   • Modelo retornado: ${result4o.model}`);
      console.log(
        `   • Resposta (primeiros 200 chars): ${result4o.choices[0]?.message?.content.substring(0, 200)}...`,
      );
      console.log(`   • Tokens usados: ${result4o.usage?.total_tokens}`);
    }

    // Testar GPT-3.5-turbo
    console.log("\n🔄 Testando GPT-3.5-turbo...");
    const response35 = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: testPrompt }],
          max_tokens: 500,
          temperature: 0.1,
        }),
      },
    );

    if (response35.ok) {
      const result35 = await response35.json();
      console.log("✅ GPT-3.5-turbo:");
      console.log(`   • Modelo retornado: ${result35.model}`);
      console.log(
        `   • Resposta (primeiros 200 chars): ${result35.choices[0]?.message?.content.substring(0, 200)}...`,
      );
      console.log(`   • Tokens usados: ${result35.usage?.total_tokens}`);
    }

    console.log("\n📊 Conclusão:");
    console.log("Se as respostas são diferentes em qualidade/abordagem,");
    console.log(
      "o modelo correto está sendo usado, mesmo que ele não saiba sua própria identidade.",
    );
  } catch (error) {
    console.error("❌ [TEST] Erro:", error);
  }
}

testModelCapabilities();
