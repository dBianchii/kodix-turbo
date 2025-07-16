<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: overview
complexity: advanced
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# 📦 Documentação de Componentes - Kodix

Esta documentação fornece uma visão abrangente de todos os componentes utilizados no ecossistema Kodix, organizados por categorias e localizações.

## 📂 Estrutura de Componentes

### 🎨 **UI Library (packages/ui/src/)**

Biblioteca principal de componentes reutilizáveis baseada em Radix UI e Tailwind CSS.

### 🌐 **App Components (apps/kdx/src/)**

Componentes específicos da aplicação web principal.

### 📱 **Mobile Components (apps/care-expo/src/)**

Componentes específicos para a aplicação mobile React Native.

---

## 🎨 UI Library - packages/ui/src/

### **Componentes de Interface Básica**

#### **Button (`button.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Botões com diferentes variantes e tamanhos
- **Funcionalidades**: Estados hover, focus, disabled, loading
- **Dependências**: `class-variance-authority`, `@radix-ui/react-slot`

#### **Input (`input.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Campos de entrada de texto básicos
- **Funcionalidades**: Estados focus, error, disabled
- **Estilos**: Bordas arredondadas, transições suaves

#### **Textarea (`textarea.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Campos de texto multi-linha
- **Funcionalidades**: Redimensionamento vertical, estados focus/error

#### **Label (`label.tsx`)**

- **Uso**: Rótulos para campos de formulário
- **Funcionalidades**: Associação com inputs, estados error
- **Dependências**: `@radix-ui/react-label`

#### **Checkbox (`checkbox.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Caixas de seleção
- **Funcionalidades**: Estados checked, indeterminate, disabled
- **Dependências**: `@radix-ui/react-checkbox`

#### **Radio Group (`radio-group.tsx`)**

- **Uso**: Grupos de botões de rádio
- **Funcionalidades**: Seleção única, navegação por teclado
- **Dependências**: `@radix-ui/react-radio-group`

#### **Switch (`switch.tsx`)**

- **Uso**: Interruptores on/off
- **Funcionalidades**: Estados checked, disabled, animações
- **Dependências**: `@radix-ui/react-switch`

#### **Select (`select.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface SelectProps {
  // Wrapper completo para Radix UI Select
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Dropdowns de seleção
- **Funcionalidades**: Busca, multi-seleção, grupos
- **Dependências**: `@radix-ui/react-select`

### **Componentes de Layout**

#### **Card (`card.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Componentes**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Uso**: Containers para conteúdo agrupado
- **Funcionalidades**: Sombras, bordas, espaçamento consistente

#### **Separator (`separator.tsx`)**

- **Uso**: Linhas divisórias horizontal/vertical
- **Funcionalidades**: Orientação configurável
- **Dependências**: `@radix-ui/react-separator`

#### **Scroll Area (`scroll-area.tsx`)**

- **Uso**: Áreas com scroll customizado
- **Funcionalidades**: Scroll horizontal/vertical, indicadores
- **Dependências**: `@radix-ui/react-scroll-area`

#### **Resizable (`resizable.tsx`)**

- **Uso**: Painéis redimensionáveis
- **Funcionalidades**: Resize handles, constraints
- **Dependências**: `react-resizable-panels`

#### **Sidebar (`sidebar.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface SidebarProps {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Barras laterais de navegação
- **Funcionalidades**: Colapsável, responsivo, múltiplas variantes
- **Componentes**: Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, etc.

### **Componentes de Navegação**

#### **Navigation Menu (`navigation-menu/`)**

- **Uso**: Menus de navegação complexos
- **Funcionalidades**: Submenus, indicadores, animações
- **Dependências**: `@radix-ui/react-navigation-menu`

#### **Dropdown Menu (`dropdown-menu.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface DropdownMenuProps {
  // Wrapper completo para Radix UI DropdownMenu
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Menus dropdown contextuais
- **Funcionalidades**: Submenus, separadores, atalhos de teclado
- **Dependências**: `@radix-ui/react-dropdown-menu`

#### **Context Menu (`context-menu.tsx`)**

- **Uso**: Menus de contexto (clique direito)
- **Funcionalidades**: Similar ao dropdown, ativado por contexto
- **Dependências**: `@radix-ui/react-context-menu`

#### **Command (`command.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface CommandProps {
  // Command palette / search interface
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Paleta de comandos / interface de busca
- **Funcionalidades**: Busca fuzzy, navegação por teclado, grupos
- **Dependências**: `cmdk`

#### **Tabs (`tabs.tsx`)**

