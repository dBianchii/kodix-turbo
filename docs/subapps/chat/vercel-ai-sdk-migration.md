# Migração para Vercel AI SDK - Chat SubApp

## 🎯 Visão Geral

Este documento detalha a estratégia de migração do sistema de chat atual para o **Vercel AI SDK**, utilizando uma abordagem de **Adapter Transparente** que preserva 100% das funcionalidades existentes e permite uma transição ultra-segura.

## 🛡️ Estratégia: Adapter Transparente (Bridge & Remove)

### Filosofia

- **Preservar 100%** das funcionalidades atuais
- **Migração ultra-segura** sem perda de features
- **Interface externa inalterada** para usuários
- **Benefícios internos imediatos** do Vercel AI SDK
- **Remoção opcional** do adapter no futuro

### Abordagem em Duas Fases

#### 🔄 **Fase 1: Adapter Transparente (Implementação Segura)**

- Criar camada de adaptação que usa Vercel AI SDK internamente
- Manter interface idêntica ao sistema atual
- Migração invisível para usuários finais
- Preservação total de funcionalidades

#### 🚀 **Fase 2: Remoção Opcional (Futuro)**

- Quando confiante, pode remover adapter
- Usar Vercel AI SDK diretamente
- Fase opcional - adapter pode permanecer permanentemente

## 🏗️ Arquitetura Proposta

### Sistema Atual

```
Frontend → tRPC → Custom Streaming → OpenAI API → Custom Response Processing
```

### Sistema com Adapter (Fase 1)

```
Frontend → tRPC → Adapter Layer → Vercel AI SDK → Provider APIs → Response Adaptation
```

### Sistema Futuro Opcional (Fase 2)

```
Frontend → tRPC → Vercel AI SDK Direto → Provider APIs
```

## 📋 Status da Implementação

### ✅ **Subetapas Concluídas:**

1. **✅ Subetapa 1: Setup e Preparação** - Vercel AI SDK instalado e estrutura criada
2. **✅ Subetapa 2: Adapter Base** - Adapter skeleton funcionando com mock
3. **✅ Subetapa 3: Integração Opcional** - Feature flag, ChatService expandido e endpoint experimental

### 🔄 **Próximas Subetapas:**

4. **🔄 Subetapa 4: Implementação Real** - Fazer adapter usar Vercel AI SDK de verdade
5. **⏳ Subetapa 5: Fallback Automático** - Sistema de fallback para máxima confiabilidade
6. **⏳ Subetapa 6: Substituição Gradual** - Migração opcional do sistema principal

---

## 📋 Implementação Detalhada

### 1. Adapter Principal

```typescript
// packages/api/src/internal/adapters/vercel-ai-adapter.ts

import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";

import type { ChatStreamParams, ChatStreamResponse } from "../types";

export class VercelAIAdapter {
  /**
   * Adapta streaming atual para usar Vercel AI SDK
   */
  async streamResponse(params: ChatStreamParams): Promise<ChatStreamResponse> {
    // 1. Converter parâmetros para formato Vercel AI SDK
    const vercelParams = this.adaptInputParams(params);

    // 2. Obter modelo configurado
    const model = await this.getVercelModel(params.modelId, params.teamId);

    // 3. Executar streaming com Vercel AI SDK
    const result = await streamText({
      model,
      messages: vercelParams.messages,
      temperature: vercelParams.temperature,
      maxTokens: vercelParams.maxTokens,
      tools: vercelParams.tools, // Nova capacidade!
    });

    // 4. Adaptar resposta para formato atual
    return this.adaptResponse(result);
  }

  /**
   * Converte parâmetros atuais para Vercel AI SDK
   */
  private adaptInputParams(params: ChatStreamParams) {
    return {
      messages: params.messages.map((msg) => ({
        role: msg.senderRole === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 4000,
      tools: params.tools || undefined,
    };
  }

  /**
   * Mapeia modelos do AI Studio para Vercel AI SDK
   */
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

      // Adicionar outros providers...
      default:
        throw new Error(
          `Provider ${modelConfig.provider.name} not supported yet`,
        );
    }
  }

  /**
   * Adapta resposta do Vercel AI SDK para formato atual
   */
  private adaptResponse(vercelResult: any): ChatStreamResponse {
    // Converter stream do Vercel AI SDK para formato atual
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of vercelResult.textStream) {
            // Manter formato atual de resposta
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

### 2. Integração no Service Layer

```typescript
// packages/api/src/internal/services/chat.service.ts

