# 📋 Padrão de Documentação de Testes por SubApp

## 📖 Visão Geral

Este documento define o **padrão para documentar testes específicos** de cada SubApp no Kodix, seguindo o modelo bem-sucedido estabelecido pelo Chat SubApp com seu documento `testing-complete.md`.

## 🎯 Objetivo do Padrão

### Por que Documentar Testes por SubApp?

1. **Especificidade**: Cada SubApp tem características únicas que merecem documentação específica
2. **Autonomia**: Desenvolvedores podem entender rapidamente como testar um SubApp específico
3. **Histórico**: Registrar decisões técnicas, migrações e otimizações específicas
4. **Onboarding**: Facilitar entrada de novos desenvolvedores no SubApp
5. **Manutenção**: Documentar configurações específicas e casos especiais

## 🏗️ Estrutura Padrão do Documento

### Localização

```
docs/subapps/[subapp-name]/
├── README.md                    # Visão geral do SubApp
├── testing-complete.md          # 📋 DOCUMENTO DE TESTES (este padrão)
├── backend-architecture.md     # Arquitetura específica
└── (outros docs específicos)
```

### Template de Estrutura

```markdown
# 🧪 Testes CI - [SubApp Name]

## 📖 Visão Geral

[Contexto específico do SubApp e suas características de teste]

## 🚀 Comandos Rápidos de Teste

[Comandos padronizados: pnpm test:[subapp]]

## 🧪 Estrutura de Testes

[Tipos de teste específicos do SubApp]

## 📊 Métricas de Cobertura

[Métricas específicas e metas]

## 🚨 Verificações Críticas

[Testes críticos específicos do SubApp]

## 🔄 Integração com CI/CD

[Configurações específicas de CI]

## 🔗 Recursos Relacionados

[Links para documentação específica]

## 🎉 Conclusão

[Status atual e próximos passos]
```

## ✅ Exemplo de Implementação: Chat SubApp

### Documento de Referência

O Chat SubApp possui o documento `docs/subapps/chat/testing-complete.md` que serve como **exemplo perfeito** deste padrão:

**📍 Localização**: `docs/subapps/chat/testing-complete.md`

### Características que Fazem Dele um Exemplo de Sucesso

#### 1. **Contexto Específico Documentado**

```markdown
## 📖 Visão Geral

Este documento detalha a **suíte completa de testes CI** para o Chat SubApp após a
**remoção 100% do sistema legacy**. O sistema agora usa exclusivamente o **Vercel AI SDK**.
```

#### 2. **Comandos Padronizados Destacados**

````markdown
## 🚀 Comandos Rápidos de Teste

### **Execução com Um Comando** ⭐ **PADRÃO RECOMENDADO**

```bash
pnpm test:chat
```
````

#### 3. **Estrutura de Testes Específica**

```markdown
## 🧪 Estrutura de Testes

### 1. **Testes de Configuração** (`ci-config.test.ts`)

### 2. **Testes de Service Layer** (`service-layer.test.ts`)

### 3. **Testes de Streaming** (`streaming.test.ts`)

### 4. **Testes do Adapter** (`vercel-ai-adapter.test.ts`)
```

#### 4. **Métricas Específicas**

```markdown
## 📊 Métricas de Cobertura

- ✅ `vercel-ai-adapter.ts` - 95%+ cobertura
- ✅ `service-layer handlers` - 90%+ cobertura
```

#### 5. **Verificações Críticas do SubApp**

```markdown
## 🚨 Verificações Críticas

### **1. Remoção Legacy Confirmada**

### **2. Auto-Save Integrado**

### **3. Isolamento por Team**
```

#### 6. **Integração com Documentação Geral**

```markdown
### **Documentação de Testes Geral** ⭐ **NOVA REFERÊNCIA**

- **[📚 Testing Architecture](../../tests/README.md)**
- **[🧪 SubApp Testing Guide](../../tests/subapp-testing-guide.md)**
```

## 📋 Quando Criar Este Documento

### Critérios para Criação

1. **SubApp tem testes implementados** (pelo menos comandos básicos)
2. **Características específicas** que merecem documentação própria
3. **Configurações especiais** de CI/CD ou setup
4. **Histórico de migrações** ou decisões técnicas importantes
5. **Casos de teste únicos** não cobertos pela documentação geral