- **Uso**: Interfaces com abas
- **Funcionalidades**: Navegação por teclado, orientação configurável
- **Dependências**: `@radix-ui/react-tabs`

### **Componentes de Feedback**

#### **Alert (`alert.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Mensagens de alerta/notificação
- **Funcionalidades**: Variantes coloridas, ícones, descrições

#### **Alert Dialog (`alert-dialog.tsx`)**

- **Uso**: Diálogos de confirmação
- **Funcionalidades**: Modal, escape handling, focus trap
- **Dependências**: `@radix-ui/react-alert-dialog`

#### **Dialog (`dialog.tsx`)**

- **Uso**: Modais e diálogos gerais
- **Funcionalidades**: Overlay, focus management, animações
- **Dependências**: `@radix-ui/react-dialog`

#### **Drawer (`drawer.tsx`)**

- **Uso**: Gavetas deslizantes (mobile-first)
- **Funcionalidades**: Swipe gestures, snap points
- **Dependências**: `vaul`

#### **Sheet (`sheet.tsx`)**

- **Uso**: Painéis laterais deslizantes
- **Funcionalidades**: Múltiplas direções, overlay
- **Dependências**: `@radix-ui/react-dialog`

#### **Toast (`toast.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface ToastProps {
  variant?: "default" | "destructive";
  // Sistema de notificações temporárias
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Notificações temporárias
- **Funcionalidades**: Auto-dismiss, stacking, posicionamento
- **Dependências**: `@radix-ui/react-toast`

#### **Tooltip (`tooltip.tsx`)**

- **Uso**: Dicas contextuais
- **Funcionalidades**: Delay configurável, posicionamento
- **Dependências**: `@radix-ui/react-tooltip`

#### **Popover (`popover.tsx`)**

- **Uso**: Popovers para conteúdo adicional
- **Funcionalidades**: Posicionamento inteligente, trigger customizável
- **Dependências**: `@radix-ui/react-popover`

### **Componentes de Dados**

#### **Table (`table.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Componentes: Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Tabelas de dados
- **Funcionalidades**: Responsivo, estilos consistentes

#### **Data Table (`data-table/`)**

- **Uso**: Tabelas avançadas com funcionalidades
- **Funcionalidades**: Sorting, filtering, pagination, selection
- **Dependências**: `@tanstack/react-table`

#### **Badge (`badge.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Etiquetas e status indicators
- **Funcionalidades**: Múltiplas variantes, tamanhos

#### **Avatar (`avatar.tsx`)**

- **Uso**: Avatares de usuário
- **Funcionalidades**: Fallback, imagens, iniciais
- **Dependências**: `@radix-ui/react-avatar`

#### **Avatar Wrapper (`avatar-wrapper.tsx`)**

- **Uso**: Wrapper para avatares com funcionalidades extras
- **Funcionalidades**: Status indicators, badges

#### **Skeleton (`skeleton.tsx`)**

- **Uso**: Placeholders para loading states
- **Funcionalidades**: Animação shimmer, múltiplos tamanhos

### **Componentes de Entrada de Tempo**

#### **Calendar (`calendar.tsx`)**

- **Uso**: Seletor de datas
- **Funcionalidades**: Range selection, navigation, localization
- **Dependências**: `react-day-picker`

#### **Date Picker (`date-time-picker.tsx`)**

- **Uso**: Seletor completo de data e hora
- **Funcionalidades**: Timezone support, formats, validation

#### **Time Picker (`time-picker.tsx`)**

- **Uso**: Seletor de horário
- **Funcionalidades**: 12/24h format, step intervals

### **Componentes de Formulário**

#### **Form (`form.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface FormProps {
  // Wrapper para react-hook-form com validação
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Sistema completo de formulários
- **Funcionalidades**: Validação, estados error, labels automáticos
- **Dependências**: `react-hook-form`, `@hookform/resolvers`

### **Componentes Especializados**

#### **KBD (`kbd.tsx`)**

- **Uso**: Representação visual de teclas de teclado
- **Funcionalidades**: Múltiplos estilos, combinações

#### **Toggle (`toggle.tsx`)**

- **Uso**: Botões de alternância
- **Funcionalidades**: Estados pressed, variants
- **Dependências**: `@radix-ui/react-toggle`

#### **Typography (`typography.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface TypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "blockquote"
    | "code"
    | "lead"
    | "large"
    | "small"
    | "muted";
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Sistema de tipografia consistente
- **Funcionalidades**: Hierarquia visual, espaçamentos

