# Arquitetura do Monorepo Kodix

## 📖 Visão Geral

Este diretório contém toda a documentação de arquitetura, padrões e guias de desenvolvimento do projeto Kodix.

> **🎯 OBJETIVO:** Manter uma fonte única de verdade para decisões arquiteturais, garantindo consistência, qualidade e manutenibilidade em todo o monorepo.

---

## 🚨 **Leitura Crítica Obrigatória**

### **[>> 📖 Lições Aprendidas de Arquitetura <<](./lessons-learned.md)**

**Este documento é o mais importante para prevenir erros.** Ele centraliza as falhas críticas que já ocorreram, suas causas raízes e, mais importante, as ações preventivas para garantir que não se repitam.

**A leitura e consulta deste documento são obrigatórias antes de iniciar qualquer desenvolvimento ou refatoração significativa.**

---

## 📚 Índice Principal

| Documento                                                            | Descrição                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **[🚀 Padrões Arquiteturais Oficiais](./Architecture_Standards.md)** | **PONTO DE PARTIDA.** Padrões de tecnologias, arquivos, tRPC, e scripts. |
| **[🏗️ Arquitetura de SubApps](./subapp-architecture.md)**            | Como SubApps são estruturados, se comunicam e são configurados.          |
| **[⚙️ Configurações de SubApps](./subapp-configurations-system.md)** | Detalhes do sistema de configuração por time e usuário.                  |
| **[↔️ Dependências Entre SubApps](./subapp-inter-dependencies.md)**  | Regras de comunicação e dependências entre os SubApps.                   |
| **[📝 Guias de Desenvolvimento](./development-setup.md)**            | Guias para setup, backend, frontend, tRPC, etc.                          |
| **[💾 Banco de Dados](../database/)**                                | Documentação completa sobre o schema, migrations e Drizzle.              |
| **[🐛 Debug & Logs](../debug/)**                                     | Políticas e registros de logs para todo o monorepo.                      |
| **[🧪 Testes](../tests/)**                                           | Estratégias e guias para testes de unidade, integração e E2E.            |

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

| Objetivo                    | Documento                                                                         |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Setup de ambiente**       | [Development Setup](./development-setup.md)                                       |
| **Trabalhar com SubApps**   | [SubApp Architecture](./subapp-architecture.md) **🚨 CRÍTICO**                    |
| **Documentar SubApps**      | [SubApp Documentation Guide](./subapp-documentation-guide.md) **📚 CONSOLIDADO!** |
| **Desenvolver backend**     | [Backend Guide](./backend-guide.md)                                               |
| **Desenvolver frontend**    | [Frontend Guide](./frontend-guide.md)                                             |
| **Padrões de código**       | [Coding Standards](./coding-standards.md)                                         |
| **Sistema de debug**        | [Debug & Logging Standards](./debug-logging-standards.md) 🔍 **FILTRAGEM FÁCIL!** |
| **Setup de traduções**      | [Internationalization](./internationalization-i18n.md)                            |
| **Ver scripts disponíveis** | [Scripts Reference](./scripts-reference.md)                                       |

---

## ⚠️ **Importante**

- **SubApp Architecture** é a **fonte única de verdade** para tudo relacionado a SubApps
- **Sempre consulte** a documentação antes de implementar novas funcionalidades
- **Mantenha** a documentação atualizada ao fazer mudanças significativas
