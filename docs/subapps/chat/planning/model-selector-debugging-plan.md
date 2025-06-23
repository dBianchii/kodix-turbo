# 🔧 Model Selector - Plano de Checagem e Correção

**📅 Data:** Janeiro 2025  
**🎯 Objetivo:** Identificar e corrigir problemas no ModelSelector  
**⚙️ Modo:** Debugging incremental com análise completa

## 🚨 Problemas Identificados

### **1. Incompatibilidade de Props**

- ❌ **ModelSelector** espera: `selectedModelId`, `onModelSelect`
- ❌ **UnifiedChatPage** passa: `selectedModelId`, `onModelSelect`
- ✅ **Compatível** mas há divergência na implementação interna

### **2. Lógica de Valor Conflitante**

- ❌ **ModelSelector** usa `value` interno + `getPreferredModelId()`
- ❌ **UnifiedChatPage** passa `selectedModelId` mas usa props diferentes
- ⚠️ **Resultado**: Valor não sincroniza corretamente

### **3. Callbacks Duplos**

- ❌ **ModelSelector** chama `onValueChange` + `savePreferredModel`
- ❌ **UnifiedChatPage** chama `savePreferredModel` no `handleModelSelect`
- ⚠️ **Resultado**: Salvamento duplo ou conflitante

## 📋 Plano de Debugging - 4 Fases

### **Fase 1: Análise e Logging** ⏱️ 20min

#### 1.1 Adicionar Logs Detalhados

```typescript
// ✅ Props recebidas
console.log("[MODEL_SELECTOR] Props recebidas:", {
  value,
  selectedModelId: value, // UnifiedChatPage passa como selectedModelId
  onValueChange: !!onValueChange,
  disabled,
  timestamp: new Date().toISOString(),
});

// ✅ Estado interno calculado
console.log("[MODEL_SELECTOR] Estado calculado:", {
  availableModelsCount: availableModels?.length || 0,
  processedModelsCount: processedModels.length,
  preferredModelId: getPreferredModelId(),
  currentModelId: currentModel?.id,
  currentModelName: currentModel?.name,
});

// ✅ Seleção de modelo
console.log("[MODEL_SELECTOR] handleSelect chamado:", {
  selectedModelId: modelId,
  previousModelId: currentModel?.id,
  hasOnValueChange: !!onValueChange,
  willSavePreference: true,
});
```

#### 1.2 Seção de Debug no Popover

```typescript
{/* Debug panel (apenas desenvolvimento) */}
{process.env.NODE_ENV === 'development' && (
  <div className="border-t pt-2 mt-2 text-xs text-slate-500">
    <details>
      <summary>Debug - Model Selector</summary>
      <div className="mt-2 space-y-1 text-xs">
        <div>Props value: {value || 'undefined'}</div>
        <div>Preferred ID: {getPreferredModelId() || 'undefined'}</div>
        <div>Current Model: {currentModel?.name || 'none'}</div>
        <div>Available: {processedModels.length}</div>
        <div>Has onValueChange: {String(!!onValueChange)}</div>
      </div>
    </details>
  </div>
)}
```

#### 1.3 Identificar Problemas Específicos

- [ ] **Props não chegam**: `value` undefined
- [ ] **Modelos não carregam**: `processedModels` vazio
- [ ] **Seleção não funciona**: `onValueChange` não chama
- [ ] **Preferência não salva**: erro no `savePreferredModel`
- [ ] **UI não atualiza**: estado não sincroniza

### **Fase 2: Correção de Interface** ⏱️ 30min

#### 2.1 Padronizar Props Interface

```typescript
interface ModelSelectorProps {
  selectedModelId?: string; // ✅ Renomear de 'value'
  onModelSelect?: (modelId: string) => void; // ✅ Renomear de 'onValueChange'
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
```

#### 2.2 Simplificar Lógica de Valor

```typescript
// ✅ Usar selectedModelId diretamente (sem getPreferredModelId interno)
const currentModel = useMemo(() => {
  return processedModels.find((model: any) => model.id === selectedModelId);
}, [selectedModelId, processedModels]);
```

#### 2.3 Remover Salvamento Duplo

```typescript
const handleSelect = useCallback(
  async (modelId: string) => {
    console.log("[MODEL_SELECTOR] Seleção:", modelId);

    // ✅ Apenas chamar callback - deixar salvamento para o pai
    onModelSelect?.(modelId);

    // ✅ Remover savePreferredModel daqui (UnifiedChatPage já faz)
  },
  [onModelSelect],
);
```

### **Fase 3: Correção no UnifiedChatPage** ⏱️ 25min

#### 3.1 Corrigir Props Passadas

```typescript
<ModelSelector
  selectedModelId={selectedModelId}  // ✅ Prop correta
  onModelSelect={handleModelSelect}  // ✅ Callback correto
  disabled={
    selectedSessionId
      ? updateSessionMutation.isPending
      : isSaving || isLoading
  }
/>
```

#### 3.2 Validar handleModelSelect

