# User Guide - AI Studio SubApp

## 📋 Visão Geral

Este guia completo cobre tudo que você precisa saber para usar o AI Studio: configuração inicial, gestão de funcionalidades e resolução de problemas. O AI Studio é o centro de controle para recursos de IA, permitindo configurar provedores, modelos, agentes e bibliotecas de conhecimento.

---

# 🚀 Configuração Inicial

## Primeiros Passos

### 1. Acessar AI Studio

```bash
# Executar o projeto
pnpm dev:kdx

# Acessar: http://localhost:3000/apps/aiStudio
```

### 2. Configurar Instruções da Equipe

1. A primeira seção é **Team Instructions**
2. Configure instruções globais que se aplicarão a toda equipe
3. Defina o escopo (apenas Chat ou todos os apps)
4. Use o preview para verificar como aparecerá para a IA

### 3. Configurar Tokens de API

1. Vá para a seção **Tokens**
2. Crie provedores primeiro em **Provedores** se necessário
3. Adicione suas chaves de API reais:
   - OpenAI: `sk-...`
   - Anthropic: `sk-ant-...`
   - Google: API key do Google AI
4. Os tokens são criptografados automaticamente

### 4. Ativar Modelos para sua Equipe

1. Vá para a seção **Modelos Habilitados**
2. Toggle os modelos que sua equipe deve poder usar
3. Defina um modelo padrão usando os radio buttons
4. Use drag & drop para reorganizar prioridades
5. Teste conectividade dos modelos

### 5. Criar Agentes Personalizados

1. Vá para a seção **Agentes**
2. Crie assistentes personalizados
3. Configure instruções específicas para cada agente
4. Opcionalmente associe a bibliotecas de conhecimento

### 6. Configurar Bibliotecas de Conhecimento

1. Vá para a seção **Bibliotecas**
2. Crie bibliotecas para organizar conhecimento
3. Configure metadados de arquivos (formato JSON)
4. Associe bibliotecas aos agentes

## Seções da Interface

### Seções Principais (Uso Diário)

#### Team Instructions

- **Propósito**: Configurar comportamento global da IA para toda equipe
- **Configurações**: Conteúdo das instruções, escopo de aplicação
- **Uso**: Definir personalidade ou regras gerais dos assistentes

#### Tokens

- **Propósito**: Gerenciar chaves de API dos provedores
- **Configurações**: Tokens criptografados por provedor
- **Uso**: Habilitar acesso aos modelos de IA

#### Modelos Habilitados

- **Propósito**: Controlar quais modelos sua equipe pode usar
- **Configurações**: Toggle por modelo, modelo padrão, prioridades
- **Uso**: Balancear custo vs capacidade

#### Agentes

- **Propósito**: Criar assistentes especializados
- **Configurações**: Nome, instruções, biblioteca associada
- **Uso**: Ter diferentes "personalidades" de IA para diferentes tarefas

#### Bibliotecas

- **Propósito**: Organizar conhecimento para os agentes
- **Configurações**: Nome, metadados dos arquivos
- **Uso**: Contextualizar agentes com conhecimento específico

### Configuração Geral (Alterações Menos Frequentes)

#### Provedores

- **Propósito**: Configurar provedores de IA disponíveis
- **Configurações**: Nome, URL base
- **Uso**: Adicionar novos provedores ou configurar URLs customizadas

#### Modelos (Sistema)

- **Propósito**: Configurar modelos globais disponíveis no sistema
- **Configurações**: Nome, provedor, configurações JSON
- **Uso**: Adicionar novos modelos ou ajustar configurações globais

## Fluxo Recomendado de Configuração

### Para Nova Equipe

1. **Configure Provedores** (se não existirem)

   - Adicione OpenAI, Anthropic, Google, etc.

2. **Configure Tokens**

   - Adicione tokens reais para os provedores desejados

3. **Configure Team Instructions**

   - Defina comportamento geral da IA para sua equipe

4. **Ative Modelos**

   - Toggle modelos que sua equipe deve usar
   - Defina modelo padrão

5. **Crie Bibliotecas** (opcional)

   - Configure conhecimento específico

6. **Crie Agentes** (opcional)
   - Assistentes especializados para diferentes tarefas

### Para Equipe Existente

1. **Revise Team Instructions**

   - Ajuste comportamento conforme necessário

2. **Gerencie Modelos Ativos**

   - Ative/desative conforme necessidades atuais
   - Ajuste prioridades

