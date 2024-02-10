import type { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

import { env } from "~/env";
import { CorsOptions } from "../_enableCors";

//export const runtime = "edge";

const config = new Configuration({
  apiKey: env.STAYS_OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(1, "1 m"),
//   analytics: true,
// });

export async function POST(req: NextRequest) {
  //rate limit based on ip
  //const { success } = await ratelimit.limit(req.ip ?? "127.0.0.1");
  //if (!success) return new Response("Too many requests", { status: 429 });

  const request = (await req.json()) as {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
    mode: "title" | "description";
  };

  request.messages = request.messages
    .filter((x) => x.role === "user")
    .slice(-1);
  request.messages.unshift({
    role: "system",
    content: `Você é um assistente que foi feito para me auxiliar com anúncios de aluguéis de temporada. Você foi feito para me ajudar a gerar ${modeToText(
      request.mode,
    )} de anúncios. Em nenhuma hipótese você vai responder qualquer pergunta que não seja relacionada a aluguéis de temporada. APENAS RESPONDA PERGUNTAS SOBRE ALUGUÉIS DE TEMPORADA!! Responda em markdown.`,
  });

  const formattedMessages = request.messages.map((x) => {
    if (x.role === "user") {
      x.content =
        `Gere ${
          request.mode === "title"
            ? "3 títulos atrativos"
            : "uma descrição curta atrativa"
        } em markdown para o meu aluguel de temporada utilizando estes pontos:` +
        x.content
          .split("<&&>")
          .map((tag: string) => `\n ${tag}`)
          .join("");
    }
    return x;
  });

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: formattedMessages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);

  function modeToText(mode: "title" | "description") {
    switch (mode) {
      case "title":
        return "título";
      case "description":
        return "descrição";
    }
  }
}

export function OPTIONS() {
  return CorsOptions();
}