import { VercelAIAdapter } from "../adapters/vercel-ai-adapter";

export class ChatService {
  private static vercelAdapter = new VercelAIAdapter();

  /**
   * Streaming principal - agora usa Vercel AI SDK via adapter
   */
  static async streamResponse(params: ChatStreamParams) {
    try {
      // Usar adapter do Vercel AI SDK
      return await this.vercelAdapter.streamResponse(params);
    } catch (error) {
      console.error(
        "Vercel AI SDK failed, falling back to current system",
        error,
      );

      // Fallback para sistema atual (segurança extra)
      return await this.streamResponseCurrent(params);
    }
  }

  /**
   * Sistema atual preservado como fallback
   */
  static async streamResponseCurrent(params: ChatStreamParams) {
    // Implementação atual mantida intacta
    // ...código atual...
  }
}
```

### 3. Endpoint de API Atualizado

```typescript
// apps/kdx/src/app/api/chat/stream/route.ts

export async function POST(request: NextRequest) {
  try {
    const { chatSessionId, content, modelId } = await request.json();

    // Sistema atual de validação mantido
    const session = await ChatService.findSessionById(chatSessionId);

    // Criar mensagem do usuário (processo atual mantido)
    const userMessage = await ChatService.createMessage({
      chatSessionId: session.id,
      senderRole: "user",
      content,
      status: "ok",
    });

    // MUDANÇA: Usar adapter do Vercel AI SDK
    const streamResponse = await ChatService.streamResponse({
      chatSessionId,
      content,
      modelId: session.aiModelId,
      teamId: session.teamId,
      messages: await ChatService.getSessionMessages(chatSessionId),
    });

    // Resposta no formato atual (unchanged)
    return new Response(streamResponse.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    // Error handling atual mantido
    console.error("🔴 [API] Erro no streaming:", error);
    return new Response("Erro de conexão. Tente novamente.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
```

## 🎉 Benefícios Imediatos

### Para o Sistema

- ✅ **Compatibilidade Universal**: Suporte automático para todos os providers
- ✅ **Tool Calling**: Capacidade de usar ferramentas imediatamente
- ✅ **Structured Objects**: Geração de objetos estruturados
- ✅ **Error Handling**: Sistema robusto de tratamento de erros
- ✅ **Performance**: Otimizações automáticas do SDK

### Para Desenvolvedores

- ✅ **Código Mais Limpo**: Menos lógica custom de streaming
- ✅ **Manutenção Reduzida**: SDK mantido pela Vercel
- ✅ **Features Futuras**: Updates automáticos de capacidades
- ✅ **Debugging**: Ferramentas superiores de debug

### Para Usuários

- ✅ **Zero Impacto**: Interface idêntica
- ✅ **Melhor Confiabilidade**: SDK battle-tested
- ✅ **Features Novas**: Tool calling, structured responses
- ✅ **Performance**: Streaming otimizado

## 📅 Cronograma de Implementação

### **Sprint 1-2: Setup e Fundação**

- [ ] Instalar dependências do Vercel AI SDK
- [ ] Criar estrutura base do adapter
- [ ] Implementar mapeamento básico de providers
- [ ] Testes unitários do adapter

### **Sprint 3-4: Implementação Core**

- [ ] Adapter completo para OpenAI e Anthropic
- [ ] Integração com sistema atual de tokens
- [ ] Fallback para sistema atual
- [ ] Testes de integração

### **Sprint 5-6: Deploy e Validação**

- [ ] Deploy em ambiente de staging
- [ ] Testes extensivos lado-a-lado
- [ ] Monitoramento de performance
- [ ] Ajustes finais

### **Sprint 7-8: Produção**

- [ ] Deploy gradual em produção
- [ ] Feature flag para rollback rápido
- [ ] Monitoramento intensivo
- [ ] Documentação final

## 🔬 Plano de Testes

### Testes de Compatibilidade

```typescript
describe("VercelAIAdapter Compatibility", () => {
  test("should produce identical output to current system", async () => {
    const testParams = {
      /* params padrão */
    };

    const currentResult = await ChatService.streamResponseCurrent(testParams);
    const adapterResult = await ChatService.streamResponse(testParams);

    expect(adapterResult.format).toEqual(currentResult.format);
    expect(adapterResult.metadata).toMatchStructure(currentResult.metadata);
  });
});
```

### Testes de Performance

- Latência de primeira resposta
- Throughput de streaming
- Uso de memória
- Tempo de conexão

### Testes de Funcionalidade

- Todos os providers suportados
- Diferentes tipos de mensagem
- Error scenarios
- Fallback automático

## 🚨 Pontos de Atenção

### Potenciais Desafios

1. **Mapeamento de Parâmetros**: Cada provider pode ter nuances
2. **Format Differences**: Respostas podem ter formatos ligeiramente diferentes
3. **Error Handling**: Mapear erros do SDK para formato atual
4. **Performance**: Verificar se não há degradação

### Mitigações

1. **Testes Extensivos**: Validação lado-a-lado
2. **Fallback Automático**: Sistema atual como backup
3. **Monitoramento**: Métricas detalhadas
4. **Feature Flags**: Rollback rápido se necessário

## 🔮 Futuro: Fase 2 (Opcional)

### Quando Considerar Remoção do Adapter

- ✅ Adapter funcionando perfeitamente por 3+ meses
- ✅ Time completamente familiarizado com Vercel AI SDK
- ✅ Benefícios de performance justificam mudança
- ✅ Features específicas do SDK são necessárias

### Implementação da Fase 2

```typescript
// Futuro: Remoção do adapter
export async function POST(request: NextRequest) {
  // Uso direto do Vercel AI SDK
  const result = await streamText({
    model: openai(modelId),
    messages: formattedMessages,
    tools: availableTools, // Features avançadas
  });

  return result.toDataStreamResponse();
}
```

## 📊 Métricas de Sucesso

### KPIs Técnicos

- **Compatibilidade**: 100% dos casos atuais funcionando
- **Performance**: ≤5% diferença de latência
- **Confiabilidade**: <0.1% rate de fallback
- **Coverage**: 100% dos providers migrados

### KPIs de Produto

- **Zero reclamações** de usuários sobre mudanças
- **Capacidades novas** utilizadas (tool calling, etc.)
- **Tempo de desenvolvimento** reduzido para features futuras
- **Bugs reduzidos** relacionados a streaming

## 📚 Recursos e Referências

### Documentação

- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [Streaming Implementation Current](./streaming-implementation.md)
- [Backend Architecture](./backend-architecture.md)

### Code Examples

- [AI SDK Examples](https://github.com/vercel/ai/tree/main/examples)
- [Provider Integrations](https://sdk.vercel.ai/providers)

## 🏁 Conclusão

Esta estratégia de **Adapter Transparente** oferece:

✅ **Migração Ultra-Segura**: Zero risco de perda de funcionalidades
✅ **Benefícios Imediatos**: Melhor performance e features novas
✅ **Flexibilidade Futura**: Pode manter adapter ou remover quando pronto
✅ **Aprendizado Gradual**: Time aprende SDK sem pressão

A implementação preserva totalmente o investimento atual enquanto abre portas para capacidades avançadas do Vercel AI SDK.

---

## 📈 **PROGRESSO DA MIGRAÇÃO**

### ✅ **SUBETAPA 1: Setup e Preparação** - CONCLUÍDA

- ✅ Vercel AI SDK instalado (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`)
- ✅ Estrutura de pastas criada (`adapters/`, `types/ai/`)
- ✅ Tipos TypeScript definidos e compilando
- ✅ Testes de importação passando (3/3)

### ✅ **SUBETAPA 2: Adapter Base** - CONCLUÍDA

- ✅ Adapter skeleton criado e funcionando
- ✅ Stream mock implementado
- ✅ Testes abrangentes (6/6 tests passed)
- ✅ TypeScript compila sem erros
- ✅ Sistema atual 100% preservado

### 📋 **PRÓXIMAS SUBETAPAS**

- 🔄 **Subetapa 3**: Feature Flag e Integração Experimental
- 🔄 **Subetapa 4**: Implementação Real do Vercel AI SDK
- 🔄 **Subetapa 5**: Fallback Automático
- 🔄 **Subetapa 6**: Substituição Gradual (Opcional)

---

**Status**: 🚧 **Em Progresso** (2/6 subetapas concluídas)  
**Owner**: Time de Desenvolvimento  
**Timeline**: 8 sprints (4 meses)  
**Risk Level**: 🟢 **Baixo** (com fallback automático)
