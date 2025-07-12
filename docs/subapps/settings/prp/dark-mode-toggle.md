# PRP: Dark Mode Toggle

<!-- AI-METADATA:
category: prp
feature: dark-mode-toggle
complexity: intermediate
estimated-effort: 6
created: 2025-01-07
-->

## 🎯 Goal

Adicionar um toggle de dark mode à página de configurações da conta do usuário que permita alternar entre temas claro e escuro, persistindo a preferência do usuário.

## 📋 Context

Os usuários têm solicitado uma opção de dark mode para reduzir o cansaço visual durante sessões prolongadas de codificação, especialmente ao trabalhar em horários noturnos. O Kodix já possui a infraestrutura básica para dark mode (variáveis CSS, classes Tailwind, next-themes), mas o toggle está disponível apenas em modo de desenvolvimento. Este PRP implementará o toggle de forma permanente e acessível na página de configurações do usuário.

## 👥 Users

- **Primários**: Todos os usuários do Kodix que preferem interfaces escuras
- **Secundários**: Usuários com sensibilidade à luz ou necessidades de acessibilidade visual
- **Casos de uso**:
  - Trabalhar em ambientes com pouca luz
  - Reduzir cansaço visual durante longas sessões
  - Preferência pessoal por interfaces escuras
  - Requisitos de acessibilidade

## ✅ Acceptance Criteria

- [ ] Toggle switch na página de configurações da conta em uma nova seção "Aparência"
- [ ] Tema muda imediatamente sem recarregar a página
- [ ] Preferência do usuário persiste entre sessões (localStorage)
- [ ] Respeita preferência do sistema na primeira visita
- [ ] Todos os componentes UI funcionam corretamente em ambos os temas
- [ ] Transição suave entre temas sem flash
- [ ] Funciona corretamente em dispositivos móveis
- [ ] Textos traduzidos com i18n (no hardcoded strings)
- [ ] Acessível via teclado e screen readers

## 🏗️ Technical Specification

### Architecture

O sistema de temas utilizará a arquitetura existente do Kodix:

- **ThemeProvider** do next-themes já está configurado no layout principal
- Variáveis CSS para cores já estão definidas em `globals.css`
- Classes do Tailwind CSS para dark mode já configuradas
- Componente ThemeToggle já existe mas precisa ser integrado

### Components

**Frontend Components:**

- `AppearanceSettingsCard`: Card de configurações de aparência
- Reutilizar `ThemeToggle` existente de `packages/ui/src/theme.tsx`
- Adicionar à página `/account/general`

**Sem Backend Components:**

- Preferência salva apenas no cliente (localStorage via next-themes)
- Não precisa de endpoints tRPC ou alterações no banco

### Data Flow

1. Usuário acessa página de configurações da conta
2. ThemeProvider detecta tema atual (sistema ou salvo)
3. Usuário clica no toggle/dropdown de tema
4. next-themes atualiza o tema e salva no localStorage
5. Classe `dark` é adicionada/removida do `<html>`
6. Todos componentes re-renderizam com novo tema

### Kodix Stack Integration

**Next.js 15 (App Router):**

- Adicionar card em `app/[locale]/(authed)/account/general/page.tsx`
- ThemeProvider já configurado em `layout.tsx`
- Suporte SSR para evitar flash

**UI (Shadcn/ui + Tailwind):**

- Usar componentes Card existentes
- Classes dark: já configuradas
- Variáveis CSS já definidas

**i18n (next-intl):**

- Adicionar traduções para:
  - "Appearance"
  - "Theme"
  - "Choose your preferred theme"
  - "Light"
  - "Dark"
  - "System"

**Estado:**

- Gerenciado pelo next-themes (não precisa Zustand)
- Persistência via localStorage automática

## 🧪 Testing Requirements

### Unit Tests

- AppearanceSettingsCard renderiza corretamente
- ThemeToggle mostra tema atual
- Mudança de tema atualiza UI
- Preferência do sistema é detectada

### Integration Tests

- Tema persiste após reload da página
- Não há flash ao carregar página
- Funciona com SSR/hidratação

### E2E Tests (se crítico)

- Fluxo completo: acessar configurações → mudar tema → verificar persistência
- Testar em diferentes navegadores

## 🚀 Implementation Plan

### Phase 1: Foundation (2 horas)

1. Criar componente `AppearanceSettingsCard`
2. Adicionar à página de configurações gerais
3. Configurar estrutura e layout
4. Adicionar traduções i18n

### Phase 2: Core Implementation (3 horas)

1. Integrar ThemeToggle no card
2. Configurar lógica de detecção de tema
3. Testar mudança de tema
4. Verificar todos componentes em dark mode
5. Ajustar cores se necessário

### Phase 3: Polish & Testing (1 hora)

1. Adicionar transições suaves
2. Testar em mobile
3. Verificar acessibilidade
4. Escrever testes
5. Documentar uso

## ⚠️ Risks & Mitigations

- **Risco**: Flash de tema errado no carregamento
  - **Mitigação**: Script no head já implementado pelo next-themes
- **Risco**: Componentes não estilizados para dark mode

  - **Mitigação**: Auditar todos componentes, CSS variables já existem

- **Risco**: Conflito com preferência do sistema
  - **Mitigação**: Opção "System" respeita SO do usuário

## 📚 References

- Implementação atual: `packages/ui/src/theme.tsx`
- ThemeProvider: `apps/kdx/src/app/[locale]/layout.tsx`
- Variáveis CSS: `packages/ui/globals.css` e `apps/kdx/src/app/globals.css`
- Configuração Tailwind: `tooling/tailwind/base.ts`
- Página alvo: `apps/kdx/src/app/[locale]/(authed)/account/general/page.tsx`
- Exemplo similar: `apps/kdx/src/app/[locale]/_components/tailwind-indicator.tsx`

<!-- AI-RELATED: [theme-implementation.md, ui-components.md] -->
<!-- DEPENDS-ON: [account-settings-page, theme-provider-setup] -->
<!-- REQUIRED-BY: [user-preferences] -->
<!-- SEE-ALSO: [packages/ui/src/theme.tsx] -->
