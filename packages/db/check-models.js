import { aiStudioRepository } from "./src/repositories/index.js";

async function checkModels() {
  try {
    const models = await aiStudioRepository.AiModelRepository.findMany({});
    console.log("Models found:", models.length);
    models.forEach((m) => {
      console.log(
        `- ${m.modelId} (Provider: ${m.provider?.name || "N/A"})`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkModels();
