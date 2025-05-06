# Guia de Desenvolvimento do Agent Chat

Este guia fornece instruções detalhadas para desenvolvedores que desejam contribuir ou estender a funcionalidade do componente Agent Chat.

## Pré-requisitos

Antes de começar a desenvolver, certifique-se de ter:

- Node.js (versão 20.18.1 ou superior)
- pnpm (versão 9.14.2 ou superior)
- Uma chave de API válida da OpenAI

## Configuração do Ambiente

1. Clone o repositório:

   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd kodix-turbo
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Configure a chave da API da OpenAI:

   ```bash
   cd apps/agent-chat
   echo "OPENAI_API_KEY=sk-sua-chave-aqui" > .env.local
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   cd ../..  # Volte para a raiz do monorepo
   pnpm run dev:agent
   ```

## Estrutura e Arquitetura

### Componentes React

O Agent Chat segue uma arquitetura de componentes modular:

#### ChatWindow (app/components/chat-window.tsx)

- Componente principal que gerencia o estado da conversa
- Responsável pela comunicação com a API e processamento das respostas
- Implementa o padrão de streaming para exibição de respostas em tempo real

```tsx
// Exemplo de uso do ChatWindow
import { ChatWindow } from "./components/chat-window";

export default function Page() {
  return (
    <main className="h-screen bg-[#121212] text-white">
      <ChatWindow />
    </main>
  );
}
```

#### InputBox (app/components/input-box.tsx)

- Gerencia a entrada de texto do usuário
- Controla estados de habilitação/desabilitação
- Responsável pela validação antes do envio

```tsx
// Props do InputBox
interface InputBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}
```

#### Message (app/components/message.tsx)

- Renderiza as mensagens na interface
- Diferencia visualmente mensagens do usuário e do assistente

```tsx
// Exemplo de renderização de mensagens
<div className="flex-1 space-y-2 overflow-y-auto p-4">
  {messages.map((msg, idx) => (
    <Message key={idx} role={msg.role} content={msg.content} />
  ))}
</div>
```

### API Route (app/api/agent/route.ts)

O endpoint da API é implementado usando o App Router do Next.js:

```typescript
// Exemplo simplificado da função de handler
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Processamento com a API da OpenAI
  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    messages,
  });

  // Streaming da resposta para o cliente
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
```

## Fluxo de Desenvolvimento

### Adicionando Novos Modelos de IA

Para adicionar suporte a outros modelos além da OpenAI:

1. Instale o SDK correspondente:

   ```bash
   pnpm add @ai-sdk/[PROVEDOR] --filter=@kdx/agent-chat
   ```

2. Modifique o arquivo `app/api/agent/route.ts`:

   ```typescript
   import { anthropic } from "@ai-sdk/anthropic"; // Exemplo com Anthropic
   import { openai } from "@ai-sdk/openai";
   import { streamText } from "ai";

   // Implementação do novo provedor
   const modelProvider = useOpenAI
     ? openai("gpt-3.5-turbo")
     : anthropic("claude-3-opus-20240229");
   ```

### Personalização da Interface

Para modificar o estilo da interface:

1. Edite o componente Message para alterar a aparência das mensagens:

   ```tsx
   export function Message({
     role,
     content,
   }: {
     role: string;
     content: string;
   }) {
     return (
       <div
         className={`rounded-lg p-3 ${
           role === "user"
             ? "self-end bg-blue-600 text-white" // Estilo para mensagens do usuário
             : "self-start bg-gray-800 text-white" // Estilo para mensagens do assistente
         }`}
       >
         {content}
       </div>
     );
   }
   ```

2. Para adicionar suporte a markdown ou formatação de código, instale e utilize uma biblioteca como `react-markdown`:
   ```bash
   pnpm add react-markdown --filter=@kdx/agent-chat
   ```

### Implementação de Testes

Recomenda-se adicionar testes unitários e de integração:

1. Crie uma pasta `__tests__` na raiz do projeto:

   ```bash
   mkdir -p apps/agent-chat/__tests__
   ```

2. Exemplo de teste de componente usando Vitest:

   ```tsx
   // __tests__/input-box.test.tsx
   import { fireEvent, render, screen } from "@testing-library/react";
   import { describe, expect, it, vi } from "vitest";

   import { InputBox } from "../app/components/input-box";

   describe("InputBox", () => {
     it("should call onSend when button is clicked", () => {
       const mockOnSend = vi.fn();
       render(<InputBox onSend={mockOnSend} />);

       const input = screen.getByPlaceholderText("Digite sua mensagem...");
       fireEvent.change(input, { target: { value: "Teste" } });

       const button = screen.getByText("Enviar");
       fireEvent.click(button);

       expect(mockOnSend).toHaveBeenCalledWith("Teste");
     });
   });
   ```

## Depuração

### Logs no Frontend

O componente ChatWindow implementa logs detalhados para facilitar a depuração:

```typescript
// Exemplo de logs no componente
useEffect(() => {
  console.log("⏱️ Estado de carregamento mudou:", isLoading);
}, [isLoading]);

// Logs durante o envio de mensagens
console.log("📤 Enviando mensagem:", text);
```

### Logs no Backend

O endpoint da API também inclui logs para rastreamento do fluxo:

```typescript
// Logs no endpoint da API
console.log("🔵 [API] POST recebido");
console.log("🟢 [API] Mensagens recebidas:", messages);
```

Para visualizar todos os logs:

1. Abra as ferramentas de desenvolvedor do navegador (F12)
2. Navegue até a aba "Console"
3. Filtre os logs usando termos como "[API]" para backend ou emojis específicos

## Boas Práticas

1. **Gerenciamento de Estado**: Mantenha o estado em componentes de alto nível e passe por props
2. **Tratamento de Erros**: Implemente tratamento de erros em todos os níveis da aplicação
3. **Componentes Pequenos**: Divida componentes grandes em componentes menores e mais específicos
4. **Tipagem**: Use TypeScript para todos os componentes e funções
5. **Comentários**: Documente código complexo ou lógica de negócio importante

## Problemas Comuns e Soluções

### Erro de Chave de API

Se receber erros relacionados à chave da API:

```
Erro de configuração: Chave da API OpenAI não configurada
```

Verifique se:

1. O arquivo `.env.local` existe e contém a chave OPENAI_API_KEY
2. A chave é válida e não expirou
3. O Next.js está carregando as variáveis de ambiente corretamente

### Problemas de Streaming

Se a resposta não estiver sendo exibida em tempo real:

1. Verifique se o navegador suporta Fetch API com streaming
2. Confirme que não há middleware ou proxy bloqueando streams
3. Verifique os logs para identificar quebras no fluxo de dados

## Recursos Adicionais

- [Documentação da OpenAI](https://platform.openai.com/docs/api-reference)
- [Documentação do Next.js](https://nextjs.org/docs)
- [AI.js Documentation](https://sdk.vercel.ai/docs)
- [Documentação do Turborepo](https://turbo.build/repo/docs)