#### **Theme (`theme.tsx`)**

- **Uso**: Provider de tema
- **Funcionalidades**: Dark/light mode, system preference

#### **Credenza (`credenza.tsx`)**

- **Uso**: Componente modal responsivo
- **Funcionalidades**: Desktop dialog, mobile drawer

### **Componentes de Animação**

#### **Magic UI (`magic-ui/`)**

- **Uso**: Componentes com animações especiais
- **Funcionalidades**: Efeitos visuais avançados

#### **Aceternity (`aceternity/`)**

- **Uso**: Componentes de UI premium
- **Funcionalidades**: Animações complexas, efeitos especiais

#### **Origin UI (`origin-ui/`)**

- **Uso**: Componentes de design system
- **Funcionalidades**: Consistência visual

### **Hooks Customizados**

#### **Hooks (`hooks/`)**

- **use-media-query**: Responsividade
- **use-mobile**: Detecção de mobile
- **use-toast**: Sistema de notificações

### **Stores/Estado**

#### **Stores (`stores/`)**

- **Uso**: Gerenciamento de estado global
- **Funcionalidades**: Zustand stores, persistência

---

## 🌐 App Components - apps/kdx/src/

### **Componentes Globais (\_components/)**

#### **Theme Provider (`theme-provider.tsx`)**

- **Uso**: Provedor de tema global
- **Funcionalidades**: Dark/light mode, persistência

#### **Navigation (`navigation.tsx`)**

- **Uso**: Navegação principal da aplicação
- **Funcionalidades**: Menu responsivo, active states

#### **Max Width Wrapper (`max-width-wrapper.tsx`)**

- **Uso**: Container com largura máxima
- **Funcionalidades**: Centralização, breakpoints responsivos

#### **Tailwind Indicator (`tailwind-indicator.tsx`)**

- **Uso**: Indicador de breakpoint atual (desenvolvimento)
- **Funcionalidades**: Exibição do breakpoint ativo

#### **Footer (`footer.tsx`)**

- **Uso**: Rodapé da aplicação
- **Funcionalidades**: Links, informações corporativas

### **Componentes de Header (header/)**

#### **Header (`header.tsx`)**

- **Uso**: Cabeçalho principal
- **Funcionalidades**: Navigation, user menu, notificações

#### **Logo (`logo.tsx`)**

- **Uso**: Logo da aplicação
- **Funcionalidades**: Responsivo, link para home

#### **User Profile Button (`user-profile-button.tsx`)**

- **Uso**: Menu do perfil do usuário
- **Funcionalidades**: Avatar, dropdown menu, logout

#### **Notifications Popover (`notifications-popover-client.tsx`)**

- **Uso**: Popover de notificações
- **Funcionalidades**: Lista de notificações, mark as read

#### **I18n Picker (`i18n-picker.tsx`)**

- **Uso**: Seletor de idioma
- **Funcionalidades**: Múltiplos idiomas, persistência

### **Componentes de App (app/)**

#### **Kodix Icon (`kodix-icon.tsx`)**

- **Uso**: Ícone da marca Kodix
- **Funcionalidades**: Múltiplos tamanhos, variantes

#### **Kodix App (`kodix-app.tsx`)**

- **Uso**: Card de aplicativo
- **Funcionalidades**: Navegação para apps, status

### **App Switcher (app-switcher/)**

#### **App Switcher Client (`app-switcher-client.tsx`)**

- **Uso**: Alternador de aplicativos
- **Funcionalidades**: Lista de apps, navegação rápida

### **Componentes de Data**

#### **Date Picker (`date-picker.tsx`)**

- **Uso**: Seletor de data simples
- **Funcionalidades**: Calendar popup, validation

#### **Date Picker With Presets (`date-picker-with-presets.tsx`)**

- **Uso**: Seletor de data com presets
- **Funcionalidades**: Presets comuns (hoje, ontem, etc.)

#### **Frequency Picker (`frequency-picker.tsx`)**

- **Uso**: Seletor de frequência/recorrência
- **Funcionalidades**: Daily, weekly, monthly, custom

### **PostHog Integration (posthog-page-view/)**

#### **PostHog Provider (`posthog-provider.tsx`)**

- **Uso**: Provider para analytics
- **Funcionalidades**: Event tracking, user identification

#### **PostHog Page View (`posthog-page-view.tsx`)**

- **Uso**: Tracking de visualizações de página
- **Funcionalidades**: Automatic page tracking

### **Componentes Hero**

#### **Hero Bento (`hero-bento.tsx`)**

