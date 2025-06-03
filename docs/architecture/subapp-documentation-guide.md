# SubApp Documentation Guide

## 📚 Visão Geral

Este documento define o **guia completo de documentação** para SubApps do Kodix, cobrindo tanto a **estrutura da documentação** quanto as **referências no código**.

## 🎯 Dois Aspectos da Documentação

### 1. **📝 Documentação Escrita** (READMEs, guides, etc.)

- Como estruturar READMEs de SubApps
- O que incluir/excluir em cada tipo de doc
- Templates e padrões de escrita

### 2. **🔗 Referências no Código** (Comentários nas páginas principais)

- Como adicionar links para documentação no topo dos arquivos
- Padrão de comentários JSDoc
- Facilitar descoberta pelo Cursor AI

---

## 📝 **PARTE 1: Padrões de Documentação Escrita**

### 🎯 **Princípio Fundamental: Separação de Responsabilidades**

- **`docs/architecture/`** → Padrões, arquitetura geral, processos comuns
- **`docs/subapps/[subapp-name]/`** → Especificidades, funcionalidades únicas, configurações específicas

### ❌ **O que NÃO fazer nos READMEs de SubApps**

#### 1. **Replicar Informações Arquiteturais**

```markdown
❌ ERRADO - No README do SubApp:

## 🏗️ Arquitetura Técnica

### Estrutura de Arquivos

apps/kdx/src/app/[locale]/(authed)/apps/[subapp]/
├── page.tsx
├── \_components/
└── \_hooks/

### tRPC Endpoints

- `api.app.subapp.endpoint` - Descrição
```

#### 2. **Explicar Padrões Gerais**

```markdown
❌ ERRADO - No README do SubApp:

## Estados e Gerenciamento

### Estados Principais

const [state, setState] = useState<Type>();

### Hierarquia de Prioridade

1. Estado específico
2. Configuração do team
3. Fallback padrão
```

### ✅ **Template Padrão para README de SubApp**

````markdown
# [SubApp Name]

## 📖 Visão Geral

O **[SubApp]** é [descrição específica das funcionalidades únicas deste SubApp]. [Breve contexto do que resolve e como se integra com outros SubApps].

## 🚀 Início Rápido

### 1. Executar o Projeto

```bash
# Executar todo o monorepo
pnpm dev:kdx
```
````

### 2. Acessar [SubApp]

1. Faça login na aplicação
2. Navegue para `/apps/[subapp-route]`
3. [Passos específicos para começar a usar]
4. [Configurações iniciais necessárias]
5. [Primeira ação recomendada]

## 🔧 Funcionalidades Principais

### [Categoria 1 de Funcionalidades]

- **[Feature]**: [Descrição específica]
- **[Feature]**: [Descrição específica]

### [Categoria 2 de Funcionalidades]

- **[Feature]**: [Descrição específica]
- **[Feature]**: [Descrição específica]

## 📚 Documentação Completa

### **[Categoria de Docs Específicas]**

- **[📝 Doc Específica](./doc-especifica.md)** - [Descrição do que cobre]
- **[⚙️ Config Específica](./config-especifica.md)** - [Descrição do que cobre]

## 🔗 Integração com [SubApp Dependente]

- **[Funcionalidade]**: [Como se integra especificamente]
- **[Dados]**: [Que dados compartilha/usa]
- **[Service Layer]**: [Menção breve do service usado]

## 🔒 Segurança

- **[Aspecto específico]** - [Como este SubApp implementa]
- **[Outro aspecto]** - [Configuração específica]

## 🔗 Links Relacionados

- **[Arquitetura Geral](../../architecture/README.md)** - Arquitetura do monorepo
- **[SubApp Architecture](../../architecture/subapp-architecture.md)** - Padrões de SubApps

## 📚 Recursos Relacionados

- **[📐 SubApp Architecture Guide](../../architecture/subapp-architecture.md)** - Padrões e processo de criação de SubApps
- **[🔧 Backend Development Guide](../../architecture/backend-guide.md)** - Padrões gerais de desenvolvimento backend
- **[🎨 Frontend Development Guide](../../architecture/frontend-guide.md)** - Padrões de desenvolvimento frontend

````

### 📝 **Diretrizes para Escrita**

#### **✅ DEVE Conter no README do SubApp:**
1. **Funcionalidades Únicas**: O que este SubApp faz que outros não fazem
2. **Início Rápido**: Passos práticos específicos para usar este SubApp
3. **Links para Docs Específicas**: Documentação detalhada em arquivos separados
4. **Integrações Específicas**: Como se conecta com outros SubApps específicos
5. **Configurações Particulares**: Aspectos únicos de configuração/segurança

#### **❌ NÃO DEVE Conter no README do SubApp:**
1. **Padrões Arquiteturais Gerais**: Isso vai em `docs/architecture/`
2. **Estruturas de Pastas Detalhadas**: Desenvolvedores já sabem onde procurar
3. **Explicações de tRPC/React/Next.js**: Isso são padrões gerais
4. **Estados e Hooks Genéricos**: Detalhes de implementação vão em docs específicas
5. **Fluxos de Sistema Comuns**: Padrões que todos os SubApps seguem

---

## 🔗 **PARTE 2: Referências no Código**

### 📍 **Objetivo das Referências**

Adicionar comentários no **topo da página principal** de cada SubApp para:
- **Facilitar descoberta** da documentação pelo Cursor AI
- **Manter referências sempre atualizadas**
- **Padronizar formato** em todos os SubApps

### 📋 **Template para Comentários no Código**

