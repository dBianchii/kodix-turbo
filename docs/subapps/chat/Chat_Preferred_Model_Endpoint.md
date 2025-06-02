# Chat Preferred Model Endpoint - Kodix

## 📖 Overview

O endpoint **`getPreferredModel`** implementa uma **hierarquia de prioridade inteligente** para determinar qual modelo de IA usar no chat, **respeitando o isolamento total entre subapps** via chamadas HTTP.

## 🏗️ **Arquitetura de Isolamento**

### ✅ **Subapp Isolation Compliance**

- **Chat** ❌ NÃO acessa repositórios do AI Studio diretamente
- **Chat** ✅ Faz chamadas HTTP para endpoints do AI Studio
- **AI Studio** ✅ Expõe endpoints HTTP específicos para Chat
- **Isolamento Total** ✅ Mantido entre subapps

### 🔄 **Fluxo de Comunicação**

```
Chat Router → HTTP Request → AI Studio HTTP API → AI Studio Repository → Database
```

## 🎯 **Lógica de Prioridade**

### **1ª Prioridade: Chat Team Config**

- **Source**: `lastSelectedModelId` da configuração do team no Chat
- **Quando usar**: Quando o team já selecionou um modelo específico no chat
- **Persistência**: Salvo automaticamente quando usuário seleciona modelo

### **2ª Prioridade: AI Studio Default**

- **Source**: Modelo marcado como `isDefault: true` no AI Studio
- **Quando usar**: Quando não há modelo salvo no Chat Team Config
- **Configuração**: Definido pelos admins no AI Studio
- **API Call**: `GET /api/ai-studio/chat-integration?action=getDefaultModel`

### **3ª Prioridade: Primeiro Modelo Ativo**

- **Source**: Primeiro modelo habilitado (`enabled: true`) disponível
- **Quando usar**: Como fallback final
- **Critério**: Primeiro da lista de modelos ativos do team
- **API Call**: `GET /api/ai-studio/chat-integration?action=getAvailableModels`

## 🛠️ **Implementação Backend**

### **Endpoints HTTP do AI Studio**

```typescript
// apps/kdx/src/app/api/ai-studio/chat-integration/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "getModel":
      // Busca modelo por ID
      return aiStudioRepository.AiModelRepository.findById(modelId);

    case "getDefaultModel":
      // Busca modelo padrão do team
      return aiStudioRepository.AiTeamModelConfigRepository.getDefaultModel(
        teamId,
      );

    case "getAvailableModels":
      // Lista modelos disponíveis do team
      return aiStudioRepository.AiTeamModelConfigRepository.findAvailableModelsByTeam(
        teamId,
      );

    case "getProviderToken":
      // Busca token do provider
      return aiStudioRepository.AiTeamProviderTokenRepository.findByTeamAndProvider(
        teamId,
        providerId,
      );
  }
}
```

### **Chat Router com HTTP Calls**

```typescript
// packages/api/src/trpc/routers/app/chat/_router.ts

// Helper para chamadas HTTP respeitando isolamento
async function callAiStudioEndpoint(
  action: string,
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const baseUrl = process.env.KODIX_API_URL || "http://localhost:3000";
  const searchParams = new URLSearchParams({ action, ...(params || {}) });
  const url = `${baseUrl}/api/ai-studio/chat-integration?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...headers },
  });

  const result = (await response.json()) as {
    success: boolean;
    data?: any;
    error?: string;
  };
  if (!result.success) {
    throw new Error(`AI Studio Error: ${result.error}`);
  }

  return result.data;
}