- **Uso**: Layout bento para landing page
- **Funcionalidades**: Grid responsivo, animações

#### **Hero Lamp (`hero-lamp.tsx`)**

- **Uso**: Efeito visual de lâmpada
- **Funcionalidades**: Animação de luz, gradientes

### **Componentes de Apps Específicos**

#### **AI Studio (\_components/)**

```
├── sections/
│   ├── agents-section.tsx      # Gerenciamento de agentes
│   ├── libraries-section.tsx   # Gerenciamento de bibliotecas
│   ├── models-section.tsx      # Gerenciamento de modelos
│   ├── providers-section.tsx   # Gerenciamento de provedores
│   └── tokens-section.tsx      # Gerenciamento de tokens
├── ai-studio-content.tsx       # Container principal
└── app-sidebar.tsx            # Sidebar de navegação
```

#### **Chat (\_components/)**

- **Uso**: Componentes do sistema de chat
- **Funcionalidades**: Mensagens, conversas, AI integration

#### **Calendar (\_components/)**

- **Uso**: Componentes do sistema de calendário
- **Funcionalidades**: Eventos, agendamentos, visualizações

#### **Todo (\_components/)**

- **Uso**: Componentes do sistema de tarefas
- **Funcionalidades**: Lista de tarefas, categorias, status

#### **Cupom (\_components/)**

- **Uso**: Componentes do sistema de cupons
- **Funcionalidades**: Criação, validação, aplicação

#### **Kodix Care (\_components/)**

- **Uso**: Componentes do sistema de cuidados
- **Funcionalidades**: Plantões, configurações, onboarding

### **Componentes de Autenticação**

#### **Auth Pages (\_components/)**

- **SignIn Components**: Login, forgot password
- **SignUp Components**: Registro, verificação

### **Componentes de Team**

#### **Team Settings (\_components/)**

- **General**: Configurações gerais do team
- **Members**: Gerenciamento de membros
- **Permissions**: Controle de permissões

#### **Team Notifications (\_components/)**

- **Uso**: Notificações do team
- **Funcionalidades**: Configurações, tipos de notificação

### **Componentes de Account**

#### **Account General (\_components/)**

- **Edit Account Name**: Edição do nome
- **Edit Teams**: Gerenciamento de teams
- **Delete Account**: Exclusão de conta
- **Add Team Dialog**: Criação de team

#### **Account Teams (\_components/)**

- **Teams Table**: Lista de teams
- **Team Actions**: Ações nos teams

---

## 📱 Mobile Components - apps/care-expo/src/

### **Componentes Base (components/)**

#### **Safe Area View (`safe-area-view.tsx`)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface SafeAreaViewProps {
  // Wrapper para safe area em dispositivos móveis
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Container seguro para conteúdo móvel
- **Funcionalidades**: Padding para notch, status bar

#### **Avatar Wrapper (`avatar-wrapper.tsx`)**

- **Uso**: Avatar para mobile
- **Funcionalidades**: Touch interactions, loading states

#### **Loading Spinner (`loading-spinner.tsx`)**

- **Uso**: Indicador de carregamento
- **Funcionalidades**: Animação suave, múltiplos tamanhos

#### **Menu List Item (`menu-list-item.tsx`)**

- **Uso**: Item de menu para listas
- **Funcionalidades**: Touch feedback, ícones, navegação

#### **Toggle Theme Button (`toggle-theme-button.tsx`)**

- **Uso**: Alternador de tema móvel
- **Funcionalidades**: Animação, persistência

#### **Dismiss Keyboard (`dismiss-keyboard.tsx`)**

- **Uso**: Wrapper para dispensar teclado
- **Funcionalidades**: Touch outside to dismiss

#### **Sheet Modal (`sheet-modal.tsx`)**

- **Uso**: Modal estilo sheet nativo
- **Funcionalidades**: Swipe gestures, snap points

#### **Date Time Picker (`date-time-picker.tsx`)**

- **Uso**: Seletor de data/hora móvel
- **Funcionalidades**: Native picker integration