3. **Atualize Agentes**
   - Refine instruções dos agentes existentes

---

# 🏢 Gestão de Provedores

## Provedores Suportados

### OpenAI

- **Modelos**: GPT-4, GPT-3.5, DALL-E
- **Configurações**: Base URL customizável
- **Tokens**: Chave de API começando com `sk-`

### Anthropic

- **Modelos**: Claude 3 (Opus, Sonnet, Haiku)
- **Configurações**: Versão da API
- **Tokens**: Chave de API específica

### Google AI

- **Modelos**: Gemini Pro, Gemini Ultra
- **Configurações**: Região e projeto
- **Tokens**: API Key do Google Cloud

### Azure OpenAI

- **Modelos**: Deployments customizados
- **Configurações**: Resource name, deployment ID
- **Tokens**: Chave de API do Azure

## Funcionalidades

### Criar Provedor

1. Acesse a seção **Provedores**
2. Clique em **Adicionar Provedor**
3. Preencha:
   - **Nome**: Identificador único
   - **URL Base**: Endpoint customizado (opcional)

### Gerenciar Provedores

- **Editar**: Alterar nome e configurações
- **Excluir**: Remove provedor e modelos associados

### Configurações Avançadas

#### URLs Customizadas

```json
{
  "baseUrl": "https://api.openai.com/v1"
}
```

#### Proxy Configuration

