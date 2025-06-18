# Migração Vercel AI SDK - Subetapas Testáveis

## 🎯 Filosofia das Subetapas

Cada subetapa é:

- ✅ **Independente** - Pode ser testada isoladamente
- ✅ **Reversível** - Pode ser desfeita sem impacto
- ✅ **Validável** - Tem critérios claros de sucesso
- ✅ **Incremental** - Cada etapa adiciona valor sem quebrar

---

## 📋 **SUBETAPA 1: Setup e Preparação** ✅ **CONCLUÍDA**

### **🎯 Objetivo**

Instalar dependências e criar estrutura base **sem tocar no sistema atual**.

### **📦 1.1 - Instalar Dependências** ✅

```bash
# No root do projeto
pnpm add -w ai @ai-sdk/openai @ai-sdk/anthropic

# Verificar se não quebrou nada
pnpm typecheck  # ✅ PASSOU SEM ERROS
```

**✅ Critério de Sucesso:**

- ✅ TypeScript compila sem erros
- ✅ Dependências instaladas corretamente
- ✅ Sistema atual não foi afetado

### **📁 1.2 - Criar Estrutura Base** ✅

```bash
# Criar pasta para adapters
mkdir -p packages/api/src/internal/adapters
mkdir -p packages/api/src/internal/types/ai
```

**Arquivos criados:**

```typescript
// packages/api/src/internal/types/ai/vercel-adapter.types.ts ✅ CRIADO
export interface ChatStreamParams {
  chatSessionId: string;
  content: string;
  modelId: string;
  teamId: string;
  messages: Array<{
    senderRole: "user" | "ai";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
}

export interface ChatStreamResponse {
  stream: ReadableStream;
  metadata: {
    model?: string;
    usage?: any;
    finishReason?: string;
  };
}
```

**✅ Critério de Sucesso:**

- ✅ Arquivos criados
- ✅ Tipos compilam sem erros
- ✅ Imports funcionam

### **🧪 1.3 - Teste de Importação** ✅

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.test.ts ✅ CRIADO
import { describe, expect, test } from "vitest";

describe("Vercel AI SDK Setup", () => {
  test("should import ai package without errors", async () => {
    const ai = await import("ai");
    expect(ai.streamText).toBeDefined();
    expect(ai.generateObject).toBeDefined();
  });

  test("should import openai provider without errors", async () => {
    const openaiProvider = await import("@ai-sdk/openai");
    expect(openaiProvider.openai).toBeDefined();
  });

  test("should import anthropic provider without errors", async () => {
    const anthropicProvider = await import("@ai-sdk/anthropic");
    expect(anthropicProvider.anthropic).toBeDefined();
  });
});
```

**✅ Critério de Sucesso:**

- ✅ Testes passam (3/3 tests passed)
- ✅ Imports funcionam perfeitamente
- ✅ Nenhum erro de dependência

**🎉 RESULTADO SUBETAPA 1:**

- ✅ Vercel AI SDK instalado com sucesso
- ✅ Estrutura de pastas criada
- ✅ Tipos definidos e compilando
- ✅ Testes de importação passando
- ✅ Sistema atual 100% preservado

---

## 🏗️ **SUBETAPA 2: Adapter Base (Sem Usar Ainda)**

### **🎯 Objetivo**

Criar adapter básico **sem integrar** com sistema atual.

### **🔧 2.1 - Adapter Skeleton**

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.ts
import type {
  ChatStreamParams,
  ChatStreamResponse,
} from "../types/ai/vercel-adapter.types";

export class VercelAIAdapter {
  /**
   * PLACEHOLDER: Adapter que apenas simula funcionamento
   * NÃO USA VERCEL AI SDK AINDA - apenas estrutura
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    // Por enquanto, apenas retorna um stream mock
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Mock adapter working!"));
        controller.close();
      },
    });

    return {
      stream,
      metadata: {
        model: "mock-model",
        usage: null,
        finishReason: "stop",
      },
    };
  }

  // Métodos privados como placeholders
  private adaptInputParams(params: ChatStreamParams) {
    return {
      messages: params.messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
    };
  }

  private async getVercelModel(modelId: string, teamId: string) {
    // PLACEHOLDER - não faz nada ainda
    return null;
  }
}
```

### **🧪 2.2 - Teste do Adapter**

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.test.ts
import { describe, expect, test } from "vitest";

import { VercelAIAdapter } from "./vercel-ai-adapter";