### **Componentes de Form (components/form.tsx)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Form components específicos para mobile
interface FormProps {
  // React Hook Form integration para mobile
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **Uso**: Sistema de formulários móvel
- **Funcionalidades**: Validação, keyboard handling, accessibility

### **Componentes de Home (\_components/)**

#### **Header (`header.tsx`)**

- **Uso**: Cabeçalho do home móvel
- **Funcionalidades**: Avatar, navigation, status bar

---

## 🚀 Padrões de Uso

### **Convenções de Nomenclatura**

- **PascalCase**: Para nomes de componentes
- **kebab-case**: Para nomes de arquivos
- **Sufixos**: `-client.tsx` para client components, `-server.tsx` para server components

### **Estrutura de Arquivos**

```
component-name/
├── index.tsx              # Export principal
├── component-name.tsx     # Implementação
├── types.ts              # TypeScript types
├── hooks.ts              # Hooks específicos
└── utils.ts              # Utilities
```

### **Props Pattern**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Composição**

- **Compound Components**: Card + CardHeader + CardContent
- **Polymorphic Components**: Uso de `asChild` prop
- **Forwarded Refs**: Para todos os componentes de UI

### **Acessibilidade**

- **ARIA Labels**: Em todos os componentes interativos
- **Keyboard Navigation**: Suporte completo
- **Focus Management**: Trap e restoration
- **Screen Reader**: Descrições e estados

### **Performance**

- **Lazy Loading**: Para componentes pesados
- **Memoization**: React.memo em componentes puros
- **Bundle Splitting**: Separação por features

---

## 📚 Guias de Desenvolvimento

### **Criando Novos Componentes**

1. **Definir Interface**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary";
  children: React.ReactNode;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

2. **Implementar com forwardRef**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-styles', variantStyles[variant], className)}
        {...props}
      />
    )
  }
)
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

3. **Exportar com Display Name**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
NewComponent.displayName = "NewComponent";
export { NewComponent };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Estendendo Componentes Existentes**

1. **Wrapper Components**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface ExtendedButtonProps extends ButtonProps {
  loading?: boolean
}

const ExtendedButton = ({ loading, children, ...props }: ExtendedButtonProps) => {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? <Spinner /> : children}
    </Button>
  )
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

2. **Variant Extensions**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
const buttonVariants = cva(baseStyles, {
  variants: {
    variant: {
      ...existingVariants,
      new: "new-variant-styles",
    },
  },
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Testing Components**

1. **Unit Tests**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { render, screen } from '@testing-library/react'
import { Component } from './component'

test('renders correctly', () => {
  render(<Component>Test</Component>)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

2. **Integration Tests**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { renderHook } from "@testing-library/react";

import { useComponent } from "./hooks";

test("hook works correctly", () => {
  const { result } = renderHook(() => useComponent());
  expect(result.current).toBeDefined();
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Documentação**

1. **JSDoc Comments**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
/**
 * A versatile button component with multiple variants and sizes.
 *
 * @param variant - The visual style variant
 * @param size - The size of the button
 * @param asChild - Render as child component
 */
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

2. **Storybook Stories**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export default {
  title: "Components/Button",
  component: Button,
} as Meta;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🚀 🔧 Configuração e Setup

### **Dependências Principais**

- **Radix UI**: Componentes acessíveis e unstyled
- **Tailwind CSS**: Styling utility-first
- **Class Variance Authority**: Variant management
- **React Hook Form**: Form handling
- **Framer Motion**: Animações
- **Lucide React**: Ícones

### **Ferramentas de Desenvolvimento**

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Storybook**: Component documentation
- **Jest**: Unit testing
- **Playwright**: E2E testing

### **Build Process**

- **Turbo**: Monorepo build orchestration
- **tsup**: TypeScript bundling
- **Rollup**: Library bundling

---

## 📈 Roadmap

### **Próximas Implementações**

- [ ] Componentes de Data Visualization
- [ ] Advanced Form Components
- [ ] Animation Presets
- [ ] Mobile-specific Components
- [ ] Accessibility Improvements
- [ ] Performance Optimizations

### **Melhorias Planejadas**

- [ ] Better TypeScript Support
- [ ] Enhanced Documentation
- [ ] More Testing Coverage
- [ ] Design Token System
- [ ] Theme Customization
- [ ] Component Composition Guides

---

## 🤝 Contribuição

Para contribuir com novos componentes ou melhorias:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** seguindo os padrões estabelecidos
4. **Teste** thoroughly
5. **Documente** o componente
6. **Submeta** um Pull Request

### **Review Checklist**

- [ ] Acessibilidade implementada
- [ ] TypeScript types definidos
- [ ] Testes unitários escritos
- [ ] Documentação atualizada
- [ ] Performance otimizada
- [ ] Responsive design
- [ ] Browser compatibility

---

_Esta documentação é mantida atualizada conforme novos componentes são adicionados ao sistema._

<!-- AI-CONTEXT-BOUNDARY: end -->
