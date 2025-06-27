# Plano de Implementação: Instruções Dinâmicas da Plataforma

**Data:** 2025-06-27  
**Autor:** KodixAgent  
**Status:** 🟡 Proposta v2.0
**Escopo:** AI Studio - Configuração Geral  
**Tipo:** Template dinâmico com variáveis

---

## 1. Resumo Executivo

Evoluir o sistema de "Instruções da Plataforma" de um texto estático para um **template dinâmico com variáveis**. Isso permitirá que administradores criem instruções globais personalizadas com dados do usuário (ex: `{{userName}}`, `{{userLanguage}}`), que serão substituídos em tempo real no backend.

### Objetivos

- ✅ Transformar o campo de texto em um editor de templates.
- ✅ Implementar um sistema de substituição de variáveis no backend.
- ✅ Exibir variáveis disponíveis na UI para facilitar a configuração.
- ✅ Manter a integração transparente com o Chat SubApp.
- ✅ Garantir a segurança e o isolamento dos dados do usuário.

---

## 2. Arquitetura Proposta

### 2.1 Fluxo de Dados com Substituição de Variáveis

```mermaid
graph TD
    subgraph "AI Studio (Admin)"
        A[Editor de Template] -->|Salva Template com {{userName}}| B(DB: aiInstructions)
    end

    subgraph "Chat (Usuário)"
        C[Usuário envia mensagem] --> D{/api/chat/stream}
    end

    subgraph "Backend Processing"
        D --> E[1. Pega Template de Instruções]
        E --> F[2. Pega Dados do Usuário Atual]
        F --> G[3. Substitui Variáveis]
        G --> H[4. Concatena com outras instruções]
        H --> I[5. Envia para a IA]
    end

    B --> E
    DB_User[(DB: users)] --> F
```

### 2.2 Estratégia de Armazenamento

A estratégia de armazenamento permanece a mesma: a tabela `aiInstructions` com `teamId = NULL` guardará as instruções da plataforma. A diferença é que o campo `content` agora armazenará uma **string de template** em vez de um texto final.

---

## 3. Implementação Backend

### 3.1 Repository Layer

Nenhuma mudança necessária. O repositório continuará a salvar e recuperar uma string.

### 3.2 Service Layer (Principal Mudança)

```typescript
// packages/api/src/internal/services/platform.service.ts

export class PlatformService {
  // 1. Método que busca o template puro
  private static async getPlatformInstructionsTemplate(): Promise<string> {
    const instructions =
      await AiInstructionsRepository.getPlatformInstructions();
    return instructions?.content || "";
  }

  // 2. Helper para substituir as variáveis
  private static replaceVariables(
    template: string,
    data: Record<string, string>,
  ): string {
    let result = template;
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, data[key]);
    }
    return result;
  }

  // 3. Método principal que constrói o prompt final para um usuário
  static async buildInstructionsForUser(userId: string): Promise<string> {
    // Busca o template e os dados do usuário em paralelo
    const [template, user] = await Promise.all([
      this.getPlatformInstructionsTemplate(),
      db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]);

    if (!template) return "";
    if (!user) return template; // Se não encontrar o usuário, retorna o template sem substituição

    // Dados disponíveis para personalização
    const contextData = {
      userName: user.name ?? "Usuário",
      userEmail: user.email,
      userLanguage: user.language ?? "pt-BR",
      userTimezone: user.timezone ?? "America/Sao_Paulo",
      currentDate: dayjs().format("YYYY-MM-DD"),
    };

    return this.replaceVariables(template, contextData);
  }
}
```

### 3.3 tRPC Endpoints

O endpoint `savePlatformInstructions` continua o mesmo. O endpoint `getPlatformInstructions` também, pois a UI precisa do template puro para edição. A mágica acontece no `Service Layer`.

---

## 4. Implementação Frontend

### 4.1 Editor de Instruções com Variáveis

O componente da UI será atualizado para exibir as variáveis disponíveis ao lado do editor de texto.

