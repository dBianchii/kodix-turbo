import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Tipos para as mensagens
interface Message {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    console.log("🔵 [API] POST recebido");

    const { messages } = await req.json();
    console.log("🟢 [API] Mensagens recebidas:", messages);

    // Obtém a última mensagem do usuário
    const lastUserMessage =
      messages.filter((m: Message) => m.role === "user").pop()?.content || "";
    console.log("🟢 [API] Última mensagem do usuário:", lastUserMessage);

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

    console.log("✅ [API] OPENAI_API_KEY encontrada, processando...");

    try {
      // Usando a biblioteca AI.js para criar o stream
      const result = await streamText({
        model: openai("gpt-3.5-turbo"),
        messages: messages,
      });

      console.log("🟢 [API] Stream criado com sucesso");

      // Criando um stream legível para transmitir para o cliente
      const stream = new ReadableStream({
        async start(controller) {
          console.log("🟢 [API] Iniciando stream de resposta");
          try {
            // Verificar se houve resposta
            let receivedAnyChunk = false;

            // Iterando pelos chunks de texto do stream
            for await (const chunk of result.textStream) {
              receivedAnyChunk = true;
              // console.log("🟠 [API] Chunk sendo enviado:", chunk);

              // Encodando o chunk em bytes para o stream
              const encodedChunk = new TextEncoder().encode(chunk);
              controller.enqueue(encodedChunk);
            }

            // Se não recebeu nenhum chunk, informa erro de conexão
            if (!receivedAnyChunk) {
              controller.enqueue(
                new TextEncoder().encode(
                  "Sem conexão. Verifique sua internet e tente novamente.",
                ),
              );
            }

            console.log("🟢 [API] Stream completo, fechando controller");
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
    } catch (aiError: any) {
      console.error("🔴 [API] Erro ao criar stream com OpenAI:", aiError);
      return new Response("Erro de conexão com a OpenAI. Tente novamente.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error: any) {
    console.error("🔴 [API] Erro geral:", error);
    return new Response("Erro de conexão. Tente novamente.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
