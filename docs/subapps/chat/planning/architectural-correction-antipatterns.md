# 🚨 Antipadrões de Correção Arquitetural - Chat SubApp

> **📅 Criado:** Janeiro 2025  
> **🎯 Objetivo:** Documentar antipadrões críticos para prevenir regressões futuras  
> **⚠️ Importância:** CRÍTICA - Leitura obrigatória antes de qualquer mudança arquitetural

## 📖 **CONTEXTO**

Durante a correção do problema de model selector na welcome screen, cometemos erros arquiteturais graves que resultaram em quebra completa do sistema. Este documento serve como **guia do que NÃO fazer** em futuras correções.

## 🔴 **ANTIPADRÃO #1: Substituição de Fluxos Fundamentais**

### **❌ O QUE NÃO FAZER**

```typescript
// ❌ ANTIPADRÃO: Substituir fluxo arquitetural estabelecido
function EmptyThreadState() {
  // ERRO: Trocar createEmptySession por useAutoCreateSession
  const { createSessionWithMessage } = useAutoCreateSession();

  const handleFirstMessage = async (message: string) => {
    // ERRO: Mudar fluxo de criação + navegação
    await createSessionWithMessage({
      firstMessage: message,
      aiModelId: selectedModelId,
    });
  };
}
```

### **✅ O QUE FAZER**

```typescript
// ✅ CORRETO: Manter fluxo arquitetural existente
function EmptyThreadState() {
  // MANTER: createEmptySession (fluxo original)
  const createEmptySessionMutation = useMutation(/*...*/);

  const handleFirstMessage = async (message: string) => {
    // MANTER: 1. Criar sessão vazia
    const result = await createEmptySessionMutation.mutateAsync({
      /*...*/
    });

    // MANTER: 2. Salvar mensagem pendente
    sessionStorage.setItem(`pending-message-${result.session.id}`, message);

    // ADICIONAR: 3. Salvar modelo selecionado (CORREÇÃO MÍNIMA)
    sessionStorage.setItem(
      `pending-model-${result.session.id}`,
      selectedModelId,
    );

    // MANTER: 4. Navegar
    onNewSession(result.session.id);
  };
}
```

## 🔴 **ANTIPADRÃO #2: Mudanças "Big Bang"**

### **❌ O QUE NÃO FAZER**

- Trocar múltiplos hooks simultaneamente
- Mudar fluxo de dados + navegação + criação de sessão
- Implementar "solução completa" sem validar cada etapa
- Assumir que entendemos todos os efeitos colaterais

### **✅ O QUE FAZER**

- Identificar o ponto específico do problema
- Implementar correção mínima possível
- Testar cada mudança isoladamente
- Manter fallbacks e compatibilidade

## 🔴 **ANTIPADRÃO #3: Ignorar Lições Arquiteturais**

### **❌ VIOLAÇÕES CRÍTICAS**

**Ignorar documentação existente:**

- `@docs/subapps/chat/planning/migration-history-unified.md`
- `@docs/subapps/chat/chat-architecture.md`

**Violar princípios estabelecidos:**

- Thread-first architecture
- Navegação centralizada
- Padrão sessionStorage + navegação

### **✅ PROCESSO CORRETO**

1. **SEMPRE consultar** documentação arquitetural antes de mudanças
2. **VERIFICAR** se mudança viola "Lições Críticas"
3. **MAPEAR** todos os componentes afetados
4. **PLANEJAR** rollback antes de implementar

## 🔴 **ANTIPADRÃO #4: Assumir Equivalência de Hooks**

### **❌ ERRO CONCEITUAL**

```typescript
// ❌ FALSA EQUIVALÊNCIA
// Assumir que useAutoCreateSession === createEmptySession
// SÃO FLUXOS COMPLETAMENTE DIFERENTES!

// createEmptySession: Cria sessão vazia → sessionStorage → navegação
// useAutoCreateSession: Cria sessão + mensagem → navegação direta
```

### **✅ ENTENDIMENTO CORRETO**

- **`createEmptySession`**: Para welcome screen (thread-first)
- **`useAutoCreateSession`**: Para fluxos com mensagem imediata
- **NÃO são intercambiáveis** - têm propósitos diferentes

## 🔴 **ANTIPADRÃO #5: Correção Sem Diagnóstico**

### **❌ ABORDAGEM INCORRETA**

1. Ver problema: "Modelo não está sendo usado"
2. Assumir solução: "Vou trocar o hook"
3. Implementar mudança ampla
4. Quebrar sistema inteiro

### **✅ ABORDAGEM CORRETA**

1. **DIAGNOSTICAR**: Onde exatamente o modelo se perde?
2. **RASTREAR**: Fluxo específico do problema
3. **IDENTIFICAR**: Ponto exato da falha
4. **CORRIGIR**: Apenas esse ponto específico