```typescript
// _components/platform-instructions-editor.tsx

export function PlatformInstructionsEditor() {
  const availableVariables = [
    { variable: "{{userName}}", description: "Nome completo do usuário" },
    { variable: "{{userEmail}}", description: "Email do usuário" },
    { variable: "{{userLanguage}}", description: "Idioma preferido (ex: pt-BR)" },
    { variable: "{{currentDate}}", description: "Data atual (YYYY-MM-DD)" },
  ];

  // ... lógica de state e mutation ...

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Instruções da Plataforma</CardTitle>
        <CardDescription>
          Use as variáveis para criar instruções dinâmicas e personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        {/* Coluna do Editor */}
        <div className="md:col-span-2 space-y-2">
          <Label>Template de Instruções</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex: Olá, {{userName}}. Responda sempre em {{userLanguage}}."
            className="min-h-[300px] font-mono"
          />
        </div>

        {/* Coluna de Variáveis Disponíveis */}
        <div className="space-y-4">
          <Label>Variáveis Disponíveis</Label>
          <div className="rounded-md border p-4 space-y-3">
            {availableVariables.map(({ variable, description }) => (
              <div key={variable} className="flex flex-col">
                <code className="font-semibold text-sm">{variable}</code>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Salvar Template</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 5. Integração com o Chat

A chamada no endpoint do chat agora usará o novo método do `PlatformService`.

```typescript
// apps/kdx/src/app/api/chat/stream/route.ts
async function buildHierarchicalPrompt({ userId, teamId, agentId }) {
  const [
    platformInstructions,
    teamInstructions,
    agentPrompt,
  ] = await Promise.all([
    // ✅ USA O NOVO MÉTODO DINÂMICO
    PlatformService.buildInstructionsForUser(userId),
    AiStudioService.getTeamInstructions({ teamId, ... }),
    AiStudioService.getAgentPrompt({ agentId, teamId, ... }),
  ]);

  // Concatenação permanece a mesma
  return `${platformInstructions}\n\n${teamInstructions}\n\n${agentPrompt}`.trim();
}
```

---

## 6. Testes

Adicionar testes específicos para a funcionalidade de template.

```typescript
// packages/api/src/__tests__/platform-instructions-dynamic.test.ts

describe("Dynamic Platform Instructions", () => {
  it("should replace user variables correctly", async () => {
    // 1. Setup
    const admin = await createTestUser({ isPlatformAdmin: true });
    const regularUser = await createTestUser({
      name: "João Silva",
      language: "pt-BR",
    });

    // 2. Admin salva o template
    await adminCaller.app.aiStudio.savePlatformInstructions({
      content: "Usuário: {{userName}}, Idioma: {{userLanguage}}",
    });

    // 3. Simula a chamada do serviço para o usuário específico
    const processedInstructions =
      await PlatformService.buildInstructionsForUser(regularUser.id);

    // 4. Assert
    expect(processedInstructions).toContain("Usuário: João Silva");
    expect(processedInstructions).toContain("Idioma: pt-BR");
    expect(processedInstructions).not.toContain("{{userName}}");
  });

  it("should handle missing user data gracefully", async () => {
    // ... teste para quando o usuário não tem nome ou idioma definido
  });
});
```

---

## 7. Checklist de Implementação

### Backend (1 dia)

- [ ] Implementar `PlatformService.buildInstructionsForUser`
- [ ] Adicionar helper `replaceVariables`
- [ ] Atualizar `getCombinedInstructions` para usar o novo service
- [ ] Adicionar testes para a substituição de variáveis

### Frontend (1 dia)

- [ ] Atualizar a UI do AI Studio para o `PlatformInstructionsEditor`
- [ ] Exibir a lista de variáveis disponíveis
- [ ] Garantir que o admin salve o template puro

### Integração (4 horas)

- [ ] Atualizar o endpoint do Chat para chamar `buildInstructionsForUser`
- [ ] Realizar teste E2E: configurar template -> iniciar chat -> verificar prompt

## 8. Vantagens da Nova Abordagem

1.  **Personalização**: Cria uma experiência de IA muito mais rica e contextual.
2.  **Escalabilidade**: Fácil de adicionar novas variáveis no futuro sem alterar a arquitetura.
3.  **Manutenibilidade**: A lógica de personalização é centralizada no `PlatformService`.
4.  **Controle do Admin**: Admins controlam completamente o formato das instruções globais.