```json
{
  "baseUrl": "https://proxy.company.com/openai",
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

## Segurança

### Isolamento por Team

- Cada equipe tem seus próprios provedores
- Não há compartilhamento entre equipes
- Configurações independentes

### Validação

- Nomes únicos por equipe
- URLs no formato correto

## Boas Práticas

### Nomenclatura

- Use nomes descritivos: "OpenAI Produção", "Anthropic Dev"
- Indique ambiente: "GPT-4 Staging"
- Seja consistente na equipe

### Organização

- Desative provedores não utilizados
- Agrupe por tipo de uso
- Documente configurações especiais

### Manutenção

- Revise provedores periodicamente
- Remova configurações obsoletas
- Atualize versões de API

---

# 🧠 Gestão de Modelos

## Visão Geral

O sistema de modelos permite configurar e gerenciar diferentes modelos de IA disponíveis nos provedores. Cada modelo tem características específicas como limites de tokens, custos e capacidades.

## Gestão de Modelos

### Ativar/Desativar Modelos

1. Acesse **Modelos Habilitados**
2. Localize o modelo desejado
3. Use o toggle para ativar/desativar
4. Mudanças refletem imediatamente

### Configurar Parâmetros

#### Limites de Tokens

- **Input**: Máximo de tokens de entrada
- **Output**: Máximo de tokens de resposta
- **Total**: Limite combinado (contexto)

#### Configurações Avançadas

```json
{
  "temperature": 0.7,
  "top_p": 1.0,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

### Sistema de Prioridade

- **Alta Prioridade (90-100)**: Modelos preferenciais
- **Média Prioridade (50-89)**: Uso regular
- **Baixa Prioridade (1-49)**: Fallback

## Modelos Populares

### GPT-4 (OpenAI)

- **Tokens**: 128k contexto
- **Uso**: Tarefas complexas, raciocínio
- **Custo**: Alto

### Claude 3 Opus (Anthropic)

- **Tokens**: 200k contexto
- **Uso**: Análise de documentos longos
- **Custo**: Alto

### Gemini Pro (Google)

- **Tokens**: 32k contexto
- **Uso**: Multimodal, velocidade
- **Custo**: Médio

### GPT-3.5 Turbo (OpenAI)

- **Tokens**: 16k contexto
- **Uso**: Tarefas gerais, chat
- **Custo**: Baixo

## Configurações por Equipe

### Modelo Padrão

1. Defina prioridades nos modelos
2. Sistema seleciona o de maior prioridade ativo
3. Fallback automático se indisponível

### Filtros e Organização

- Filtrar por provedor
- Buscar por nome
- Ordenar por prioridade

## Casos de Uso

### Para Chat Geral

```json
{
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Para Código

```json
{
  "model": "claude-3-sonnet",
  "temperature": 0.3,
  "max_tokens": 4000
}
```

### Para Análise

```json
{
  "model": "gpt-4-turbo",
  "temperature": 0.5,
  "max_tokens": 8000
}
```

## Considerações de Custo

### Otimização

- Use modelos menores para tarefas simples
- Configure limites de tokens apropriados
- Monitore uso por modelo

### Estimativas

- **GPT-3.5**: ~$0.002/1k tokens
- **GPT-4**: ~$0.03/1k tokens
- **Claude**: Varia por tier

## Boas Práticas

### Seleção de Modelo

- Combine capacidade com custo
- Teste diferentes modelos
- Documente casos de uso

### Configuração

- Comece com defaults
- Ajuste baseado em resultados
- Mantenha consistência

### Manutenção

- Revise modelos não utilizados
- Atualize limites conforme necessário
- Monitore novos lançamentos

---

# 💡 Dicas de Configuração

### Para Desenvolvimento

- Use **GPT-3.5 Turbo** como padrão (mais barato)
- Configure **instruções da equipe** para contexto de desenvolvimento
- Ative poucos modelos para reduzir complexidade

### Para Produção

- Configure múltiplos modelos para fallback
- Use **Claude 3.5 Sonnet** ou **GPT-4o** como padrão
- Configure agentes específicos para diferentes casos de uso

### Para Economia

- Ative apenas modelos essenciais
- Use **GPT-4o Mini** como padrão
- Configure instruções para respostas mais concisas

---

# 🚨 Troubleshooting

## Problemas Críticos

### 1. Limite de Caracteres em System Prompts

**Sintoma**: Erro ao salvar agentes com prompts muito longos.

**Causa**: Campo TEXT no banco tem limite prático de 65,535 caracteres.

**Workaround**:

- Manter prompts abaixo de 60,000 caracteres
- Dividir instruções complexas em múltiplos agentes
- Usar referências externas quando necessário

**Status**: Em análise - possível migração para LONGTEXT.

### 2. Cache de Modelos Desatualizado

**Sintoma**: Mudanças em modelos não refletem imediatamente no Chat.

**Causa**: Cache Redis com TTL de 5 minutos.

**Workaround**:

- Aguardar 5 minutos após alterações
- Limpar cache manualmente se urgente
- Recarregar página do Chat

**Status**: Planejado sistema de invalidação de cache.

## Problemas Moderados

### 1. Validação de Configuração JSON nos Modelos

**Sintoma**: Usuários podem inserir JSON inválido nas configurações de modelos.

**Causa**: Editor de texto simples sem validação em tempo real.

**Workaround**:

- Validar JSON manualmente antes de salvar
- Usar ferramentas externas para validar sintaxe
- Consultar documentação dos provedores

**Status**: Planejado editor JSON com validação em tempo real.

### 2. Bibliotecas sem Upload Real de Arquivos

**Sintoma**: Seção de bibliotecas aceita apenas metadados JSON, não arquivos reais.

**Causa**: Funcionalidade de upload ainda não implementada.

**Workaround**:

- Hospedar arquivos externamente
- Referenciar URLs nos metadados JSON
- Usar serviços de armazenamento em nuvem

**Status**: Sistema de upload em desenvolvimento.

### 3. Sincronização entre Team Instructions e Chat

**Sintoma**: Mudanças nas instruções da equipe nem sempre refletem imediatamente no Chat.

**Causa**: Cache de sessão no Chat pode manter instruções antigas.

**Workaround**:

- Criar nova sessão de chat após alterações
- Recarregar página do Chat
- Aguardar alguns minutos para cache expirar

**Status**: Melhorias na sincronização em análise.

## Problemas Menores

### 1. Descrições de Modelos Truncadas

**Sintoma**: Descrições longas cortadas nos cards.

**Causa**: Limite visual para manter layout consistente.

**Workaround**:

- Hover para ver descrição completa
- Manter descrições concisas

**Status**: Tooltip com texto completo planejado.

### 2. Sem Histórico de Alterações

**Sintoma**: Não é possível ver quem/quando alterou configurações.

**Causa**: Sistema de auditoria não implementado.

**Workaround**:

- Documentar mudanças importantes
- Usar logs do servidor

**Status**: Sistema de auditoria em roadmap.

## Problemas de Integração

### 1. Integração Drag & Drop em Mobile

**Sintoma**: Reordenação de modelos por prioridade difícil em dispositivos móveis.

**Causa**: Drag & drop não otimizado para touch.

**Workaround**:

- Usar dispositivo desktop para reordenar
- Aguardar implementação de controles alternativos
- Usar prioridades numéricas quando disponível

**Status**: Controles touch-friendly em desenvolvimento.

### 2. Tokens Compartilhados Entre Teams

**Sintoma**: Cada team precisa adicionar próprios tokens.

**Causa**: Isolamento de segurança por design.

**Workaround**:

- Documentar tokens para cada team
- Usar cofre de senhas compartilhado

**Status**: Funcionando como esperado - não é bug.

## Performance

### 1. Carregamento Inicial Lento

**Sintoma**: Página demora para carregar com muitos recursos.

**Causa**: Carrega todos os dados de uma vez.

**Workaround**:

- Desativar recursos não utilizados
- Limpar dados antigos periodicamente

**Status**: Lazy loading em desenvolvimento.

### 2. Operações em Lote

**Sintoma**: Não é possível ativar/desativar múltiplos modelos.

**Causa**: Interface opera item por item.

**Workaround**:

- Usar scripts SQL para operações em massa
- Planejar mudanças com antecedência

**Status**: Operações em lote no roadmap.

## Segurança

### 1. Rotação de Tokens Manual

**Sintoma**: Não há lembretes para rotacionar tokens.

**Causa**: Sistema de expiração não implementado.

**Workaround**:

- Criar lembretes manuais
- Política de rotação trimestral

**Status**: Sistema de expiração planejado.

## Interface

### 1. Responsividade em Mobile

**Sintoma**: Algumas funcionalidades difíceis de usar em telas pequenas.

**Causa**: Interface otimizada para desktop.

**Workaround**:

- Usar modo desktop no mobile
- Acessar via tablet/PC quando possível

**Status**: Melhorias mobile em backlog.

### 2. Sem Modo Claro

**Sintoma**: Apenas tema escuro disponível.

**Causa**: Priorização de outras features.

**Workaround**:

- Ajustar brilho da tela
- Usar extensões de browser

**Status**: Tema claro em consideração.

## Migrações e Atualizações

### 1. Migração de Dados Legados

**Sintoma**: Dados antigos podem ter formato incompatível.

**Causa**: Mudanças no schema ao longo do tempo.

**Workaround**:

- Executar scripts de migração
- Recriar recursos se necessário

**Status**: Scripts de migração disponíveis.

---

# 🚨 Problemas Comuns e Soluções

## "Modelo não aparece no Chat"

1. Verifique se está ativo em **Modelos Habilitados**
2. Confirme se há token configurado para o provedor
3. Teste o modelo usando o botão de teste

## "Token inválido"

1. Verifique o formato do token
2. Confirme se o token tem as permissões necessárias
3. Use o teste de modelo para validar

## "Agente não funciona como esperado"

1. Revise as instruções do agente
2. Verifique se a biblioteca associada está correta
3. Teste com instruções mais específicas

## Provedor não aparece nos modelos

- Verifique se está ativado
- Confirme se tem modelos cadastrados
- Recarregue a página

## Erro ao criar provedor

- Nome pode estar duplicado
- Verifique formato das URLs
- Confirme tipo válido

## Configurações não salvam

- Valide formato JSON
- Verifique permissões
- Tente logout/login

## Modelo não aparece no Chat

- Confirme que está ativo
- Verifique se provedor tem token
- Aguarde cache atualizar (5 min)

## Erro de limite de tokens

- Reduza max_tokens
- Use modelo com maior contexto
- Divida requisições grandes

## Performance lenta

- Considere modelo mais rápido
- Ajuste temperatura (menor = mais rápido)
- Use streaming quando possível

---

# 🔄 Manutenção Regular

## Semanal

- Revisar uso de modelos
- Verificar custos por modelo
- Ajustar prioridades conforme necessário

## Mensal

- Atualizar tokens conforme políticas de segurança
- Revisar e otimizar instruções da equipe
- Limpar agentes não utilizados

## Trimestral

- Avaliar novos modelos disponíveis
- Revisar configurações globais
- Documentar melhores práticas da equipe

---

# 📋 Como Reportar Novos Problemas

1. **Verificar** se o problema já está listado
2. **Reproduzir** o erro consistentemente
3. **Documentar** passos para reprodução
4. **Incluir** logs relevantes
5. **Sugerir** workaround se conhecido

## Prioridades de Correção

- **P0**: Problemas que impedem uso do sistema
- **P1**: Problemas que afetam funcionalidade core
- **P2**: Problemas que têm workaround viável
- **P3**: Melhorias de qualidade de vida

A equipe revisa e prioriza correções regularmente baseado em impacto e frequência.

---

Este guia fornece uma base sólida para configurar e manter o AI Studio de forma eficiente e segura. Mantenha-o como referência durante o uso diário da plataforma.