describe("VercelAIAdapter", () => {
  test("should create adapter instance", () => {
    const adapter = new VercelAIAdapter();
    expect(adapter).toBeInstanceOf(VercelAIAdapter);
  });

  test("should return mock stream response", async () => {
    const adapter = new VercelAIAdapter();
    const params = {
      chatSessionId: "test-session",
      content: "test message",
      modelId: "test-model",
      teamId: "test-team",
      messages: [{ senderRole: "user" as const, content: "test" }],
    };

    const result = await adapter.streamResponse(params);

    expect(result.stream).toBeInstanceOf(ReadableStream);
    expect(result.metadata.model).toBe("mock-model");
  });
});
```

**✅ Critério de Sucesso:**

- Adapter instancia sem erros
- Métodos funcionam
- Testes passam
- Nenhum side effect no sistema atual

---

## 🔌 **SUBETAPA 3: Integração Opcional (Com Feature Flag)**

### **🎯 Objetivo**

Integrar adapter ao ChatService **mas manter sistema atual como padrão**.

### **🚀 3.1 - Feature Flag**

```typescript
// packages/api/src/internal/config/feature-flags.ts
export const FEATURE_FLAGS = {
  VERCEL_AI_ADAPTER: process.env.ENABLE_VERCEL_AI_ADAPTER === "true",
} as const;
```

### **🔧 3.2 - Integração com Feature Flag**

```typescript
// packages/api/src/internal/services/chat.service.ts

import { VercelAIAdapter } from "../adapters/vercel-ai-adapter";
import { FEATURE_FLAGS } from "../config/feature-flags";

export class ChatService {
  private static vercelAdapter = new VercelAIAdapter();

  // MÉTODO NOVO - mas não usado ainda
  static async streamResponseWithAdapter(params: any) {
    if (!FEATURE_FLAGS.VERCEL_AI_ADAPTER) {
      throw new Error("Vercel AI Adapter not enabled");
    }

    console.log("🧪 [EXPERIMENTAL] Using Vercel AI Adapter");
    return await this.vercelAdapter.streamResponse(params);
  }

  // MÉTODO ATUAL - permanece inalterado
  static async streamResponse(params: any) {
    // Sistema atual - NENHUMA MUDANÇA
    return this.currentStreamingImplementation(params);
  }

  // Sistema atual preservado
  private static async currentStreamingImplementation(params: any) {
    // ... código atual sem mudanças ...
  }
}
```

### **🧪 3.3 - Teste Isolado**

```typescript
// Teste manual via endpoint separado (NÃO SUBSTITUI o atual)
// apps/kdx/src/app/api/chat/test-adapter/route.ts
export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing Vercel AI Adapter (experimental endpoint)");

    const params = await request.json();
    const result = await ChatService.streamResponseWithAdapter(params);

    return new Response(result.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Adapter-Test": "true",
      },
    });
  } catch (error) {
    return new Response(`Adapter test failed: ${error.message}`, {
      status: 500,
    });
  }
}
```

**✅ Critério de Sucesso:**

- Feature flag funciona
- Endpoint de teste retorna mock response
- Sistema atual **não é afetado**
- Pode ativar/desativar via env var

---

## 🎯 **SUBETAPA 4: Implementação Real do Vercel AI SDK**

### **🎯 Objetivo**

Fazer adapter **realmente usar** Vercel AI SDK, mas ainda via feature flag.

### **🔧 4.1 - Adapter Real**

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.ts

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

import { AiStudioService } from "../services/ai-studio.service";

export class VercelAIAdapter {
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    try {
      // 1. Converter parâmetros
      const vercelParams = this.adaptInputParams(params);

      // 2. Obter modelo configurado
      const model = await this.getVercelModel(params.modelId, params.teamId);

      // 3. USAR VERCEL AI SDK PELA PRIMEIRA VEZ
      const result = await streamText({
        model,
        messages: vercelParams.messages,
        temperature: vercelParams.temperature,
        maxTokens: vercelParams.maxTokens,
      });

      // 4. Adaptar resposta
      return this.adaptResponse(result);
    } catch (error) {
      console.error("🔴 Vercel AI SDK Error:", error);
      throw error; // Re-throw para fallback funcionar
    }
  }

  private async getVercelModel(modelId: string, teamId: string) {
    const modelConfig = await AiStudioService.getModelConfig(modelId, teamId);
    const providerToken = await AiStudioService.getProviderToken(
      modelConfig.providerId,
      teamId,
    );

    switch (modelConfig.provider.name.toLowerCase()) {
      case "openai":
        return openai(modelConfig.name, {
          apiKey: providerToken.token,
          baseURL: modelConfig.provider.baseUrl,
        });

      case "anthropic":
        return anthropic(modelConfig.name, {
          apiKey: providerToken.token,
        });

      default:
        throw new Error(
          `Provider ${modelConfig.provider.name} not supported yet`,
        );
    }
  }

  private adaptResponse(vercelResult: any): ChatStreamResponse {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of vercelResult.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return {
      stream,
      metadata: {
        model: vercelResult.response?.modelId,
        usage: vercelResult.usage,
        finishReason: vercelResult.finishReason,
      },
    };
  }
}
```

