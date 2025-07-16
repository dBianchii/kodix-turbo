import type { NextRequest } from "next/server";

import { auth } from "@kdx/auth";
import { chatRepository } from "@kdx/db/repositories";

export async function POST(request: NextRequest) {
  try {

    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.activeTeamId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;


    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Criar nova sessão usando o repository diretamente
    const chatSession = await chatRepository.ChatSessionRepository.create({
      title,
      teamId: session.user.activeTeamId,
      userId: session.user.id,
      aiModelId: "", // String vazia para usar modelo padrão
    });

    if (!chatSession) {
      throw new Error("Failed to create session");
    }


    return Response.json({
      id: chatSession.id,
      title: chatSession.title,
      createdAt: chatSession.createdAt,
    });
  } catch (error) {
    console.error("🔴 [API] Create session error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
