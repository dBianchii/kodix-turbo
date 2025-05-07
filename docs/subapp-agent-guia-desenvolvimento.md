# Guia de Desenvolvimento do SubApp Agent

Este guia fornece instruções detalhadas para desenvolvedores que desejam manter, estender ou modificar o SubApp Agent integrado ao Kodix.

## Pré-requisitos

Antes de começar a trabalhar no SubApp Agent, certifique-se de ter:

- Configurado o ambiente de desenvolvimento Kodix conforme documentação principal
- Uma chave válida da API OpenAI
- Familiaridade com React, Next.js e TypeScript
- Compreensão básica dos conceitos de streaming e LLMs

## Configuração do Ambiente

1. Certifique-se de que todas as dependências do projeto Kodix estão instaladas:

   ```bash
   pnpm install
   ```

2. Configure a chave da API OpenAI no arquivo `.env` na raiz do projeto:

   ```bash
   echo "OPENAI_API_KEY=sk-sua-chave-aqui" >> .env
   ```

3. Inicie o servidor de desenvolvimento do Kodix:

   ```bash
   pnpm dev:kdx
   ```

4. Acesse o SubApp Agent em `http://localhost:3000/pt-BR/apps/agent` (ou outro idioma configurado)

## Estrutura e Arquitetura

### Componentes

O SubApp Agent segue uma arquitetura modular com componentes React:

#### ChatWindow

Responsável pelo gerenciamento do estado da conversa e comunicação com a API.

```tsx
// Estrutura principal
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Função para enviar mensagens
async function sendMessage(text: string) {
  // Implementação com fetch e streaming
}

// Interface com input flutuante
return (
  <div className="flex h-full flex-col bg-[#121212]">
    <div className="flex-1 overflow-y-auto">{/* Mensagens */}</div>
    <div className="absolute bottom-6 left-0 w-full">{/* InputBox */}</div>
  </div>
);
```

#### InputBox

Componente para entrada de texto do usuário com validação e feedback visual.

```tsx
// Props do InputBox
interface InputBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

// Implementação básica
export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  // Renderização com estilo condicional
}
```

#### Message

Componente simples para exibição de mensagens com estilos condicionais.