### **🧪 4.2 - Teste Real**

```bash
# Ativar feature flag para teste
export ENABLE_VERCEL_AI_ADAPTER=true

# Testar endpoint experimental
curl -X POST http://localhost:3000/api/chat/test-adapter \
  -H "Content-Type: application/json" \
  -d '{
    "chatSessionId": "test-session",
    "content": "Hello, world!",
    "modelId": "existing-model-id",
    "teamId": "existing-team-id",
    "messages": []
  }'
```

**✅ Critério de Sucesso:**

- Recebe resposta real do Vercel AI SDK
- Stream funciona corretamente
- Metadata é retornada
- Erros são capturados

---

## 🔄 **SUBETAPA 5: Fallback Automático**

### **🎯 Objetivo**

Adicionar fallback automático para sistema atual se adapter falhar.

### **🔧 5.1 - ChatService com Fallback**

```typescript
// packages/api/src/internal/services/chat.service.ts

export class ChatService {
  static async streamResponseSafe(params: ChatStreamParams) {
    if (FEATURE_FLAGS.VERCEL_AI_ADAPTER) {
      try {
        console.log("🔄 Trying Vercel AI Adapter...");
        const result = await this.vercelAdapter.streamResponse(params);
        console.log("✅ Vercel AI Adapter succeeded");
        return result;
      } catch (error) {
        console.warn(
          "⚠️ Vercel AI Adapter failed, falling back to current system",
          error,
        );
        // FALLBACK AUTOMÁTICO
        return await this.streamResponseCurrent(params);
      }
    } else {
      // Feature flag desabilitada - usar sistema atual
      return await this.streamResponseCurrent(params);
    }
  }
}
```

### **🧪 5.2 - Teste de Fallback**

```typescript
describe("ChatService Fallback", () => {
  test("should fallback to current system when adapter fails", async () => {
    // Simular falha do adapter
    jest
      .spyOn(VercelAIAdapter.prototype, "streamResponse")
      .mockRejectedValue(new Error("SDK failed"));

    const result = await ChatService.streamResponseSafe(testParams);

    // Deve retornar resultado do sistema atual
    expect(result).toBeDefined();
    expect(result.metadata.source).toBe("current-system");
  });
});
```

**✅ Critério de Sucesso:**

- Fallback funciona automaticamente
- Não há downtime se adapter falha
- Logs indicarem tentativa e fallback

---

## ✅ **SUBETAPA 6: Substitição Gradual (Opcional)**

### **🎯 Objetivo**

**APENAS SE TUDO ESTIVER FUNCIONANDO**, substituir sistema atual gradualmente.

### **🔧 6.1 - Endpoint Principal (Opcional)**

```typescript
// apps/kdx/src/app/api/chat/stream/route.ts

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();

    // USAR NOVO MÉTODO COM FALLBACK AUTOMÁTICO
    const streamResponse = await ChatService.streamResponseSafe(params);

    return new Response(streamResponse.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("🔴 [API] Erro no streaming:", error);
    return new Response("Erro de conexão. Tente novamente.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
```

**✅ Critério de Sucesso:**

- Sistema funciona igual ao anterior
- Benefícios do Vercel AI SDK (quando habilitado)
- Fallback automático garante confiabilidade

---

## 📊 **CRONOGRAMA SUGERIDO**

### **Semana 1: Subetapas 1-2**

- Setup e estrutura base
- Adapter skeleton
- Testes básicos

### **Semana 2: Subetapa 3**

- Feature flag
- Integração experimental
- Endpoint de teste

### **Semana 3: Subetapa 4**

- Implementação real do SDK
- Testes extensivos
- Validação

### **Semana 4: Subetapa 5**

- Fallback automático
- Monitoramento
- Ajustes finais

### **Semana 5: Subetapa 6 (Se aprovado)**

- Substituição gradual
- Monitoramento intensivo
- Documentação final

---

## 🚨 **PONTOS DE PARADA**

### **⛔ Pare se:**

- Qualquer subetapa quebrar sistema atual
- Testes falharem consistentemente
- Performance degradar significativamente
- Erros aumentarem

### **✅ Continue se:**

- Todos os testes passarem
- Sistema atual permanecer funcionando
- Logs indicarem funcionamento correto
- Performance mantiver igual ou melhor

---

## 🎯 **PRÓXIMOS PASSOS**

**Qual subetapa quer começar?**

1. **Subetapa 1** - Setup básico (sem risco)
2. **Todas de uma vez** - Se confiante
3. **Customizar plano** - Ajustar cronograma

**Posso ajudar implementando qualquer subetapa específica!** 🚀
