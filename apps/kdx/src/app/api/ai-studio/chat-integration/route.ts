import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@kdx/auth";
import { aiStudioRepository } from "@kdx/db/repositories";

/**
 * Endpoints HTTP dedicados para integração Chat <-> AI Studio
 * Mantém isolamento entre subapps via HTTP calls
 *
 * ARQUITETURA: Usa userId para validação, cada SubApp resolve seu contexto de team
 * AUTENTICAÇÃO: Suporta sessão de navegador OU token interno para server-to-server
 */

export async function GET(request: NextRequest) {
  try {
    let userId: string;
    let teamId: string;

    // Verificar se é chamada interna com token
    const internalToken = request.headers.get("x-internal-token");
    const expectedToken =
      process.env.KODIX_INTERNAL_API_TOKEN || "dev-internal-token-123"; // ✅ Fallback for dev
    const isInternalCall = internalToken === expectedToken;

    if (isInternalCall) {
      // ✅ Autenticação interna - usar userId dos query params
      const requestedUserId = new URL(request.url).searchParams.get("userId");
      if (!requestedUserId) {
        console.error("❌ [AI_STUDIO_API] Missing userId in internal request");
        return NextResponse.json(
          {
            success: false,
            error: "userId is required for internal requests",
          },
          { status: 400 },
        );
      }

      // Para chamadas internas, buscar team do usuário diretamente
      // TODO: Implementar busca de activeTeamId do usuário
      // Por enquanto, usar teamId da query se disponível
      const requestedTeamId = new URL(request.url).searchParams.get("teamId");
      if (!requestedTeamId) {
        console.error("❌ [AI_STUDIO_API] Missing teamId in internal request");
        return NextResponse.json(
          {
            success: false,
            error: "teamId is required for internal requests",
          },
          { status: 400 },
        );
      }

      userId = requestedUserId;
      teamId = requestedTeamId;

      console.log(
        `🔑 [AI_STUDIO_API] Internal authentication: user: ${userId} | team: ${teamId}`,
      );
    } else {
      // ✅ Autenticação normal via sessão
      const session = await auth();
      if (!session.user?.id || !session.user.activeTeamId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const requestedUserId = new URL(request.url).searchParams.get("userId");

      // Validation: userId must match authenticated user
      if (requestedUserId && requestedUserId !== session.user.id) {
        console.error("❌ [AI_STUDIO_API] UserId mismatch:", {
          requested: requestedUserId,
          authenticated: session.user.id,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Invalid userId - authentication mismatch",
          },
          { status: 403 },
        );
      }

      userId = session.user.id;
      teamId = session.user.activeTeamId;

      console.log(
        `🔐 [AI_STUDIO_API] Session authentication: user: ${userId} | team: ${teamId}`,
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const modelId = searchParams.get("modelId");
    const providerId = searchParams.get("providerId");

    console.log(
      `🔄 [AI_STUDIO_API] Cross-SubApp request: ${action} | user: ${userId} | team: ${teamId}`,
    );

    switch (action) {
      case "getModel": {
        if (!modelId) {
          return NextResponse.json(
            { error: "modelId required" },
            { status: 400 },
          );
        }

        const model =
          await aiStudioRepository.AiModelRepository.findById(modelId);
        if (!model) {
          return NextResponse.json(
            { error: "Model not found" },
            { status: 404 },
          );
        }

        console.log(
          `✅ [AI_STUDIO_API] Model found: ${model.name} for team: ${teamId}`,
        );
        return NextResponse.json({
          success: true,
          data: model,
        });
      }

      case "getDefaultModel": {
        const defaultModel =
          await aiStudioRepository.AiTeamModelConfigRepository.getDefaultModel(
            teamId,
          );

        if (!defaultModel) {
          console.log(
            `⚠️ [AI_STUDIO_API] No default model found for team: ${teamId}`,
          );
          return NextResponse.json(
            {
              success: false,
              error: "No default model configured for this team",
            },
            { status: 412 },
          );
        }

        console.log(
          `✅ [AI_STUDIO_API] Default model found for team ${teamId}:`,
          defaultModel.model.name,
        );
        return NextResponse.json({
          success: true,
          data: defaultModel,
        });
      }

      case "getAvailableModels": {
        const availableModels =
          await aiStudioRepository.AiTeamModelConfigRepository.findAvailableModelsByTeam(
            teamId,
          );

        console.log(
          `✅ [AI_STUDIO_API] Found ${availableModels.length} available models for team: ${teamId}`,
        );
        return NextResponse.json({
          success: true,
          data: availableModels,
        });
      }

      case "getProviderToken": {
        if (!providerId) {
          return NextResponse.json(
            { error: "providerId required" },
            { status: 400 },
          );
        }

        const token =
          await aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
            teamId,
            providerId,
          );

        if (!token) {
          console.log(
            `⚠️ [AI_STUDIO_API] No token found for provider ${providerId} and team: ${teamId}`,
          );
          return NextResponse.json(
            {
              success: false,
              error: `No token configured for provider ${providerId}`,
            },
            { status: 412 },
          );
        }

        console.log(
          `✅ [AI_STUDIO_API] Token found for provider ${providerId} and team: ${teamId}`,
        );
        return NextResponse.json({
          success: true,
          data: token,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ [AI_STUDIO_API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
