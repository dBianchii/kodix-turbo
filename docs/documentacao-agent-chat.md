# Documentação do Agent Chat

## Visão Geral

O Agent Chat é uma aplicação web que permite aos usuários interagir com modelos de linguagem da OpenAI através de uma interface de chat simples e intuitiva. A aplicação foi desenvolvida utilizando o framework Next.js e integra-se com a API da OpenAI para processar mensagens e gerar respostas.

## Tecnologias Utilizadas

- **Framework**: Next.js com App Router
- **Linguagem**: TypeScript
- **Integração com IA**: OpenAI API via SDK (@ai-sdk/openai)
- **Biblioteca de streaming**: AI.js (ai)
- **Estilização**: CSS nativo com classes utilitárias (similar ao Tailwind CSS)

## Estrutura do Projeto

A aplicação segue a estrutura do App Router do Next.js:

```
apps/agent-chat/
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── route.ts         # API endpoint para comunicação com OpenAI
│   │   ├── components/
│   │   │   ├── chat-window.tsx      # Componente principal da interface de chat
│   │   │   ├── input-box.tsx        # Componente de entrada de texto
│   │   │   ├── message.tsx          # Componente de exibição de mensagens
│   │   │   └── contadoresduplos.tsx # Componente auxiliar
│   │   ├── layout.tsx               # Layout da aplicação
│   │   └── page.tsx                 # Página principal
│   ├── package.json                 # Dependências e scripts
│   └── tsconfig.json                # Configuração do TypeScript
```

## Componentes Principais

### ChatWindow

O `ChatWindow` é o componente central da aplicação, responsável por:

- Gerenciar o estado das mensagens entre usuário e assistente
- Controlar o estado de carregamento durante a comunicação com a API
- Enviar mensagens para o endpoint da API
- Processar o stream de resposta do assistente
- Exibir mensagens e status de erro

O componente utiliza hooks como `useState` para gerenciamento de estado, `useRef` para referências a elementos DOM e `useEffect` para efeitos colaterais como rolagem automática.

### InputBox

O componente `InputBox` é responsável pela entrada de texto do usuário:

- Gerencia o estado do campo de texto
- Controla a habilitação/desabilitação do botão de envio
- Processa eventos de teclado (como envio por Enter)
- Valida entrada antes do envio

### Message

Um componente simples para exibição de mensagens, diferenciando visualmente entre mensagens do usuário e do assistente através de estilos condicionais.

## API

### /api/agent (POST)

Este endpoint é responsável pela comunicação com a API da OpenAI:

- Recebe as mensagens do cliente no formato adequado
- Verifica a configuração da chave da API
- Cria um stream de texto utilizando o SDK da OpenAI
- Processa a resposta como stream para exibição em tempo real
- Implementa tratamento de erros em diferentes níveis

## Fluxo de Dados

1. O usuário digita uma mensagem no `InputBox`
2. Ao enviar, o `ChatWindow` adiciona a mensagem à lista e atualiza o estado
3. Uma requisição POST é enviada para `/api/agent` com todas as mensagens anteriores
4. O endpoint processa a requisição e inicia um stream de resposta da OpenAI
5. Conforme os chunks de resposta são recebidos, o `ChatWindow` atualiza a mensagem do assistente
6. A interface rola automaticamente para mostrar a nova mensagem

## Tratamento de Erros

A aplicação implementa tratamento de erros em múltiplos níveis:

- **Frontend**: Captura e exibe erros de rede ou resposta da API
- **Backend**: Valida configurações, trata erros de comunicação com a OpenAI
- **Logs**: Extensivo sistema de logs para depuração em console

## Configuração

Para utilizar a aplicação, é necessário configurar uma chave de API válida da OpenAI:

1. Crie um arquivo `.env.local` na raiz do projeto agent-chat
2. Adicione sua chave de API no formato:
   ```
   OPENAI_API_KEY=sk-sua-chave-aqui
   ```

## Executando o Projeto

Para executar o projeto localmente:

```bash
# Na raiz do monorepo
pnpm run dev:agent

# OU diretamente no diretório do agent-chat
cd apps/agent-chat
pnpm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Limitações Conhecidas

- A aplicação depende de uma chave de API válida da OpenAI
- Não possui sistema de autenticação de usuários
- Não armazena histórico de conversas entre sessões

## Possíveis Melhorias Futuras

- Implementação de autenticação de usuários
- Armazenamento de histórico de conversas
- Suporte a mais modelos de IA além da OpenAI
- Personalização da interface pelo usuário
- Adição de recursos como exportação de conversas
