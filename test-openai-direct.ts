import { aiStudioRepository } from "./packages/db/src/repositories";

async function testOpenAIDirect() {
  try {
    console.log("🧪 [TEST] Testando acesso direto à API OpenAI...");

    const teamId = "844j8on29mr3"; // Team ID correto

    // Buscar token da OpenAI
    const openaiToken =
      await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
        teamId,
        "svu4iq7hjeyn", // Provider ID da OpenAI
      );

    if (!openaiToken?.token) {
      console.log("❌ Token da OpenAI não encontrado!");
      return;
    }

    console.log("✅ Token da OpenAI encontrado");

    // Testar gpt-4o-mini
    console.log("\n🎯 Testando gpt-4o-mini...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content:
              "Qual modelo você é? Responda apenas o nome do modelo que você está usando.",
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    console.log(`📊 Status da resposta: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erro da API: ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log("✅ Resposta da API:");
    console.log(`   • Modelo usado: ${result.model}`);
    console.log(`   • Resposta: ${result.choices[0]?.message?.content}`);
    console.log(`   • Usage:`, result.usage);

    // Testar também gpt-3.5-turbo para comparar
    console.log("\n🔄 Comparando com gpt-3.5-turbo...");

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
          messages: [
            {
              role: "user",
              content:
                "Qual modelo você é? Responda apenas o nome do modelo que você está usando.",
            },
          ],
          max_tokens: 50,
          temperature: 0.1,
        }),
      },
    );

    if (response35.ok) {
      const result35 = await response35.json();
      console.log("✅ Resposta do GPT-3.5:");
      console.log(`   • Modelo usado: ${result35.model}`);
      console.log(`   • Resposta: ${result35.choices[0]?.message?.content}`);
    }
  } catch (error) {
    console.error("❌ [TEST] Erro:", error);
  }
}

testOpenAIDirect();