## 📋 **CHECKLIST DE PREVENÇÃO**

### **ANTES de qualquer mudança:**

- [ ] Li `@docs/subapps/chat/planning/migration-history-unified.md`?
- [ ] Identifiquei o problema específico (não assumindo solução)?
- [ ] Verifiquei se mudança viola alguma "Lição Crítica"?
- [ ] Mapei TODOS os componentes afetados?
- [ ] Tenho plano de rollback?

### **DURANTE a implementação:**

- [ ] Estou fazendo mudança mínima possível?
- [ ] Mantive fluxos arquiteturais existentes?
- [ ] Testei imediatamente após mudança?
- [ ] Mensagens ainda aparecem?
- [ ] Navegação não quebrou?

### **SINAIS DE ALERTA - PARE IMEDIATAMENTE:**

- 🚨 Mensagens param de aparecer
- 🚨 Navegação quebra
- 🚨 Console mostra erros de hidratação
- 🚨 Fluxo de criação de sessão muda drasticamente
- 🚨 Hooks críticos são substituídos completamente

## 🎯 **EXEMPLO: CORREÇÃO CORRETA DO PROBLEMA ORIGINAL**

### **PROBLEMA IDENTIFICADO:**

`useAutoCreateSession` não passa `aiModelId` para o backend.

### **CORREÇÃO MÍNIMA:**

```typescript
// ✅ CORREÇÃO CIRÚRGICA: Apenas no useAutoCreateSession
export function useAutoCreateSession() {
  const { modelId: preferredModelId } = useChatPreferredModel();

  const createSessionWithMessage = async (input: CreateSessionInput) => {
    // ✅ ADICIONAR: Determinar modelo a usar
    const aiModelToUse = input.aiModelId || preferredModelId;

    await autoCreateMutation.mutateAsync({
      firstMessage: input.firstMessage,
      useAgent: input.useAgent ?? true,
      generateTitle: input.generateTitle ?? true,
      aiModelId: aiModelToUse, // ✅ ADICIONAR: Passar modelo
    });
  };
}
```

### **COMPONENTES AFETADOS:**

- ✅ `useAutoCreateSession`: Correção mínima
- ✅ `EmptyThreadState`: NENHUMA mudança
- ✅ `ActiveChatWindow`: NENHUMA mudança
- ✅ Fluxo arquitetural: PRESERVADO

## 💡 **PRINCÍPIOS FUNDAMENTAIS**

### **Regra de Ouro:**

> **"Se está funcionando, a correção deve ser cirúrgica, não arquitetural."**

### **Hierarquia de Correção:**

1. **Corrigir** o bug específico
2. **Preservar** arquitetura validada
3. **Manter** fluxos estabelecidos
4. **Evitar** efeitos colaterais

### **Mantra da Correção:**

> **"Mudança mínima, máximo cuidado, teste imediato."**

## 📚 **REFERÊNCIAS OBRIGATÓRIAS**

**SEMPRE consultar antes de mudanças arquiteturais:**

1. **Este documento** - Antipadrões a evitar
2. **`@docs/subapps/chat/planning/migration-history-unified.md`** - Lições críticas
3. **`@docs/subapps/chat/chat-architecture.md`** - Arquitetura de referência do SubApp
4. **`@docs/subapps/chat/planning/assistant-ui-evolution-plan.md`** - Estado atual

---

**📝 Status:** Antipadrões documentados  
**🎯 Próximos passos:** Consultar este documento antes de QUALQUER correção arquitetural  
**⚠️ Criticidade:** MÁXIMA - Violação pode quebrar sistema inteiro

## 🎯 Processo Obrigatório de Correção Arquitetural

1. **Identificar o antipadrão**: Comparar a implementação atual com as diretrizes do `@docs/architecture/Architecture_Standards.md`.
2. **Consultar este documento**: Verificar se o problema já foi mapeado como um antipadrão.
3. **Analisar a arquitetura oficial**: Revisar `@docs/subapps/chat/chat-architecture.md` para entender os padrões estabelecidos.
4. **Planejar a correção**: Criar um plano de ação detalhado (ex: `@docs/subapps/chat/planning/refactoring-plan.md`).
5. **Implementar de forma segura**: Seguir o padrão de migração incremental, com testes e validação contínua.

- **[Histórico de Migração do Chat](./migration-history-unified.md)** - Lições aprendidas com migrações passadas
- **[Padrões Arquiteturais Globais](../../architecture/Architecture_Standards.md)** - Regras gerais do monorepo
- **[Arquitetura do Chat](./chat-architecture.md)** - Arquitetura de referência do SubApp
- **[Padrões tRPC](../../architecture/trpc-patterns.md)** - Boas práticas de implementação de API
- **[Service Layer](../../architecture/subapp-architecture.md)** - Padrão de comunicação entre SubApps