```tsx
interface MessageProps {
  role: "agent" | "user";
  content: string;
}

export function Message({ role, content }: MessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-lg px-4 py-2 ${role === "user" ? "bg-blue-600" : "bg-gray-700"}`}
      >
        {content}
      </div>
    </div>
  );
}
```

### API

O endpoint da API utiliza as rotas do Next.js e o SDK da Vercel AI para streaming:

```typescript
// Importações para o SDK da Vercel AI
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Função handler do endpoint
export async function POST(req: Request) {
  // 1. Extrair e validar as mensagens
  // 2. Verificar a chave da API
  // 3. Formatar as mensagens para compatibilidade
  // 4. Criar stream com a biblioteca AI.js
  // 5. Retornar resposta com streaming
}
```

## Fluxo de Desenvolvimento

### Modificando Componentes Existentes

Para modificar os componentes existentes, siga estas diretrizes:

1. **Mantenha o padrão de tipagem** - Use TypeScript corretamente para todas as props e estado
2. **Preserve os estilos visuais** - Mantenha a consistência com o design system do Kodix
3. **Teste cuidadosamente** - Verifique todas as interações, especialmente o streaming

### Adicionando Novos Modelos de IA

Para adicionar suporte a outros modelos além da OpenAI:

1. Instale o SDK correspondente:

   ```bash
   pnpm add @ai-sdk/[PROVEDOR] --filter=@kdx/kdx
   ```

2. Modifique o endpoint da API para usar o novo modelo:

   ```typescript
   // Exemplo para adicionar suporte ao Anthropic
   import { anthropic } from "@ai-sdk/anthropic";

   // Implemente um seletor de modelo
   const modelProvider = useAnthropicModel
     ? anthropic("claude-3-opus-20240229")
     : openai("gpt-3.5-turbo");

   const result = await streamText({
     model: modelProvider,
     messages: formattedMessages,
   });
   ```

3. Atualize a interface do usuário para permitir a seleção de modelos, se necessário.

### Personalizando a Interface

Para modificar a aparência do chat:

1. Ajuste o componente `Message` para alterar o estilo das mensagens:

   ```tsx
   <div
     className={`max-w-[80%] rounded-lg px-4 py-2 ${
       role === "user"
         ? "bg-blue-600 text-white" // Estilo para usuário
         : "bg-gray-700 text-white" // Estilo para agente
     }`}
   >
     {content}
   </div>
   ```

2. Modifique o layout do `ChatWindow` conforme necessário, mantendo a estrutura principal.

3. Para personalização mais avançada, considere adicionar temas ou opções de configuração via Context API.

### Implementando Funcionalidades Avançadas

#### Histórico de Conversas

Para implementar armazenamento de histórico:

1. Crie um modelo de dados para conversas em `packages/db/src/schema/apps/agentChat.ts`
2. Implemente um repositório para operações de salvamento e recuperação
3. Adicione endpoints tRPC para interagir com o histórico
4. Modifique o `ChatWindow` para carregar e salvar conversas

#### Suporte a Mídia

Para adicionar suporte a imagens ou outros tipos de mídia:

1. Atualize o tipo `ChatMessage` para suportar diferentes tipos de conteúdo:

   ```typescript
   interface ChatMessage {
     role: MessageRole;
     content: string;
     type?: "text" | "image" | "file";
     media?: {
       url?: string;
       alt?: string;
     };
   }
   ```

2. Modifique o componente `Message` para renderizar condicionalmente diferentes tipos de conteúdo
3. Atualize o endpoint da API para lidar com uploads e processamento de mídia

## Depuração

O SubApp Agent inclui logs extensivos para facilitar a depuração:

### Logs no Cliente

O componente `ChatWindow` registra diferentes etapas do processo:

```typescript
console.log("📤 Enviando mensagem:", text);
console.log("🔄 Fazendo requisição para API...");
console.log("📥 Resposta recebida, status:", response.status);
```

### Logs no Servidor

O endpoint da API também inclui logs detalhados:

```typescript
console.log("🔵 [API] POST recebido");
console.log("🟢 [API] Mensagens recebidas:", messages);
console.log("✅ [API] OPENAI_API_KEY encontrada, processando...");
```

Para visualizar logs do servidor, verifique o terminal onde o Kodix está sendo executado.

## Solução de Problemas Comuns

### Erro de Chave da API

**Problema**: Erro "Chave da API OpenAI não configurada"

**Solução**:

1. Verifique se a chave está corretamente definida no arquivo `.env`
2. Certifique-se de que o servidor foi reiniciado após adicionar a chave
3. Confirme que a chave é válida e não expirou

### Problemas de Streaming

**Problema**: Respostas não aparecem em tempo real

**Solução**:

1. Verifique a implementação do processamento de stream no `ChatWindow`
2. Confirme que o endpoint da API está retornando um stream corretamente
3. Examine os cabeçalhos da resposta para garantir que o navegador não esteja fazendo buffer

### Erros de TypeScript

**Problema**: Erros de tipo ao modificar componentes

**Solução**:

1. Verifique as definições de interface (`ChatMessage`, `MessageProps`, etc.)
2. Certifique-se de que todas as props obrigatórias estão sendo fornecidas
3. Use uma tipagem mais precisa em vez de `any` para melhor segurança de tipos

## Padrões de Código

Ao contribuir para o SubApp Agent, siga estes padrões:

1. **Nomenclatura**: Use PascalCase para componentes, camelCase para funções e variáveis
2. **Tipagem**: Defina interfaces ou tipos para todas as props e estados
3. **Funções**: Prefira funções pequenas e focadas em uma única responsabilidade
4. **Estilo**: Siga os padrões de estilo do Kodix usando Tailwind CSS
5. **Comentários**: Documente seções complexas do código para facilitar a manutenção

## Testes

Recomenda-se adicionar testes para os componentes:

```tsx
// Em __tests__/agent/chat-window.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";

import { ChatWindow } from "../../src/app/[locale]/(authed)/apps/agent/_components/chat-window";

describe("ChatWindow", () => {
  it("should render initial message", () => {
    render(<ChatWindow />);
    expect(
      screen.getByText("Olá! Como posso te ajudar hoje?"),
    ).toBeInTheDocument();
  });

  // Mais testes para interação, envio de mensagens, etc.
});
```

## Recursos Adicionais

- [Documentação da Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Documentação da OpenAI](https://platform.openai.com/docs/api-reference)
- [Guia do Next.js sobre APIs de Rota](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Documentação do Streaming no JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [GitHub do projeto ai](https://github.com/vercel/ai)