```typescript
const handleModelSelect = (modelId: string) => {
  console.log("[UNIFIED_CHAT] handleModelSelect:", {
    modelId,
    previousModelId: selectedModelId,
    selectedSessionId,
    hasSession: !!selectedSessionId,
  });

  // ✅ Atualizar estado local primeiro
  setSelectedModelId(modelId);

  if (selectedSessionId) {
    // ✅ Sessão: atualizar modelo da sessão
    updateSessionMutation.mutate({
      id: selectedSessionId,
      aiModelId: modelId,
    });
  } else {
    // ✅ Sem sessão: salvar como preferido
    savePreferredModel(modelId);
  }
};
```

### **Fase 4: Validação e Testes** ⏱️ 15min

#### 4.1 Cenários de Teste

- [ ] **Seleção com sessão**: Deve atualizar modelo da sessão
- [ ] **Seleção sem sessão**: Deve salvar como preferido
- [ ] **Mudança de sessão**: Deve carregar modelo da nova sessão
- [ ] **Erro na API**: Deve mostrar erro e reverter seleção
- [ ] **Loading states**: Deve desabilitar durante operações

#### 4.2 Logs de Validação

```typescript
// ✅ Validar sincronização
useEffect(() => {
  console.log("[MODEL_SELECTOR] Validation:", {
    propsValue: selectedModelId,
    currentModelId: currentModel?.id,
    isInSync: selectedModelId === currentModel?.id,
    timestamp: new Date().toISOString(),
  });
}, [selectedModelId, currentModel?.id]);
```

#### 4.3 Checklist Final

- [ ] Props interface padronizada
- [ ] Valor sincroniza corretamente
- [ ] Seleção funciona sem duplicação
- [ ] Loading states funcionam
- [ ] Erro handling implementado
- [ ] Logs removidos (produção)

## 🎯 Problemas Específicos Detectados

### **A. Interface Props Inconsistente**

```typescript
// ❌ ATUAL (ModelSelector)
interface ModelSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

// ✅ ESPERADO (UnifiedChatPage)
<ModelSelector
  selectedModelId={selectedModelId}
  onModelSelect={handleModelSelect}
/>
```

### **B. Lógica de Valor Complexa**

```typescript
// ❌ ATUAL - Múltiplas fontes de verdade
const currentModel = useMemo(() => {
  const modelId = value || getPreferredModelId(); // ⚠️ Confuso
  return processedModels.find((model: any) => model.id === modelId);
}, [value, getPreferredModelId, processedModels]);

// ✅ CORRIGIDO - Fonte única
const currentModel = useMemo(() => {
  return processedModels.find((model: any) => model.id === selectedModelId);
}, [selectedModelId, processedModels]);
```

### **C. Callback Duplo**

```typescript
// ❌ ATUAL - Salvamento duplo
const handleSelect = useCallback(
  async (modelId: string) => {
    onValueChange?.(modelId); // UnifiedChatPage vai salvar
    await savePreferredModel(modelId); // ⚠️ Salvamento duplo!
  },
  [onValueChange, savePreferredModel],
);

// ✅ CORRIGIDO - Responsabilidade única
const handleSelect = useCallback(
  async (modelId: string) => {
    onModelSelect?.(modelId); // Apenas notificar pai
  },
  [onModelSelect],
);
```

## 🔍 Root Cause Analysis

### **Causa Raiz 1: Evolução de Interface**

- **Origem**: ModelSelector criado com interface genérica (`value`, `onValueChange`)
- **Evolução**: UnifiedChatPage usa interface específica (`selectedModelId`, `onModelSelect`)
- **Resultado**: Incompatibilidade de props

### **Causa Raiz 2: Responsabilidades Mistas**

- **ModelSelector**: Tenta gerenciar preferências + seleção
- **UnifiedChatPage**: Também gerencia preferências + sessões
- **Resultado**: Lógica duplicada e conflitante

### **Causa Raiz 3: Estado Distribuído**

- **getPreferredModelId()**: Hook interno que pode estar desatualizado
- **selectedModelId**: State do UnifiedChatPage
- **Resultado**: Fontes de verdade conflitantes

## 📊 Impacto da Correção

### **Antes da Correção:**

- ❌ Props incompatíveis
- ❌ Salvamento duplo
- ❌ Estado inconsistente
- ❌ Debugging difícil

### **Depois da Correção:**

- ✅ Interface padronizada
- ✅ Responsabilidade única
- ✅ Estado consistente
- ✅ Debugging facilitado
- ✅ Performance melhorada

## 🚀 Próximos Passos

1. **Implementar Fase 1** - Adicionar logs e debug
2. **Analisar logs** - Identificar problema específico
3. **Implementar Fase 2** - Corrigir interface
4. **Implementar Fase 3** - Corrigir UnifiedChatPage
5. **Implementar Fase 4** - Validar e testar
6. **Remover logs** - Limpar código para produção

---

**🎉 Resultado Esperado:** ModelSelector funcionando perfeitamente com interface padronizada e responsabilidades claras.