getPreferredModel: protectedProcedure.query(async ({ ctx }) => {
  // 1ª Prioridade: Chat Team Config
  const chatConfigs = await appRepository.findAppTeamConfigs({
    appId: chatAppId,
    teamIds: [teamId],
  });

  const lastSelectedModelId = chatConfig?.config?.lastSelectedModelId;
  if (lastSelectedModelId) {
    // 🔄 HTTP Call respeitando isolamento
    const model = await callAiStudioEndpoint(
      "getModel",
      { modelId: lastSelectedModelId },
      { Authorization: ctx.token || "" },
    );

    if (model) {
      return {
        source: "chat_config",
        modelId: model.id,
        model,
        config: chatConfig?.config,
      };
    }
  }

  // 2ª Prioridade: AI Studio Default via HTTP
  const defaultModelConfig = await callAiStudioEndpoint(
    "getDefaultModel",
    undefined,
    { Authorization: ctx.token || "" },
  );

  if (defaultModelConfig?.model) {
    return {
      source: "ai_studio_default",
      modelId: defaultModelConfig.model.id,
      model: defaultModelConfig.model,
      teamConfig: defaultModelConfig,
    };
  }

  // 3ª Prioridade: Primeiro modelo ativo via HTTP
  const availableModels = await callAiStudioEndpoint(
    "getAvailableModels",
    undefined,
    { Authorization: ctx.token || "" },
  );

  const firstActiveModel = (availableModels || []).find(
    (m: any) => m.teamConfig?.enabled,
  );

  if (firstActiveModel) {
    return {
      source: "first_available",
      modelId: firstActiveModel.id,
      model: firstActiveModel,
      teamConfig: firstActiveModel.teamConfig,
    };
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Nenhum modelo de IA disponível. Configure modelos no AI Studio.",
  });
});
```

### **Estrutura de Resposta**

```typescript
interface PreferredModelResponse {
  source: "chat_config" | "ai_studio_default" | "first_available";
  modelId: string;
  model: {
    id: string;
    name: string;
    providerId: string;
    config: any;
    provider: {
      name: string;
      baseUrl?: string;
    };
  };
  config?: any; // Chat config quando source = "chat_config"
  teamConfig?: any; // AI Studio config quando source = "ai_studio_default" | "first_available"
}
```

## 🎯 **Frontend Integration**

### **Hook personalizado**

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useChatPreferredModel.ts

export function useChatPreferredModel() {
  const trpc = useTRPC();

  const {
    data: preferredModel,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...trpc.app.chat.getPreferredModel.queryOptions(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    preferredModel,
    isLoading,
    error,
    refetch,

    // Helpers
    modelId: preferredModel?.modelId,
    model: preferredModel?.model,
    source: preferredModel?.source,

    // Verificações
    isFromChatConfig: preferredModel?.source === "chat_config",
    isFromAiStudio: preferredModel?.source === "ai_studio_default",
    isFallback: preferredModel?.source === "first_available",
  };
}
```

### **Exemplo de uso**

```typescript
// No componente do Chat
const { preferredModel, isLoading, isFromChatConfig } = useChatPreferredModel();

if (isLoading) return <Loading />;

return (
  <div>
    <h3>Modelo Atual: {preferredModel?.model?.name}</h3>
    <Badge variant={isFromChatConfig ? "primary" : "secondary"}>
      {isFromChatConfig ? "Salvo no Chat" : "Padrão do AI Studio"}
    </Badge>
  </div>
);
```

## ✅ **Benefícios da Arquitetura**

### **🔒 Isolamento Garantido**

- Subapps não acessam repositórios uns dos outros
- Comunicação apenas via HTTP APIs
- Facilita manutenção e evolução independente

### **🚀 Performance**

- Cache inteligente no frontend (5 min)
- Chamadas HTTP otimizadas
- Fallbacks eficientes

### **🛡️ Segurança**

- Autenticação em cada chamada HTTP
- Validação de team ownership
- Error handling robusto

### **📈 Escalabilidade**

- Subapps podem ser deployed independentemente
- APIs HTTP podem ser facilmente monitoradas
- Facilita implementação de rate limiting

## 🧪 **Testes**

```bash
# Testar endpoint (requer autenticação)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/ai-studio/chat-integration?action=getDefaultModel"

# Testar via tRPC no frontend
const { preferredModel } = useChatPreferredModel();
console.log("Modelo preferido:", preferredModel);
```

## 📊 **Monitoramento**