### Não Criar Se

- SubApp ainda não tem testes implementados
- Testes são muito simples e genéricos
- Não há características específicas para documentar

## 🎯 Elementos Obrigatórios

### Seções Essenciais

1. **📖 Visão Geral**

   - Contexto específico do SubApp
   - Link para execução simples (`pnpm test:[subapp]`)

2. **🚀 Comandos Rápidos**

   - Comando principal destacado
   - Comandos opcionais (coverage, watch, ui)

3. **🧪 Estrutura de Testes**

   - Tipos de teste específicos
   - Arquivos e responsabilidades

4. **🔗 Recursos Relacionados**
   - Links para documentação geral de testes
   - Links para docs específicos do SubApp

### Seções Opcionais (Conforme Necessidade)

- **📊 Métricas de Cobertura** (se houver metas específicas)
- **🚨 Verificações Críticas** (se houver testes críticos únicos)
- **🔄 Integração com CI/CD** (se houver configurações especiais)
- **📈 Métricas de Qualidade** (se houver dados de before/after)

## 🎨 Padrões de Escrita

### Tom e Linguagem

- **Específico**: Foque nas características únicas do SubApp
- **Prático**: Comandos e exemplos claros
- **Contextual**: Explique o "porquê" das decisões específicas
- **Integrado**: Sempre referencie a documentação geral

### Formatação

- Use emojis para seções principais (🧪 🚀 📊 🔗)
- Destaque comandos com ⭐ **PADRÃO RECOMENDADO**
- Use checkboxes ✅ para listas de verificação
- Code blocks com syntax highlighting

## 📚 Referências e Links

### Documentação Geral Sempre Referenciada

Todos os documentos devem linkar para:

```markdown
### **Documentação de Testes Geral**

- **[📚 Testing Architecture](../../tests/README.md)** - Arquitetura completa
- **[🧪 SubApp Testing Guide](../../tests/subapp-testing-guide.md)** - Guia específico
- **[📋 Chat Testing Example](../../tests/chat-testing-example.md)** - Exemplo de referência
```

### Links Específicos do SubApp

```markdown
### **Documentação do SubApp**

- **[README Principal](./README.md)** - Visão geral
- **[Backend Architecture](./backend-architecture.md)** - Arquitetura específica
- **[Known Issues](./known-issues.md)** - Problemas conhecidos
```

## ✅ Checklist de Implementação

### Antes de Criar o Documento

- [ ] SubApp tem testes funcionais implementados
- [ ] Comando `pnpm test:[subapp]` está configurado e funcionando
- [ ] Existem características específicas para documentar
- [ ] Documentação geral de testes está atualizada

### Durante a Criação

- [ ] Seguir estrutura padrão definida
- [ ] Incluir seções obrigatórias
- [ ] Referenciar documentação geral
- [ ] Usar formatação consistente
- [ ] Testar todos os comandos documentados

### Após a Criação

- [ ] Adicionar link no README do SubApp
- [ ] Verificar se links funcionam corretamente
- [ ] Validar com equipe do SubApp
- [ ] Manter atualizado conforme mudanças

## 🎯 Próximos Passos

### SubApps Candidatos para Documentação

Baseado na análise atual, os seguintes SubApps são candidatos para este tipo de documentação quando tiverem testes implementados:

1. **AI Studio** - Tem documentação extensa, seria bom candidato
2. **Calendar** - Quando implementar testes específicos
3. **Kodix Care Web** - Quando implementar testes específicos
4. **Todo** - Quando implementar testes específicos
5. **Cupom** - Quando implementar testes específicos

### Implementação Futura

Quando implementar testes em novos SubApps:

1. **Implementar testes** seguindo [SubApp Testing Guide](./subapp-testing-guide.md)
2. **Configurar comandos** seguindo padrão `pnpm test:[subapp]`
3. **Criar documento** seguindo este padrão
4. **Referenciar** na documentação geral

---

**🚀 Com este padrão, cada SubApp terá documentação de testes específica, clara e integrada ao ecossistema geral de documentação!**
