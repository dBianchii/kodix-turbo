# 🌍 Chaves de Tradução - Chat SubApp

## 📖 Visão Geral

Este documento documenta as chaves de tradução específicas do Chat SubApp, incluindo as novas implementações para token usage badge e outras funcionalidades.

## 🆕 Novas Traduções Implementadas

### Token Usage Badge

**Chaves adicionadas** em `packages/locales/src/messages/kdx/[pt-BR|en].json`:

```json
{
  "tokenUsage": {
    "title": "Uso de Tokens",
    "used": "Usados",
    "limit": "Limite",
    "percentage": "Porcentagem de uso",
    "status": "Status",
    "details": "Detalhes do uso de tokens",
    "tokensUsed": "Tokens utilizados nesta conversa",
    "currentLimit": "Limite atual definido",
    "usagePercentage": "Porcentagem do limite utilizada",
    "statusGood": "Uso normal",
    "statusWarning": "Atenção ao limite",
    "statusCritical": "Limite quase excedido"
  }
}
```

### Suporte Multilíngue

#### Português (pt-BR)

- `tokenUsage.title`: "Uso de Tokens"
- `tokenUsage.used`: "Usados"
- `tokenUsage.limit`: "Limite"
- `tokenUsage.details`: "Detalhes do uso de tokens"

#### English (en)

- `tokenUsage.title`: "Token Usage"
- `tokenUsage.used`: "Used"
- `tokenUsage.limit`: "Limit"
- `tokenUsage.details`: "Token usage details"

## 🎨 Uso nos Componentes

### TokenUsageBadge Component

```typescript
import { useTranslations } from '@kdx/locales/next-intl';

const t = useTranslations();

// Usar as traduções no componente
<div>
  <h3>{t('tokenUsage.title')}</h3>
  <span>{t('tokenUsage.used')}: {usage.used}</span>
  <span>{t('tokenUsage.limit')}: {usage.limit}</span>
</div>
```

## 📝 Padrões de Nomenclatura

### Estrutura Hierárquica

- Namespace principal: `tokenUsage`
- Chaves específicas: `.title`, `.used`, `.limit`, etc.
- Chaves compostas: `.statusGood`, `.statusWarning`, `.statusCritical`

### Convenções

- **Snake case** para chaves compostas (`tokenUsage`)
- **Camel case** para propriedades (`usagePercentage`)
- **Nomes descritivos** e autoexplicativos
- **Consistência** entre idiomas

## 🔍 Verificação de Integridade

### Comandos Úteis

```bash
# Verificar se todas as chaves existem em ambos idiomas
diff <(jq -r 'paths(scalars) as $p | $p | join(".")' packages/locales/src/messages/kdx/pt-BR.json | sort) \
     <(jq -r 'paths(scalars) as $p | $p | join(".")' packages/locales/src/messages/kdx/en.json | sort)

# Buscar uso das chaves no código
grep -r "tokenUsage\." apps/kdx/src/
```

### Checklist de Qualidade

- [ ] Chaves existem em ambos idiomas (pt-BR e en)
- [ ] Traduções são contextualmente apropriadas
- [ ] Nomes das chaves são consistentes
- [ ] Documentação atualizada
- [ ] Testes verificam as traduções

## 🧪 Testes Relacionados

### Teste de Completude

```typescript
// Verificar se todas as chaves tokenUsage existem
describe("TokenUsage Translations", () => {
  it("should have all required keys in both languages", () => {
    // Implementação do teste
  });
});
```

## 🔄 Próximas Expansões

### Possíveis Adições Futuras

- `tokenUsage.history`: Histórico de uso
- `tokenUsage.predictions`: Previsões de gasto
- `tokenUsage.alerts`: Alertas personalizados
- `tokenUsage.reset`: Opções de reset

---

**📍 Localização dos Arquivos:**

- **PT-BR**: `packages/locales/src/messages/kdx/pt-BR.json`
- **EN**: `packages/locales/src/messages/kdx/en.json`
- **Componente**: `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/token-usage-badge.tsx`