Os logs incluem informações detalhadas sobre:

- Qual prioridade foi usada
- Tempos de resposta das chamadas HTTP
- Erros e fallbacks acionados
- Team e modelo selecionado

```
🎯 [PREFERRED_MODEL] Buscando modelo preferido para team: team_123
✅ [PREFERRED_MODEL] Encontrado lastSelectedModelId: model_456
🔄 [AI_STUDIO_API] Chat integration request: getModel
✅ [PREFERRED_MODEL] Modelo encontrado: gpt-4-turbo
```

## 🎯 **Vantagens da Solução**

### **🧠 Inteligência**

- Combina configurações de duas fontes
- Prioridade baseada na experiência do usuário
- Fallbacks robustos

### **🔄 Continuidade**

- Preserva escolhas anteriores do team
- Respeita configurações dos admins
- Experiência consistente

### **⚡ Performance**

- Cache de 5 minutos
- Uma única query otimizada
- Fallbacks sem queries adicionais

### **🛡️ Robustez**

- Funciona mesmo com configurações incompletas
- Limpa automaticamente dados inválidos
- Logs detalhados para debugging

## 📊 **Exemplos de Logs**

### **Modelo do Chat Config**

```
🎯 [PREFERRED_MODEL] Buscando modelo preferido para team: abc123
✅ [PREFERRED_MODEL] Encontrado lastSelectedModelId: gpt-4o-2024-11-20
✅ [PREFERRED_MODEL] Modelo encontrado: GPT-4o
```

### **Modelo Padrão do AI Studio**

```
🎯 [PREFERRED_MODEL] Buscando modelo preferido para team: abc123
🔄 [PREFERRED_MODEL] Buscando modelo padrão do AI Studio
✅ [PREFERRED_MODEL] Modelo padrão do AI Studio encontrado: Claude 3.5 Sonnet
```

### **Fallback para Primeiro Ativo**

```
🎯 [PREFERRED_MODEL] Buscando modelo preferido para team: abc123
🔄 [PREFERRED_MODEL] Buscando modelo padrão do AI Studio
⚠️ [PREFERRED_MODEL] Nenhum modelo padrão configurado no AI Studio
🔄 [PREFERRED_MODEL] Usando primeiro modelo ativo como fallback: GPT-3.5 Turbo
```

## 🧪 **Como Testar**

### **1. Teste de Prioridades**

```typescript
// Teste manual das prioridades

// 1. Limpar Chat Team Config
// 2. Configurar modelo padrão no AI Studio
// 3. Verificar se retorna modelo do AI Studio

// 4. Usar chat e selecionar modelo diferente
// 5. Verificar se próxima chamada retorna lastSelectedModelId
```

### **2. Teste de Fallbacks**

```typescript
// 1. Remover modelo padrão do AI Studio
// 2. Verificar se usa primeiro modelo ativo

// 3. Desabilitar todos os modelos
// 4. Verificar se retorna erro apropriado
```

## 🔗 **Integração com Funcionalidades Existentes**

### **Chat Team Config System**

- ✅ Lê `lastSelectedModelId` existente
- ✅ Compatível com salvamento automático
- ✅ Respeita configurações por team

### **AI Studio**

- ✅ Usa modelo padrão configurado
- ✅ Respeita modelos habilitados/desabilitados
- ✅ Considera tokens de provider

### **Model Selector**

- ✅ Pré-seleciona modelo inteligentemente
- ✅ Atualiza Chat Team Config automaticamente
- ✅ Feedback visual da fonte do modelo

---

## 📝 **Conclusão**

O endpoint `getPreferredModel` oferece uma experiência inteligente e robusta para seleção de modelos de IA, combinando o melhor dos dois sistemas:

- **Personalização por Team** (Chat Team Config)
- **Configuração Administrativa** (AI Studio)
- **Fallbacks Inteligentes** (Primeiro modelo disponível)

Isso garante que o chat sempre funcione com um modelo apropriado, respeitando as preferências do team e configurações dos administradores.
