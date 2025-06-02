# Documentação de Arquitetura

## 📖 Visão Geral

Esta seção contém **guias técnicos** e **padrões de desenvolvimento** para o projeto Kodix.

## 🏗️ Guias Principais

### **📚 Guias de Desenvolvimento**

- **[Development Setup](./development-setup.md)** - Setup do ambiente de desenvolvimento
- **[Backend Guide](./backend-guide.md)** - Desenvolvimento backend com tRPC e Drizzle
- **[Frontend Guide](./frontend-guide.md)** - Desenvolvimento frontend com Next.js e React
- **[Scripts Reference](./scripts-reference.md)** - 📋 Referência completa de scripts do projeto

### **🎯 SubApp Architecture**

- **[SubApp Architecture](./subapp-architecture.md)** - **🚨 FONTE ÚNICA DE VERDADE**
  - 🏗️ Arquitetura e padrões fundamentais
  - 🔒 Regras de isolamento entre apps (CRÍTICAS)
  - ⚙️ Sistema de configurações por team (AppTeamConfig)
  - 🚀 Processo completo de criação de novos SubApps

### **📋 Padrões e Convenções**

- **[Coding Standards](./coding-standards.md)** - Padrões de código e convenções
- **[Internationalization](./internationalization-i18n.md)** - Setup de i18n e traduções
- **[Workflows](./workflows.md)** - Git workflows e processos

### **🔗 Comunicação e Dependências**

- **[SubApp Inter-Dependencies](./subapp-inter-dependencies.md)** - Padrões específicos para comunicação entre SubApps (legacy/específico)

## 🚀 Fluxos de Trabalho por Objetivo

### **Para Novos Desenvolvedores**

1. **OBRIGATÓRIO**: Leia [Development Setup](./development-setup.md)
2. **OBRIGATÓRIO**: Leia [SubApp Architecture](./subapp-architecture.md) se for trabalhar com SubApps
3. Consulte [Coding Standards](./coding-standards.md) para padrões de código

### **Para Criar Nova Funcionalidade**

1. **OBRIGATÓRIO**: Leia [SubApp Architecture](./subapp-architecture.md) se envolver SubApps
2. Use [Backend Guide](./backend-guide.md) para APIs
3. Use [Frontend Guide](./frontend-guide.md) para interfaces
4. Consulte [SubApp Architecture](./subapp-architecture.md) se for criar novos módulos

### **Para Trabalhar com Banco de Dados**

1. Veja [Database Documentation](../database/) para schemas e migrations
2. Use [Backend Guide](./backend-guide.md) para repositórios e queries

### **Para Setup de Ambiente**

1. Siga [Development Setup](./development-setup.md)
2. Use [Scripts Reference](./scripts-reference.md) para comandos disponíveis

## 📋 Referência Rápida

| Objetivo                    | Documento                                                      |
| --------------------------- | -------------------------------------------------------------- |
| **Setup de ambiente**       | [Development Setup](./development-setup.md)                    |
| **Trabalhar com SubApps**   | [SubApp Architecture](./subapp-architecture.md) **🚨 CRÍTICO** |
| **Desenvolver backend**     | [Backend Guide](./backend-guide.md)                            |
| **Desenvolver frontend**    | [Frontend Guide](./frontend-guide.md)                          |
| **Padrões de código**       | [Coding Standards](./coding-standards.md)                      |
| **Setup de traduções**      | [Internationalization](./internationalization-i18n.md)         |
| **Ver scripts disponíveis** | [Scripts Reference](./scripts-reference.md)                    |

---

## ⚠️ **Importante**

- **SubApp Architecture** é a **fonte única de verdade** para tudo relacionado a SubApps
- **Sempre consulte** a documentação antes de implementar novas funcionalidades
- **Mantenha** a documentação atualizada ao fazer mudanças significativas
