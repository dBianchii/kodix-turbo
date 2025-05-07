# Documentação do SubApp Agent (Kodix)

## Visão Geral

O SubApp Agent é um componente integrado à aplicação principal Kodix que fornece uma interface de chat para interação com modelos de linguagem da OpenAI. Desenvolvido como parte da estrutura do Kodix, este subapp segue os padrões de arquitetura e design do sistema principal, enquanto implementa a funcionalidade de chat com IA.

## Tecnologias Utilizadas

- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Integração com IA**: OpenAI API via SDK (@ai-sdk/openai)
- **Biblioteca de streaming**: AI.js (ai)
- **Estilização**: Tailwind CSS
- **Internacionalização**: next-intl (integrado com a estrutura do Kodix)

## Estrutura do Projeto

O subapp segue a estrutura de roteamento aninhado do Next.js App Router, localizado dentro da aplicação Kodix:

```
apps/kdx/src/app/[locale]/(authed)/apps/agent/
├── _components/
│   ├── chat-window.tsx         # Componente principal da interface de chat
│   ├── input-box.tsx           # Componente de entrada de texto
│   ├── message.tsx             # Componente de exibição de mensagens
│   └── .DS_Store               # Arquivo de sistema (macOS)
├── page.tsx                    # Página principal do subapp
└── .DS_Store                   # Arquivo de sistema (macOS)

apps/kdx/src/app/api/agent/
└── route.ts                    # API endpoint para comunicação com OpenAI
```

## Componentes Principais

### ChatWindow

O `ChatWindow` é o componente central do subapp, responsável por:

- Gerenciar o estado das mensagens entre usuário e agente
- Controlar o estado de carregamento durante a comunicação com a API
- Enviar mensagens para o endpoint da API
- Processar o stream de resposta do agente
- Exibir mensagens e status de erro

O componente mantém a interface visual consistente com o estilo do Kodix, utilizando classes Tailwind para estilização e um design floating para a caixa de entrada.

### InputBox

O componente `InputBox` é responsável pela entrada de texto do usuário:

- Gerencia o estado do campo de texto
- Controla a habilitação/desabilitação do botão de envio
- Processa eventos de teclado (como envio por Enter)
- Valida entrada antes do envio
- Fornece feedback visual baseado no estado (habilitado/desabilitado)

### Message

Um componente de apresentação que exibe mensagens individuais, diferenciando visualmente entre mensagens do usuário e do agente com estilos condicionais:

- Mensagens do usuário aparecem alinhadas à direita com fundo azul
- Mensagens do agente aparecem alinhadas à esquerda com fundo cinza
- Mantém o estilo consistente com a identidade visual do Kodix

## API

### /api/agent (POST)

Este endpoint é implementado usando as APIs de rota do Next.js e é responsável pela comunicação com a OpenAI:

- Recebe as mensagens do cliente e valida o formato
- Verifica a configuração da chave da API da OpenAI
- Mapeia o formato "agent" para "assistant" para compatibilidade com a OpenAI
- Utiliza a biblioteca Vercel AI SDK para criar um stream de texto
- Processa a resposta como stream para exibição em tempo real
- Implementa tratamento de erros em diferentes níveis

## Fluxo de Dados

1. O usuário digita uma mensagem no `InputBox` e a envia
2. O `ChatWindow` adiciona a mensagem do usuário à lista e atualiza o estado
3. Uma requisição POST é enviada para `/api/agent` com todas as mensagens anteriores
4. O endpoint processa a requisição, mapeia os formatos e inicia um stream de resposta da OpenAI
5. Conforme os chunks de resposta são recebidos, o `ChatWindow` atualiza incrementalmente a mensagem do agente
6. A interface rola automaticamente para mostrar a nova mensagem
7. Após a conclusão, o estado de carregamento é desativado e a entrada de texto é habilitada novamente

## Tratamento de Erros

O subapp implementa um sistema robusto de tratamento de erros em múltiplos níveis:

- **Frontend**: Captura e exibe erros de rede ou resposta da API na interface
- **Backend**: Valida configurações e formatos, tratando erros de comunicação com a OpenAI
- **Feedback visual**: Indicadores de erro e carregamento para melhor experiência do usuário
- **Logs**: Sistema de logs detalhado no console para depuração

## Integração com o Kodix

O SubApp Agent integra-se ao ecossistema Kodix de várias formas:

- Utiliza o sistema de roteamento baseado em localização (`[locale]`) do Kodix
- Segue a estrutura de autenticação com rotas protegidas (`(authed)`)
- Mantém consistência visual com a interface principal do Kodix
- Compartilha o mesmo ambiente e configurações de variáveis

## Configuração

Para utilizar o subapp, é necessário configurar uma chave de API válida da OpenAI:

1. Adicione a chave da API OpenAI no arquivo `.env` na raiz do projeto:

   ```
   OPENAI_API_KEY=sk-sua-chave-aqui
   ```

2. A variável estará disponível tanto para o desenvolvimento local quanto para ambientes de produção

## Acessando o SubApp

O SubApp Agent pode ser acessado através da rota:

```
/[idioma]/apps/agent
```

Por exemplo, para o idioma português: `/pt-BR/apps/agent`

## Possíveis Melhorias Futuras

- **Personalização**: Opções para personalizar a aparência e comportamento do chat
- **Histórico de conversas**: Armazenamento e recuperação de conversas anteriores
- **Múltiplos modelos**: Suporte a outros modelos de IA além do padrão da OpenAI
- **Suporte a mídia**: Capacidade de processar e exibir imagens ou outros formatos de mídia
- **Analytics**: Rastreamento de uso e desempenho para melhorias contínuas
- **Integração com APIs Kodix**: Conectar o chat com outros serviços do ecossistema Kodix