```typescript
/**
 * [ÍCONE] [NOME_SUBAPP] SUBAPP - Página Principal
 *
 * 📚 DOCUMENTAÇÃO:
 * - Arquitetura SubApp: @docs/architecture/subapp-architecture.md
 * - [SubApp] Overview: @docs/subapps/[subapp-name]/README.md
 * - [Outras referências específicas da documentação do SubApp]
 *
 * 🔗 SUBPASTA DOCUMENTAÇÃO: docs/subapps/[subapp-name]/
 *
 * 🎯 FUNCIONALIDADES:
 * - [Lista das principais funcionalidades do SubApp]
 * - [Características técnicas importantes]
 * - [Integrações e recursos especiais]
 */

"use client";

// ... resto do código ...
```

### 🎨 **Ícones por SubApp**

| SubApp         | Ícone | Descrição                    |
| -------------- | ----- | ---------------------------- |
| Chat           | 💬    | Representando conversação    |
| AI Studio      | 🤖    | Representando IA/robôs       |
| Todo           | 📝    | Representando tarefas        |
| Calendar       | 📅    | Representando calendário     |
| Cupom          | 🎫    | Representando cupons/ofertas |
| Kodix Care Web | 🏥    | Representando saúde/cuidados |

### 📍 **Localização das Referências**

O comentário deve ser adicionado **no topo da página principal** de cada SubApp:

- `apps/kdx/src/app/[locale]/(authed)/apps/[subapp-name]/page.tsx`

---

## 📚 **Exemplos Reais Implementados**

### ✅ **Chat - README Correto**

```markdown
### 💬 Sistema de Conversação

- **Streaming em Tempo Real**: Respostas fluidas com streaming de texto
- **Múltiplos Provedores**: OpenAI, Anthropic, Google, Azure e outros
- **Sessões Persistentes**: Histórico de conversas organizadas

## 🔗 Integração com AI Studio

- **Modelos**: Busca e utiliza modelos configurados no AI Studio
- **Agentes**: Integra agentes personalizados criados
- **Service Layer**: Comunicação via `AiStudioService`
```

### ✅ **Chat - Referência no Código Implementada**

```typescript
/**
 * 💬 CHAT SUBAPP - Página Principal
 *
 * 📚 DOCUMENTAÇÃO:
 * - Arquitetura SubApp: @docs/architecture/subapp-architecture.md
 * - Chat Overview: @docs/subapps/chat/README.md
 * - Chat Features: @docs/subapps/chat/Chat_Session_Edit_Feature.md
 * - Team Config: @docs/subapps/chat/Chat_Team_Config_System.md
 * - API Reference: @docs/subapps/chat/Chat_API_Reference.md
 * - Streaming: @docs/subapps/chat/Chat_Streaming_Implementation.md
 *
 * 🔗 SUBPASTA DOCUMENTAÇÃO: docs/subapps/chat/
 *
 * 🎯 FUNCIONALIDADES:
 * - Conversas em tempo real com streaming
 * - Sessões persistentes com histórico
 * - Múltiplos provedores de IA (OpenAI, Anthropic, Google, etc.)
 * - Edição de mensagens
 * - Configurações por team com modelo padrão persistente
 * - Interface responsiva estilo ChatGPT
 */
```

---

## 📋 **Processo de Validação Completo**

### **Checklist para Novos SubApps**

#### **📝 Documentação Escrita:**

- [ ] README segue template padrão?
- [ ] Não explica padrões arquiteturais gerais?
- [ ] Foca apenas nas funcionalidades únicas deste SubApp?
- [ ] Links para docs específicas estão organizados por categoria?
- [ ] Seção de integração menciona apenas dependências específicas?

#### **🔗 Referências no Código:**

- [ ] Comentário adicionado no topo da página principal?
- [ ] Ícone apropriado selecionado?
- [ ] Referência à arquitetura SubApp incluída?
- [ ] Link para README específico do SubApp?
- [ ] Subpasta de documentação especificada?
- [ ] Principais funcionalidades listadas?

### **Review Process**

1. **Auto-Review**: Usar checklist acima
2. **Peer Review**: Outro desenvolvedor valida se segue padrões
3. **Tech Lead Review**: Verificação de consistência com outros SubApps

---

## 📂 **Organização de Arquivos**

### **Estrutura Recomendada por SubApp**

```
docs/subapps/[subapp-name]/
├── README.md                 # Overview + Links (seguir template)
├── [feature]-guide.md        # Guias específicos de funcionalidades
├── [configuration].md        # Configurações específicas
├── troubleshooting.md        # Resolução de problemas específicos
└── api-reference.md          # Se houver APIs específicas expostas
```

### **Arquivos que DEVEM ficar em `docs/architecture/`**

- Padrões de desenvolvimento (frontend, backend)
- Comunicação entre SubApps (Service Layer)
- Estruturas de projeto
- Fluxos de autenticação/autorização
- Padrões de teste
- Deployment e CI/CD

---

## 🎯 **Objetivos do Guia Consolidado**

1. **🔍 Descoberta Rápida**: Desenvolvedores encontram o que precisam rapidamente
2. **📋 Manutenção Simples**: Mudanças em um lugar só
3. **🔄 Consistência**: Todos os SubApps seguem mesmo padrão
4. **📚 Escalabilidade**: Fácil adicionar novos SubApps
5. **🎯 Foco**: Cada documentação tem propósito claro
6. **🤖 AI-Friendly**: Cursor AI encontra facilmente referências no código

## 📋 **Documentação Relacionada**

- **[SubApp Architecture](./subapp-architecture.md)** - Arquitetura e padrões técnicos de SubApps
- **[Backend Guide](./backend-guide.md)** - Padrões de desenvolvimento backend
- **[Frontend Guide](./frontend-guide.md)** - Padrões de desenvolvimento frontend
````
