# Plano de Implementação: Integração DB do ConfigurationService (v7 - Auditado)

**Data:** 2025-07-01  
**Autor:** KodixAgent  
**Status:** ✅ Proposta Validada e Auditada  
**Escopo:** Finalizar a implementação do `ConfigurationService` no `@kdx/core-engine`.

**Documentos de Arquitetura Obrigatórios:**

- `docs/architecture/lessons-learned.md`
- `docs/architecture/Architecture_Standards.md`
- `docs/debug/kodix-logs-policy.md`

---

## 1. Resumo Executivo

Após múltiplas e rigorosas reavaliações, este plano foi forjado para garantir uma execução à prova de falhas. Ele adota uma metodologia inspirada em **Test-Driven Development (TDD)**, incorpora as políticas de **debug e logging** e adiciona uma fase final de **auditoria de impacto sistêmico**, representando nosso padrão mais alto de planejamento.

O objetivo é conectar o `ConfigurationService` ao banco de dados, habilitando a busca de configurações de Time (Nível 2) e Usuário (Nível 3).

### Objetivos

1.  **Provar a Falha:** Criar um teste que falhe na compilação.
2.  **Corrigir a Resolução de Módulos:** Expor os repositórios do `@kdx/db` de forma segura.
3.  **Reativar a Lógica de Banco de Dados:** Implementar a busca real por configurações.
4.  **Validar a Correção:** Garantir que o teste passe e expandir a cobertura de testes.
5.  **Auditar o Impacto:** Verificar se a mudança na API pública do `@kdx/db` não causa efeitos colaterais em outros pacotes.
6.  **Garantir a Limpeza:** Assegurar que nenhum log de depuração temporário seja deixado no código.

---

## 2. 🚦 Princípios Orientadores (Checklist Pré-voo)

A execução deste plano é regida pelas seguintes lições aprendidas:

- **[✅] (Análise) Lição #12 - Resolução de Módulos:** A análise confirmou que `@kdx/db/index.ts` não exporta os repositórios.
- **[ ] (TDD) Prova de Falha:** Criaremos um teste que falha antes de qualquer correção.
- **[ ] (Validação) Lição #6 - Validação Incremental:** Após CADA passo, `pnpm typecheck --filter` será executado.
- **[ ] (Responsabilidade) Auditoria Sistêmica:** Validaremos o impacto da mudança em TODOS os pacotes consumidores, não apenas nos diretamente envolvidos.
- **[ ] (Logging) Política de Logs:** Qualquer log de debug seguirá a política, sendo prefixado e registrado.
- **[ ] (Contingência) Lição #3 do AI Studio:** O plano de limpeza de cache está pronto se erros de tipo persistirem.
- **[ ] (Validação Final) Lição #9 - Validação em Runtime:** O sucesso só será declarado após a execução do fluxo completo de `stop -> start-bg -> check-log-errors -> check-dev-status`.

---

## 3. Checklist de Implementação Detalhado

### **Fase 0: Análise e Verificação (Concluída)**

- **[✅]** `packages/db/src/index.ts` inspecionado.
- **[✅]** `packages/db/src/repositories/index.ts` inspecionado.

### **Fase 1: Escrever um Teste que Falha (TDD)**

1.  **[ ] Criar Estrutura de Teste:** Criar o diretório `.../__tests__` se necessário, e o arquivo `configuration.service.test.ts`.
2.  **[ ] Escrever Teste de Falha:** No arquivo, importar `appRepository` de `@kdx/db`.
3.  **[ ] Validar Falha:** Executar `pnpm typecheck --filter=@kdx/core-engine`. **DEVE FALHAR** com `Cannot find module`.

### **Fase 2: Implementação da Solução**

1.  **[ ] Expor Repositórios no `@kdx/db`:** Adicionar `export * from "./repositories";` ao final de `packages/db/src/index.ts`.
2.  **[ ] Validar Build do `@kdx/db`:** Executar `pnpm build --filter=@kdx/db`.
3.  **[ ] Corrigir Import e Reativar Lógica no `@kdx/core-engine`:** No `configuration.service.ts`, corrigir o `import` e descomentar a lógica de busca no banco.

### **Fase 3: Validação da Correção e Testes**

1.  **[ ] Validar Correção:** `pnpm typecheck --filter=@kdx/core-engine` **DEVE PASSAR**.
2.  **[ ] Expandir Testes de Unidade:** Mockar `@kdx/db` e testar os cenários de merge.
3.  **[ ] Executar Testes do Pacote:** `pnpm test --filter=@kdx/core-engine` deve passar.

### **Fase 4: Auditoria de Impacto Sistêmico**

1.  **[ ] Mapear Consumidores:** Executar `grep -r 'from "@kdx/db"' packages/ apps/` para listar todos os pacotes que dependem do `@kdx/db`.
2.  **[ ] Validar Tipagem de Todos os Consumidores:** Para cada pacote encontrado no passo anterior, executar `pnpm typecheck --filter=<package-name>`.
3.  **[ ] Validação Final em Runtime:** Executar a sequência completa `stop`, `start-bg`, `sleep`, `check-log-errors`, e `check-dev-status`.

### **Fase 5: Debugging e Cleanup (Contingência)**

1.  **[ ] Adicionar e Registrar Logs:** Se necessário, adicionar logs com prefixo `[DEBUG_CORE_ENGINE]` e registrá-los em `docs/debug/logs-registry.md`.
2.  **[ ] Remover Logs:** Após a validação da Fase 4, remover todos os logs de debug.
3.  **[ ] Atualizar Registro:** Marcar os logs como `🟢 Removido` no registro.

---

## 4. Métricas de Sucesso

- O teste que falhava na Fase 1 agora passa na Fase 3.
- O `ConfigurationService` funciona conforme o esperado.
- A suíte de testes valida a lógica.
- **Nenhum pacote no monorepo apresenta novos erros de tipo após a mudança.**
- A aplicação (`apps/kdx`) funciona sem regressões.
- Nenhum log de depuração temporário é deixado para trás.
