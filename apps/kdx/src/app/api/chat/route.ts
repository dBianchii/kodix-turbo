import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Tipos para as mensagens
interface Message {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  try {

    const { messages } = await req.json();

    // Obtém a última mensagem do usuário
    const lastUserMessage =
      messages.filter((m: Message) => m.role === "user").pop()?.content || "";

    // Verificando a chave da API
    const apiKey = process.env.OPENAI_API_KEY;
    if (
      !apiKey ||
      apiKey === "sk-sua-chave-aqui" ||
      apiKey.startsWith("sk-sua")
    ) {
      console.error("❌ [API] OPENAI_API_KEY não encontrada ou inválida");
      return new Response(
        "Erro de configuração: Chave da API OpenAI não configurada.",
        {
          status: 500,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        },
      );
    }


    try {
      // Usando a biblioteca AI.js para criar o stream
      const result = await streamText({
        model: openai("gpt-3.5-turbo"),
        messages,
      });


      // Criando um stream legível para transmitir para o cliente
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Verificar se houve resposta
            let receivedAnyChunk = false;

            // Iterando pelos chunks de texto do stream
            for await (const chunk of result.textStream) {
              receivedAnyChunk = true;

              // Encodando o chunk em bytes para o stream
              const encodedChunk = new TextEncoder().encode(chunk);
              controller.enqueue(encodedChunk);
            }

            // Se não recebeu nenhum chunk, informa erro de conexão
            if (!receivedAnyChunk) {
              //console.error("❌ [API] Nenhum chunk recebido");
              controller.enqueue(
                new TextEncoder().encode(
                  "Sem conexão. Verifique sua internet e tente novamente.",
                ),
              );
            }

            controller.close();
          } catch (streamError) {
            console.error("🔴 [API] Erro no streaming:", streamError);
            controller.enqueue(
              new TextEncoder().encode("Erro de conexão. Tente novamente."),
            );
            controller.close();
          }
        },
      });

      // Retornando a resposta como stream
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    } catch (aiError: unknown) {
      console.error("🔴 [API] Erro ao criar stream com OpenAI:", aiError);
      const errorMessage = aiError instanceof Error ? aiError.message : "Unknown error";
      return new Response(`Erro de conexão com a OpenAI: ${errorMessage}`, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error: unknown) {
    console.error("🔴 [API] Erro geral:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Erro de conexão: ${errorMessage}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
