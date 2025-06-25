# Kodix Care Web - Documentação

O **Kodix Care Web** é a versão web do módulo de gestão clínica, integrada ao kdx para oferecer funcionalidades de cuidados de saúde através da aplicação web principal.

## 🏥 Sobre o Kodix Care Web

O subapp Kodix Care Web oferece:

- **Gestão de Pacientes**: Cadastro e acompanhamento via web
- **Prontuários Eletrônicos**: Versão web dos registros médicos
- **Agendamentos**: Interface web para gestão de consultas
- **Integração**: Sincronização com o app móvel Kodix Care

## 🚀 Localização no Código

```
apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/
```

## 🩺 Funcionalidades Principais

### Gestão de Pacientes

- Cadastro completo de pacientes via web
- Histórico médico e acompanhamento
- Busca e filtros avançados
- Exportação de relatórios

### Prontuários Digitais

- Interface web para criação de prontuários
- Anexos e documentos médicos
- Histórico de consultas e tratamentos
- Compartilhamento seguro de informações

### Agendamento Web

- Calendário integrado para profissionais de saúde
- Gestão de horários e disponibilidade
- Confirmações e lembretes automáticos
- Relatórios de ocupação

### Integração Cross-Platform

- Sincronização com o app móvel (care-expo)
- Dados compartilhados em tempo real
- Backup e redundância de informações
- API comum com a versão móvel

## 🔄 Diferenças da Versão Móvel

| Funcionalidade   | Web                    | Móvel         |
| ---------------- | ---------------------- | ------------- |
| Interface        | Desktop-first          | Mobile-first  |
| Relatórios       | Completos e detalhados | Resumidos     |
| Entrada de dados | Formulários extensos   | Quick inputs  |
| Visualização     | Multi-tela             | Single-screen |

## 🔗 Documentação Relacionada

Para mais informações:

- `docs/apps/care-mobile/` - **Aplicação móvel** Kodix Care (React Native/Expo)
- `docs/subapps/calendar/` - Sistema de agendamento (SubApp)
- `docs/architecture/` - Arquitetura geral, desenvolvimento backend e frontend
- `docs/ui-catalog/` - Componentes de UI e design system
- `docs/database/` - Esquemas de banco de dados
- `docs/development-setup.md` - Configuração do ambiente
- `docs/architecture/coding-standards.md` - Práticas de desenvolvimento
- `docs/architecture/backend-guide.md` - Implementação backend

### Diferença entre Versões

- **Esta documentação** (`docs/subapps/kodix-care-web/`): SubApp web integrado ao kdx
- **Kodix Care Móvel** (`docs/apps/care-mobile/`): Aplicação móvel React Native/Expo

## 📖 Status da Documentação

Esta seção está preparada para receber documentação específica do Kodix Care Web conforme novas funcionalidades forem desenvolvidas ou documentadas.
